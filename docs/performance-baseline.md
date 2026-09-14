# Performance baseline

Sampled locally on 2026-09-14T00:37:32.590Z with installed Google Chrome, Vite development server, 1280×900 viewport, and synthetic demo data.

| Route | DOMContentLoaded (ms) | Load (ms) | Resources | Transferred (bytes) | JS heap (MB) | Heavy resources |
|---|---:|---:|---:|---:|---:|---|
| login | 137 | 141 | 50 | 2701001 | 9 | 0 |
| doctor dashboard | 137 | 141 | 81 | 2983908 | 13 | 0 |
| imaging | 41 | 42 | 103 | 2400136 | 21 | 4 |
| 3D | 46 | 47 | 74 | 245504 | 25 | 4 |

- Twenty alternating imaging/overview switches took 2043 ms.
- JS heap after switching: 16 MB.
- Heavy imaging/3D resources requested by route: imaging /node_modules/.vite/deps/dicom-parser.js?v=084ce23c, /node_modules/.vite/deps/three.js?v=084ce23c, /node_modules/.vite/deps/three_examples_jsm_controls_OrbitControls__js.js?v=084ce23c, /node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js?v=084ce23c, 3D /node_modules/.vite/deps/three.js?v=084ce23c, /node_modules/.vite/deps/three_examples_jsm_controls_OrbitControls__js.js?v=084ce23c, /node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js?v=084ce23c, /node_modules/.vite/deps/three_examples_jsm_environments_RoomEnvironment__js.js?v=084ce23c.

This is a development-server baseline, not a production/CDN measurement. Production performance should be sampled from the built bundle with HTTP caching enabled.
