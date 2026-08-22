from __future__ import annotations

import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path
from shutil import which


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

if os.name == "nt":
    DEFAULT_PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
else:
    DEFAULT_PYTHON = ROOT / ".venv" / "bin" / "python"

PYTHON_EXECUTABLE = DEFAULT_PYTHON if DEFAULT_PYTHON.exists() else Path(sys.executable)

if not PYTHON_EXECUTABLE.exists():
    raise SystemExit(f"Python executable not found: {PYTHON_EXECUTABLE}")

if which("npm") is None:
    raise SystemExit("npm is not available on PATH. Install Node.js/npm before running this script.")

BACKEND_CMD = [str(PYTHON_EXECUTABLE), "-m", "uvicorn", "backend.app.main:app", "--reload", "--port", "8000"]
FRONTEND_CMD = "npm run dev -- --host 0.0.0.0" if os.name == "nt" else ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

processes: list[subprocess.Popen[str]] = []


def stream_output(name: str, process: subprocess.Popen[str]) -> None:
    assert process.stdout is not None
    for line in iter(process.stdout.readline, ""):
        print(f"[{name}] {line}", end="")


def start_process(name: str, cmd: str | list[str], cwd: Path) -> subprocess.Popen[str]:
    display_cmd = cmd if isinstance(cmd, str) else " ".join(cmd)
    print(f"Starting {name}: {display_cmd}")
    process = subprocess.Popen(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=isinstance(cmd, str),
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
        env=os.environ,
    )
    if process.stdout is None:
        raise SystemExit(f"Failed to capture stdout for {name}")

    thread = threading.Thread(target=stream_output, args=(name, process), daemon=True)
    thread.start()
    return process


def shutdown() -> None:
    print("Shutting down services...")
    for proc in processes:
        if proc.poll() is None:
            try:
                if os.name == "nt":
                    proc.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    proc.terminate()
            except Exception:
                proc.kill()

    for proc in processes:
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()


def main() -> None:
    print("Running AI Budget Advisor stack...")
    print(f"Backend dir: {BACKEND_DIR}")
    print(f"Frontend dir: {FRONTEND_DIR}")
    print(f"Python executable: {PYTHON_EXECUTABLE}")

    backend_proc = start_process("backend", BACKEND_CMD, ROOT)
    frontend_proc = start_process("frontend", FRONTEND_CMD, FRONTEND_DIR)
    processes.extend([backend_proc, frontend_proc])

    def handle_signal(signum, frame):
        shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    if os.name != "nt":
        signal.signal(signal.SIGTERM, handle_signal)

    try:
        while True:
            if backend_proc.poll() is not None:
                print("Backend process exited. Shutting down frontend.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process exited. Shutting down backend.")
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        shutdown()


if __name__ == "__main__":
    main()
