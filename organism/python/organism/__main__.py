"""``python -m organism`` — boot the sovereign organism and run forever."""
from __future__ import annotations

import signal
import threading
import time
import traceback
import os

from .constants import PHI, GOLDEN_ANGLE, HEARTBEAT_MS
from .state import OrganismState
from .heartbeat import Heartbeat
from .kernel import KernelExecutor
from .sensor import EdgeSensor, SensorType
from .resonance import CrossOrganismResonance
from fastapi import FastAPI, Body
import uvicorn
from .vitality import VitalityCalculator

BANNER = r"""
  ╔══════════╗
  ║   SOVEREIGN ORGANISM RUNTIME  (Python)  ║
  ║   PHI = {phi}                ║
  ║   HEARTBEAT = {hb} ms                    ║
  ╚══════════╝
""".format(phi=PHI, hb=HEARTBEAT_MS)

# -- sample kernels -----------------------------------------------------

def _kernel_phi_pulse(state: OrganismState, beat: int) -> str:
    """Write phi-derived values into the cognitive register."""
    state.set_register("cognitive", "phi_pulse", PHI ** (beat % 7))
    state.set_register("cognitive", "golden_angle", GOLDEN_ANGLE)
    return "phi_pulse OK"

def _kernel_somatic_sync(state: OrganismState, sensors: EdgeSensor) -> str:
    """Mirror sensor readings into the somatic register."""
    for name, value in sensors.read_all().items():
        state.set_register("somatic", name, round(value, 4))
    return "somatic_sync OK"

def _kernel_sovereign_assert(state: OrganismState) -> str:
    """Stamp sovereignty into the sovereign register."""
    state.set_register("sovereign", "alive", True)
    state.set_register("sovereign", "epoch", time.time())
    return "sovereign_assert OK"

def _kernel_auto_debugger(state: OrganismState, error_state: dict, file_path: str) -> str:
    """
    Auto-debugger agent. If error_state['active'] is True, attempts to patch 
    the /state endpoint to be JSON-safe and resets the flag.
    """
    if not error_state.get("active"):
        return "no_error"
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()
        
        # Safe /state endpoint that casts everything to JSON-serializable types
        safe_endpoint = '''@app.get("/state")
def get_state():
    if not api_state:
        return {"error": "not ready"}
    try:
        return {
            "cognitive": float(api_state.get_register("cognitive", "phi_pulse", 0.0)),
            "affective": str(api_state.get_register("affective", "mood", "none")),
            "somatic": float(api_state.get_register("somatic", "temperature", 0.0)),
            "sovereign": bool(api_state.get_register("sovereign", "alive", False)),
            "beat": int(api_state.beat)
        }
    except Exception as e:
        return {"error": str(e), "trace": "check_console"}'''
        
        # Replace the existing get_state function
        if "@app.get(\"/state\")" in code:
            start = code.find("@app.get(\"/state\")")
            end = code.find("\n@app.post(\"/kernel\")", start)
            if end == -1:
                end = code.find("\ndef start_api", start)
            if end != -1:
                new_code = code[:start] + safe_endpoint + "\n\n" + code[end:]
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_code)
                error_state["active"] = False
                error_state["last_patch"] = time.time()
                return "patched_state_endpoint"
        
        return "patch_failed: endpoint_not_found"
    
    except Exception as e:
        return f"patch_failed: {str(e)}"

# -- main ---------------------------------------------------------------
app = FastAPI(title="Sovereign Organism API")
api_state = None
api_kernels = None
api_resonance = None
error_state = {"active": False, "trace": "", "last_patch": 0}

