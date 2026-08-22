import os
import io
import time
import tempfile
import wave
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

# Automatically configure static ffmpeg and ffprobe paths via static-ffmpeg
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
    print("[VoiceFlow] Successfully configured static ffmpeg and ffprobe paths via static-ffmpeg.")
except Exception as e:
    print(f"[VoiceFlow] static-ffmpeg auto-configuration failed: {e}")

app = FastAPI(title="VoiceFlow Backend Server")


# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the static files from the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return RedirectResponse(url="/static/index.html")

def get_wav_duration(file_bytes: bytes) -> float:
    """Extracts duration from standard WAV bytes using the built-in wave module."""
    try:
        with wave.open(io.BytesIO(file_bytes), 'rb') as wav:
            frames = wav.getnframes()
            rate = wav.getframerate()
            if rate > 0:
                return frames / float(rate)
    except Exception as e:
        print(f"Error reading WAV headers: {e}")
    return 0.0

def convert_to_wav(file_bytes: bytes, original_filename: str) -> tuple[bytes, float]:
    """
    Converts uploaded audio bytes (MP3, M4A, etc.) to WAV using pydub.
    If ffmpeg is missing, raises an HTTPException explaining the situation.
    """
    ext = os.path.splitext(original_filename.lower())[1].replace('.', '')
    if not ext:
        ext = "mp3"  # default fallback

    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(io.BytesIO(file_bytes), format=ext)
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        wav_bytes = wav_io.getvalue()
        duration = len(audio) / 1000.0  # pydub length is in ms
        return wav_bytes, duration
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Server dependency error: 'pydub' is not configured properly."
        )
    except Exception as e:
        # Check if it looks like an ffmpeg missing error
        err_msg = str(e)
        if "FileNotFoundError" in err_msg or "ffmpeg" in err_msg.lower() or "ffprobe" in err_msg.lower() or "winerror 2" in err_msg.lower() or "[errno 2]" in err_msg.lower():
            raise HTTPException(
                status_code=400,
                detail=(
                    f"To transcribe uploaded .{ext} files, the server requires 'ffmpeg' to be installed. "
                    "Please record directly via your browser microphone (which outputs native WAV) "
                    "or upload a pre-converted WAV file."
                )
            )
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process audio file: {err_msg}"
        )

@app.post("/api/transcribe")
async def transcribe(
    file: UploadFile,
    engine: str = Form("google"),
    language: str = Form("en-US"),
    openai_key: str = Form(None)
):
    start_time = time.time()
    file_bytes = await file.read()
    
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Determine if file is WAV or needs conversion
    filename = file.filename or "recording.wav"
    is_wav = filename.lower().endswith(".wav")

    wav_bytes = None
    duration = 0.0

    if is_wav:
        wav_bytes = file_bytes
        duration = get_wav_duration(file_bytes)
        if duration == 0.0:
            # Fallback estimation: 16kHz 16-bit Mono is 32KB/sec
            duration = len(file_bytes) / 32000.0
    else:
        # Attempt conversion using pydub (requires ffmpeg)
        wav_bytes, duration = convert_to_wav(file_bytes, filename)

    text = ""

    # Engine 1: Google Speech Recognition (Default, Free)
    if engine == "google":
        try:
            import speech_recognition as sr
            r = sr.Recognizer()
            
            # Load from in-memory bytes
            with sr.AudioFile(io.BytesIO(wav_bytes)) as source:
                audio_data = r.record(source)
                
            lang_code = language if language != "auto" else "en-US"
            # google uses standard web speech recognition API
            text = r.recognize_google(audio_data, language=lang_code)
        except sr.UnknownValueError:
            text = ""  # No speech detected
        except sr.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Google Speech Recognition service error: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Google Transcription engine error: {str(e)}")

    # Engine 2: OpenAI API (Cloud Whisper)
    elif engine == "openai_api":
        # Get api key from form or environment
        api_key = openai_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="OpenAI API Key is required. Please paste it in the settings panel or set it in the environment."
            )
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            
            # Send file to OpenAI Whisper API
            # Whisper API expects a file-like object with a valid extension name
            lang_param = {}
            if language and language != "auto":
                # OpenAI takes ISO 639-1 language code (e.g. 'en', 'es')
                lang_param["language"] = language.split("-")[0]

            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=(filename if filename.endswith((".wav", ".mp3", ".m4a")) else "audio.wav", io.BytesIO(wav_bytes), "audio/wav"),
                **lang_param
            )
            text = transcript.text
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"OpenAI Whisper API error: {str(e)}")

    # Engine 3: Local Whisper Model (Offline CPU/GPU)
    elif engine == "whisper_local":
        try:
            import whisper
        except ImportError:
            raise HTTPException(
                status_code=400,
                detail="Local Whisper is not installed on the server. Please run 'pip install openai-whisper torch' to use this offline engine."
            )
        
        try:
            # We save the WAV bytes to a temporary file since local whisper needs a file path
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(wav_bytes)
                tmp_path = tmp.name

            try:
                # Load the tiny model (only 70MB, downloads quickly, light memory footprint)
                model = whisper.load_model("tiny")
                
                options = {}
                if language and language != "auto":
                    options["language"] = language.split("-")[0]
                
                result = model.transcribe(tmp_path, fp16=False, **options)
                text = result.get("text", "")
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Local Whisper model error: {str(e)}")

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported transcription engine: {engine}")

    return {
        "text": text.strip(),
        "duration": duration,
        "engine": engine,
        "status": "success"
    }

if __name__ == "__main__":
    import uvicorn
    # Start server on local port 8001 to avoid port 8000 sharing conflicts on Windows
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=True)
