"""Download checksum-pinned, public 3D Slicer CT/MRI samples and convert them to NIfTI.

Run with backend/.venv/Scripts/python.exe scripts/real-imaging-samples.py.
Conversion only supports these known embedded, scalar gzip NRRD fixtures.
Source: https://github.com/Slicer/Slicer/blob/main/Modules/Scripted/SampleData/SampleData.py
"""
import gzip
import hashlib
import json
import re
import urllib.request
from pathlib import Path

import nibabel as nib
import numpy as np

SAMPLES = {
    "CT-chest": "4507b664690840abb6cb9af2d919377ffc4ef75b167cb6fd0f747befdb12e38e",
    "MR-head": "cc211f0dfd9a05ca3841ce1141b292898b2dd2d3f08286affadf823a7e58df93",
}
ROOT = Path(__file__).resolve().parents[1] / ".cache" / "real-imaging"


def convert(path):
    header, payload = path.read_bytes().split(b"\n\n", 1)
    fields = dict(line.split(": ", 1) for line in header.decode().splitlines()
                  if ": " in line and not line.startswith("#"))
    assert fields["dimension"] == "3" and fields["encoding"] == "gzip"
    dtype = {"short": "i2", "unsigned short": "u2", "int": "i4", "float": "f4"}[fields["type"]]
    dtype = ("<" if fields.get("endian", "little") == "little" else ">") + dtype
    shape = tuple(map(int, fields["sizes"].split()))
    data = np.frombuffer(gzip.decompress(payload), dtype=dtype).reshape(shape, order="F")
    vectors = re.findall(r"\(([^)]+)\)", fields["space directions"])
    affine = np.eye(4)
    affine[:3, :3] = np.array([list(map(float, v.split(","))) for v in vectors]).T
    affine[:3, 3] = list(map(float, fields["space origin"].strip("()").split(",")))
    space = fields["space"]
    if space == "left-posterior-superior":
        affine = np.diag([-1, -1, 1, 1]) @ affine
    else:
        assert space == "right-anterior-superior", space
    image = nib.Nifti1Image(data, affine)
    image.header.set_xyzt_units("mm")
    target = path.with_suffix(".nii.gz")
    nib.save(image, target)
    canonical = nib.as_closest_canonical(image)
    return {"file": target.name, "shape": list(canonical.shape),
            "spacing": [float(v) for v in canonical.header.get_zooms()], "source_space": space}


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    report = []
    for name, checksum in SAMPLES.items():
        url = "https://github.com/Slicer/SlicerTestingData/releases/download/SHA256/" + checksum
        path = ROOT / (name + ".nrrd")
        if not path.exists():
            with urllib.request.urlopen(url, timeout=120) as response:
                data = response.read()
            if hashlib.sha256(data).hexdigest() != checksum:
                raise ValueError("Sample checksum mismatch")
            path.write_bytes(data)
        assert hashlib.sha256(path.read_bytes()).hexdigest() == checksum
        info = {"name": name, "source": url, "sha256": checksum, **convert(path)}
        report.append(info)
        print(json.dumps(info), flush=True)
    (ROOT / "manifest.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
