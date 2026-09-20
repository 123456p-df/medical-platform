# Web soft-tissue simulation architecture

This module is a research and teaching demo. It is not intended for diagnosis, surgical planning, or real-world surgical guidance.

## A–D. Existing architecture and integration boundary

The repository already uses Vue 3, TypeScript, Vite, Pinia and Three.js in the browser, plus FastAPI, PostgreSQL, Docker and nginx on the server. The existing imaging pipeline already contains an NV-Segment-CTMR adapter, NIfTI affine/spacing handling, mask-to-surface extraction, smoothing/decimation and GLB export. These remain the source of segmentation and reusable preprocessing primitives.

New code is isolated under `src/simulation`, a small simulation Pinia store, a simulation view, and later a backend `simulations` domain. Existing patient, imaging, inference and report contracts are not replaced. NV-Segment-CTMR is not reimplemented. Existing large-blob database models are not extended for new GLB, NIfTI or physics streams; simulation assets belong in a mounted volume behind an asset-store abstraction.

## E. Target directories

```text
src/simulation/
  core/              SceneManager, ModelManager, BVH lifecycle
  interaction/       raycast and incision state machine
  cutting/           graph, geodesic preview, predicted seam topology
  deformation/       prediction manager
  physics/           predicted/authoritative state and reconciliation
  network/           WebSocket client and binary protocol
  workers/           geodesic and deformation workers
  types.ts
backend/app/
  api/routes/simulations.py
  services/simulation_manager.py
  services/simulation_assets.py
  simulation/sofa_worker.py
  simulation/protocol.py
simulation-data/{caseId}/manifest.json
simulation-data/{caseId}/{structureId}/visual.glb
simulation-data/{caseId}/{structureId}/physics.bin
simulation-data/{caseId}/{structureId}/binding.bin
```

## F. Browser–FastAPI–SOFA flow

Preprocessing is asynchronous: CT/MRI -> NV-Segment-CTMR label map -> cleaned visual surface -> lower-resolution tet mesh -> precomputed visual binding -> manifest. Runtime is: browser input -> immediate disposable prediction -> WebSocket control packet -> per-session SOFA worker -> authoritative delta/snapshot -> browser interpolation and reconciliation. SOFA alone advances authoritative topology. A browser opening before `CUT_COMMIT` is a prediction hint based on the current topology version.

## G–H. WebSocket and binary protocol

Control frames are JSON and contain `sessionId`, `objectId`, `sequenceNumber`, `simulationTick` and `topologyVersion`. Initial messages are `HELLO`, `START_SESSION`, `DRAG_START`, `DRAG_MOVE`, `DRAG_END`, `CUT_REQUEST`, `RESET`, `PAUSE`, `RESUME` and `RESYNC_REQUEST`. Operations based on a stale topology version are rejected and trigger resync.

High-frequency state frames are little-endian binary. The v1 32-byte header contains magic `VMSP`, protocol version, message type, flags, sequence, simulation tick, topology version, object-id length, section count and payload length. The UTF-8 object id is 4-byte aligned, followed by 20-byte section descriptors (`kind`, scalar width, component count, element count, byte offset, byte length). `STATE_DELTA` currently carries `Uint32 changedIndices` plus packed `Float32 xyz`. `FULL_SNAPSHOT` and `CUT_COMMIT` extend the same table with complete positions, triangles, tetrahedra and seam boundaries.

## I–J. Runtime state

The interaction state machine is `SELECT_FIRST_POINT -> SELECT_SECOND_POINT -> PREVIEW_CUT -> CUT_PENDING -> DRAG`, with `CUT_COMMITTED` reserved for a SOFA commit. Connection state is `DISCONNECTED -> CONNECTING -> SYNCING -> CONNECTED`, with `DESYNC` and `RECONNECTING` recovery paths.

Each object owns separate packed buffers:

```text
authoritativePositions: Float32Array
predictedPositions:     Float32Array
visualPositions:        Float32Array
authoritativeIndices:   Uint32Array
predictedTopologyHint:  nullable { positions, indices, basedOnTopologyVersion }
authoritativeSequence, simulationTick, topologyVersion
```

Small errors reconcile slowly; large errors reconcile faster. Old sequences are discarded. A topology mismatch suspends dependent interactions until a full authoritative snapshot is installed.

## K–L. Asset schemas

The manifest contains `schemaVersion`, `id`, `caseId`, `coordinateSystem`, `units`, optional `sourceToSimulation`, metadata and dynamic `structures[]`. A structure contains `id`, `name`, `labelId`, `type`, `visualMesh`, `physicsMesh`, `binding`, `nodeNames`, `deformable`, `visible`, `physicsMode`, material profile/render material, transform and metadata. No organ list is hard-coded.

Physics binary files use an aligned section table and packed arrays: `Float32 positions`, `Uint32 tetrahedra`, `Uint32 surfaceTriangles`. Binding files contain `Uint32 tetId` and four `Float32 barycentric weights` per visual vertex. Physics meshes are deliberately lower resolution than visual meshes. Tetrahedralization failure changes only that structure from `SOFT_BODY` to `KINEMATIC`.

## M–N. Coordinates and topology versions

Source NIfTI is interpreted through its affine in physical coordinates; voxel indices are never treated as millimetres. Preprocessing stores the explicit source-to-simulation matrix. The browser contract is glTF Y-up in metres. SOFA scenes consume the same metre-space assets, so no hand-tuned visual scaling is allowed.

Every object begins at `topologyVersion = 1`. Drag/control packets must match it. Only an authoritative `CUT_COMMIT` installs new vertices/triangles/tetrahedra/boundaries and increments the version. Local prediction never increments it. Disconnect enters `DESYNC`; reconnect requests a full snapshot before version-dependent operations resume.

## O–P. Delivery phases and acceptance

1. Browser vertical slice: dynamic manifest, independent structures, BVH selection, A/B surface points, Worker geodesic preview, disposable continuous seam opening, local membrane relaxation, Worker weighted drag, reset and automated geometry tests. The split rewires the complete incident triangle fan, rejects foldovers, and routes later clicks to the foremost uncut surface so exposed organs can be selected through a skin opening. Rendering must remain interactive and the prediction must be visibly labelled non-authoritative.
2. SOFA bridge: FastAPI session manager and one process per active session, initially using a tet cube/sphere. Browser drag must survive several minutes without NaN, leaks or severe jitter.
3. Prediction/reconciliation: separate buffers, deltas, sequence rejection, resync and 0/50/100/200 ms latency tests. Input feedback remains immediate at 100 ms RTT.
4. One real organ: liver visual/tet/binding pipeline, FEM drag/compression/release and automatic kinematic fallback.
5. Body composition: skin/body, bone and liver with visibility and collision staging.
6. Authoritative surface cutting: preview -> `CUT_REQUEST` -> SOFA `CUT_COMMIT` -> topology install -> seam drag.
7. Volume cutting: only after a tet-cube cut fixture passes bounds, manifold/boundary, stability and no-NaN tests.

The current implementation is Phase 1. Its seam split changes browser display topology for instant feedback, but the authoritative arrays and topology version remain unchanged in preparation for the SOFA gateway.
