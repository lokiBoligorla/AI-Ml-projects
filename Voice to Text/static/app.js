// VoiceFlow UI Controller

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const engineSelect = document.getElementById('engineSelect');
    const openaiKeyGroup = document.getElementById('openaiKeyGroup');
    const openaiKey = document.getElementById('openaiKey');
    const languageSelect = document.getElementById('languageSelect');
    
    // Recording Elements
    const recordBtn = document.getElementById('recordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const recordTimer = document.getElementById('recordTimer');
    const waveformCanvas = document.getElementById('waveformCanvas');
    
    // Upload Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileDetails = document.getElementById('fileDetails');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const transcribeFileBtn = document.getElementById('transcribeFileBtn');
    
    // Results Elements
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const transcriptText = document.getElementById('transcriptText');
    const copyBtn = document.getElementById('copyBtn');
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    
    // Metric Elements
    const valDuration = document.getElementById('valDuration');
    const valWords = document.getElementById('valWords');
    const valLatency = document.getElementById('valLatency');
    const valSpeed = document.getElementById('valSpeed');
    
    // Toast Element
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');

    // State Variables
    let isRecording = false;
    let audioContext = null;
    let scriptProcessor = null;
    let mediaStream = null;
    let audioBuffers = [];
    let recordInterval = null;
    let startTime = null;
    let selectedFile = null;
    let analyser = null;
    let animationFrameId = null;
    let sourceNode = null;
    let canvasCtx = waveformCanvas.getContext('2d');

    // Initialize waveform canvas dimension
    function resizeCanvas() {
        waveformCanvas.width = waveformCanvas.parentElement.clientWidth * window.devicePixelRatio;
        waveformCanvas.height = waveformCanvas.parentElement.clientHeight * window.devicePixelRatio;
        canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial flat wave drawing
    function drawIdleWave() {
        if (isRecording) return;
        
        const width = waveformCanvas.width / window.devicePixelRatio;
        const height = waveformCanvas.height / window.devicePixelRatio;
        
        canvasCtx.clearRect(0, 0, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height / 2);
        
        // Draw a gentle idle wave
        const time = Date.now() * 0.004;
        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * 0.01 + time) * 2;
            canvasCtx.lineTo(x, y);
        }
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        animationFrameId = requestAnimationFrame(drawIdleWave);
    }
    drawIdleWave();

    // Show API Key field if OpenAI Cloud engine is selected
    engineSelect.addEventListener('change', () => {
        if (engineSelect.value === 'openai_api') {
            openaiKeyGroup.classList.remove('hidden');
        } else {
            openaiKeyGroup.classList.add('hidden');
        }
    });

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'recordTab') {
                resizeCanvas();
            }
        });
    });

    // Toast Notification System
    function showToast(message, type = 'info') {
        toastMessage.textContent = message;
        toast.className = 'toast'; // reset class
        if (type === 'success') {
            toast.style.borderColor = 'var(--accent-success)';
            toast.querySelector('i').className = 'fa-solid fa-circle-check';
        } else if (type === 'error') {
            toast.style.borderColor = 'var(--accent-danger)';
            toast.querySelector('i').className = 'fa-solid fa-triangle-exclamation';
        } else {
            toast.style.borderColor = 'var(--accent-primary)';
            toast.querySelector('i').className = 'fa-solid fa-circle-info';
        }
        
        toast.classList.remove('hidden');
        
        // Auto hide
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }

    // --- Recording Subsystem (Pure JS WAV Recorder) ---
    async function startRecording() {
        audioBuffers = [];
        isRecording = true;
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up Web Audio API
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            sourceNode = audioContext.createMediaStreamSource(mediaStream);
            sourceNode.connect(analyser);
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            cancelAnimationFrame(animationFrameId);
            
            function drawActiveWave() {
                if (!isRecording) return;
                
                const width = waveformCanvas.width / window.devicePixelRatio;
                const height = waveformCanvas.height / window.devicePixelRatio;
                
                analyser.getByteTimeDomainData(dataArray);
                
                canvasCtx.clearRect(0, 0, width, height);
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, height / 2);
                
                const sliceWidth = width / bufferLength;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0; // range 0 to 2
                    const y = (v * height) / 2;
                    
                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }
                    
                    x += sliceWidth;
                }
                
                canvasCtx.lineTo(width, height / 2);
                
                const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
                gradient.addColorStop(0, '#8b5cf6');
                gradient.addColorStop(1, '#06b6d4');
                
                canvasCtx.strokeStyle = gradient;
                canvasCtx.lineWidth = 3;
                canvasCtx.stroke();
                
                animationFrameId = requestAnimationFrame(drawActiveWave);
            }
            drawActiveWave();

            // Create ScriptProcessor to capture audio samples directly
            const bufferSize = 2048;
            scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
            sourceNode.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
            
            scriptProcessor.onaudioprocess = (e) => {
                if (!isRecording) return;
                const inputData = e.inputBuffer.getChannelData(0);
                // We must clone the Float32Array because it's a shared transient buffer
                audioBuffers.push(new Float32Array(inputData));
            };

            // Timer management
            startTime = Date.now();
            recordInterval = setInterval(() => {
                const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
                const mm = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
                const ss = String(secondsElapsed % 60).padStart(2, '0');
                recordTimer.textContent = `${mm}:${ss}`;
            }, 1000);

            // Toggle Buttons UI
            recordBtn.classList.add('hidden');
            stopRecordBtn.classList.remove('hidden');
            showToast('Microphone active. Recording in WAV...', 'success');

        } catch (err) {
            console.error('Error starting audio recording:', err);
            isRecording = false;
            showToast('Microphone access denied or unavailable.', 'error');
        }
    }

    function stopRecording() {
        if (!isRecording) return;
        
        isRecording = false;
        clearInterval(recordInterval);
        recordTimer.textContent = '00:00';
        
        recordBtn.classList.remove('hidden');
        stopRecordBtn.classList.add('hidden');

        // Stop all tracks on the stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }

        // Disconnect nodes
        if (scriptProcessor) scriptProcessor.disconnect();
        if (sourceNode) sourceNode.disconnect();
        
        // Compile the recorded WAV
        compileWavFile();

        // Shut down audio context
        if (audioContext) {
            audioContext.close();
        }
        
        // Revert to idle wave
        drawIdleWave();
    }

    function compileWavFile() {
        if (audioBuffers.length === 0) {
            showToast('No audio captured.', 'error');
            return;
        }

        // Calculate total length
        let totalLength = 0;
        for (let i = 0; i < audioBuffers.length; i++) {
            totalLength += audioBuffers[i].length;
        }

        // Merge all buffers
        const mergedBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (let i = 0; i < audioBuffers.length; i++) {
            mergedBuffer.set(audioBuffers[i], offset);
            offset += audioBuffers[i].length;
        }

        // Downsample to 16,000 Hz for optimal API usage
        const originalSampleRate = audioContext.sampleRate;
        const targetSampleRate = 16000;
        const downsampledBuffer = downsampleBuffer(mergedBuffer, originalSampleRate, targetSampleRate);

        // Encode as 16-bit PCM WAV Blob
        const wavBlob = encodeWavPCM(downsampledBuffer, targetSampleRate);
        processTranscription(wavBlob);
    }

    // Downsampling logic
    function downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
        if (inputSampleRate === outputSampleRate) {
            return buffer;
        }
        const sampleRateRatio = inputSampleRate / outputSampleRate;
        const newLength = Math.round(buffer.length / sampleRateRatio);
        const result = new Float32Array(newLength);
        let offsetResult = 0;
        let offsetBuffer = 0;
        while (offsetResult < result.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            let accum = 0;
            let count = 0;
            for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }
            result[offsetResult] = count > 0 ? accum / count : 0;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }
        return result;
    }

    // Standard WAV PCM encoder
    function encodeWavPCM(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 36 + samples.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw PCM) */
        view.setUint16(20, 1, true);
        /* channel count (mono) */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        // Float samples to 16-bit signed PCM
        let index = 44;
        for (let i = 0; i < samples.length; i++) {
            let s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            index += 2;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    recordBtn.addEventListener('click', startRecording);
    stopRecordBtn.addEventListener('click', stopRecording);

    // --- Upload Dropzone Subsystem ---
    dropZone.addEventListener('click', () => fileInput.click());

    // Highlight drop zone on drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.m4a') && !file.name.endsWith('.flac')) {
            showToast('Please select a valid audio file.', 'error');
            return;
        }
        
        selectedFile = file;
        fileName.textContent = file.name;
        
        // Convert bytes to readable string
        const sizeKB = file.size / 1024;
        if (sizeKB > 1024) {
            fileSize.textContent = `${(sizeKB / 1024).toFixed(2)} MB`;
        } else {
            fileSize.textContent = `${sizeKB.toFixed(1)} KB`;
        }
        
        dropZone.classList.add('hidden');
        fileDetails.classList.remove('hidden');
        showToast('Audio file loaded successfully.', 'success');
    }

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = null;
        fileInput.value = '';
        dropZone.classList.remove('hidden');
        fileDetails.classList.add('hidden');
    });

    transcribeFileBtn.addEventListener('click', () => {
        if (selectedFile) {
            processTranscription(selectedFile);
        }
    });

    // --- Core API Interface Subsystem ---
    async function processTranscription(audioBlob) {
        // Toggle view states
        emptyState.classList.add('hidden');
        transcriptText.classList.add('hidden');
        loadingState.classList.remove('hidden');
        
        // Disable action buttons
        copyBtn.disabled = true;
        downloadTxtBtn.disabled = true;
        downloadJsonBtn.disabled = true;

        // Reset metrics
        valDuration.textContent = '--';
        valWords.textContent = '--';
        valLatency.textContent = '--';
        valSpeed.textContent = '--';

        const startTimeFetch = performance.now();

        // Build FormData package
        const formData = new FormData();
        let filename = 'recording.wav';
        if (audioBlob instanceof File) {
            filename = audioBlob.name;
        }
        
        formData.append('file', audioBlob, filename);
        formData.append('engine', engineSelect.value);
        formData.append('language', languageSelect.value);
        
        if (engineSelect.value === 'openai_api' && openaiKey.value.trim()) {
            formData.append('openai_key', openaiKey.value.trim());
        }

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            const latency = ((performance.now() - startTimeFetch) / 1000).toFixed(2);
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to transcribe audio.');
            }

            const data = await response.json();
            
            // Populate output UI
            loadingState.classList.add('hidden');
            transcriptText.textContent = data.text || '(No speech detected)';
            transcriptText.classList.remove('hidden');
            
            // Update Metrics Card
            const duration = parseFloat(data.duration).toFixed(1);
            const wordCount = data.text ? data.text.trim().split(/\s+/).length : 0;
            const wpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;

            valDuration.textContent = `${duration}s`;
            valWords.textContent = wordCount;
            valLatency.textContent = `${latency}s`;
            valSpeed.textContent = `${wpm} wpm`;

            // Enable Actions
            copyBtn.disabled = false;
            downloadTxtBtn.disabled = false;
            downloadJsonBtn.disabled = false;

            showToast('Audio transcribed successfully!', 'success');

        } catch (err) {
            console.error('Transcription error:', err);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            showToast(err.message, 'error');
        }
    }

    // --- Action Button Events ---
    copyBtn.addEventListener('click', () => {
        const text = transcriptText.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Transcript copied to clipboard!', 'success');
        }).catch(err => {
            showToast('Failed to copy text.', 'error');
        });
    });

    downloadTxtBtn.addEventListener('click', () => {
        const text = transcriptText.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('TXT file downloaded.', 'success');
    });

    downloadJsonBtn.addEventListener('click', () => {
        const payload = {
            text: transcriptText.textContent,
            words: parseInt(valWords.textContent),
            duration: valDuration.textContent,
            latency: valLatency.textContent,
            speed: valSpeed.textContent,
            engine: engineSelect.value,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(payload, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('JSON file downloaded.', 'success');
    });
});

