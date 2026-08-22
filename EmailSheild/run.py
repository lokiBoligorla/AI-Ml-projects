import os
import sys
import subprocess
import time
import signal

def run_services():
    print("=================================================================")
    print("               EMAILSHIELD SYSTEM STARTER                       ")
    print("=================================================================")
    print("Initializing Flask Backend and Vite Frontend concurrently...")
    
    # Absolute paths
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    
    # 1. Start backend process
    print("[SYSTEM] Launching Flask Backend on http://127.0.0.1:5000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=backend_dir,
        stdout=None,
        stderr=None
    )
    
    # Give the backend a second to bind to port 5000
    time.sleep(2)
    
    # 2. Start frontend process
    print("[SYSTEM] Launching React+Vite Frontend on http://localhost:5173...")
    # On Windows, npm is npm.cmd, so we set shell=True to find it correctly in the Path
    use_shell = os.name == 'nt'
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"
    
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
        shell=use_shell,
        stdout=None,
        stderr=None
    )
    
    print("\n[SUCCESS] Both modules launched successfully!")
    print(" -> Frontend: http://localhost:5173")
    print(" -> Backend:  http://127.0.0.1:5000")
    print("Press CTRL+C to terminate both servers and release ports.\n")
    
    try:
        # Keep master thread alive
        while True:
            time.sleep(1)
            # Check if any process terminated unexpectedly
            if backend_proc.poll() is not None:
                print("[ERROR] Flask Backend terminated unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("[ERROR] Vite Frontend terminated unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\n[SYSTEM] Intercepted shut down command. Terminating services...")
    finally:
        # Graceful cleanup
        try:
            print("[CLEANUP] Stopping Frontend...")
            frontend_proc.terminate()
            frontend_proc.wait(timeout=3)
        except Exception:
            pass
            
        try:
            print("[CLEANUP] Stopping Backend...")
            backend_proc.terminate()
            backend_proc.wait(timeout=3)
        except Exception:
            pass
            
        print("[SUCCESS] All services stopped cleanly. Operations concluded.")

if __name__ == "__main__":
    run_services()
