from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUN_PY = ROOT / "run.py"

if not RUN_PY.exists():
    raise SystemExit(f"Cannot find root run.py at {RUN_PY}")

os.execv(sys.executable, [sys.executable, str(RUN_PY)] + sys.argv[1:])