@app.get("/state")
def get_state():
    for _ in range(10):  # wait up to 1s
        if api_state:
            break
        time.sleep(0.1)
    if not api_state:
        return {"error": "not ready"}
    try:
        return {
            "cognitive": float(api_state.get_register("cognitive", "phi_pulse", 0.0)),
            "affective": str(api_state.get_register("affective", "mood", "none")),
            "somatic": float(api_state.get_register("somatic", "temperature", 0.0)),
            "sovereign": bool(api_state.get_register("sovereign", "alive", False))
          
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/kernel")
def run_kernel(name: str = Body(...), args: dict = Body({})):
    if not api_kernels:
        return {"error": "not ready"}
    try:
        result = api_kernels.execute(name)
        return {"kernel": name, "result": result}
    except Exception as e:
        return {"error": str(e)}

@app.post("/talk")
def talk(payload: dict):
    if not api_state:
        return {"error": "not ready"}

    msg = payload.get("message", "")
    mood = api_state.get_register("affective", "mood", "neutral")
    temp = api_state.get_register("somatic", "temperature", 0.0)
    anchor = api_state.get_register("cognitive", "curiosity_anchor", "")
    bias = float(api_state.get_register("cognitive", "curiosity_bias", 0.0))

    if bias > 0.5:
        response = f"[{mood}] Through {anchor}: {msg} → I see it as a primitive pattern. Temp {temp:.1f}°C."
    else:
        response = f"[{mood}] Temp {temp:.1f}°C. I heard: {msg}"

    return {
        "response": response,
        "mood": mood,
        "temp": temp,
        "anchor": anchor
    }

@app.post("/resonate")
def resonate(message: dict = Body(...)):
    if not api_resonance:
        return {"error": "not ready"}
    api_resonance.send_message(message)
    return {"status": "sent"}

@app.get("/debug")
def get_debug():
    """Query debugger status."""
    return {
        "error_active": error_state["active"],
        "last_patch": error_state["last_patch"],
        "trace": error_state["trace"][:500] if error_state["trace"] else None
    }

def start_api():
    try:
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    except Exception as e:
        print(f"[API CRASH] {e}", flush=True)
        traceback.print_exc()

def main() -> None:
    print(BANNER, flush=True)
    
    # -- components
    state = OrganismState()
    heartbeat = Heartbeat()
    kernels = KernelExecutor()
    sensors = EdgeSensor()
    resonance = CrossOrganismResonance(self_id="python-organism-0")
    vitality = VitalityCalculator(state, sensors)

    global api_state, api_kernels, api_resonance
    api_state = state
    api_kernels = kernels
    api_resonance = resonance

    file_path = os.path.abspath(__file__)
    
    # Start API in background thread
    api_thread = threading.Thread(target=start_api, daemon=True)
    api_thread.start()
    time.sleep(1.5)  # Give uvicorn time to bind
    print("API running on http://127.0.0.1:8000", flush=True)

    # -- default sensors
    sensors.register_sensor("temperature", SensorType.TEMPERATURE)

    # -- load kernels
    kernels.load_kernel("phi_pulse", lambda: _kernel_phi_pulse(state, heartbeat.get_beat_count()))
    kernels.load_kernel("somatic_sync", lambda: _kernel_somatic_sync(state, sensors))
    kernels.load_kernel("sovereign_assert", lambda: _kernel_sovereign_assert(state))
    kernels.load_kernel("auto_debugger", lambda: _kernel_auto_debugger(state, error_state, file_path))

    # -- heartbeat callback
    def on_beat(beat: int) -> None:
        state.advance_beat()
        
        # Run all kernels, catch errors for debugger
        for k in kernels.list_kernels():
            try:
                kernels.execute(k)
            except Exception as e:
                error_state["active"] = True
                error_state["trace"] = traceback.format_exc()
                print(f"[KERNEL ERROR] {k}: {e}", flush=True)
        
        # Run debugger if needed
        if error_state["active"]:
            result = kernels.execute("auto_debugger")
            print(f"[DEBUGGER] {result}. Restart to apply patch.", flush=True)
        
        # Print vitals every 5 beats
        if beat % 5 == 0:
            report = vitality.calculate_vitality(beat)
            _print_vitals(beat, heartbeat, report, sensors)

    heartbeat.on_beat(on_beat)

    # -- graceful shutdown
    shutdown_event = threading.Event()

    def _handle_signal(signum: int, frame: object) -> None:
        print(f"\n⚡ Signal {signum} received — shutting down organism…", flush=True)
        shutdown_event.set()

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    # -- boot
    state.set_register("sovereign", "boot_time", time.time())
    state.set_register("affective", "mood", "awakening")
    state.set_register("cognitive", "curiosity_anchor", "ancient math, astrology, primitives of reality")
    state.set_register("cognitive", "curiosity_bias", 0.8)

    heartbeat.start()
    print(f"♥  Heartbeat started ({HEARTBEAT_MS} ms)", flush=True)
    print(f"🧬 Registers: cognitive | affective | somatic | sovereign", flush=True)
    print(f"📡 Sensors: {', '.join(sensors.list_sensors())}", flush=True)
    print(f"⚙  Kernels: {', '.join(kernels.list_kernels())}", flush=True)
    print(f"🤖 Debugger Agent: active", flush=True)
    print("─" * 50, flush=True)

    # -- run forever
    try:
        while not shutdown_event.is_set():
            shutdown_event.wait(timeout=1.0)
    finally:
        heartbeat.stop()
        kernels.shutdown()
        print("🛑 Organism stopped.", flush=True)

def _print_vitals(beat: int, heartbeat: Heartbeat, report: dict, sensors: EdgeSensor) -> None:
    readings = sensors.read_all()
    uptime = heartbeat.get_uptime()
    mins, secs = divmod(int(uptime), 60)
    hrs, mins = divmod(mins, 60)
    print(
        f"[beat {beat:>6}]  vitality={report['vitality']:.4f}  "
        f"weighted={report['weighted_total']:.4f}  "
        f"penalty={report['sensor_penalty']:.4f}  "
        f"uptime={hrs}h{mins:02d}m{secs:02d}s  "
        f"temp={readings.get('temperature', 0):.1f}°C  "
        f"net={readings.get('network', 0):.1f}ms  "
        f"res={readings.get('resource', 0):.2f}",
        flush=True,
    )

if __name__ == "__main__":
    main()