/**
 * BISsetu - Robust Real-Time Voice Input Engine
 * Conforms to BISsetu Voice & Multilingual Specification
 * Supports all 23 official Indian languages with live search input reflection,
 * natural silence detection (1.5-2.5s), single-submit guarantee, and clean lifecycle.
 */
(function(window) {
  const VOICE_LANG_MAP = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    gu: 'gu-IN',
    ur: 'ur-IN',
    kn: 'kn-IN',
    or: 'or-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    as: 'as-IN',
    mai: 'hi-IN',
    mni: 'bn-IN',
    sa: 'sa-IN',
    sd: 'sd-IN',
    ks: 'ks-IN',
    kok: 'mr-IN',
    doi: 'hi-IN',
    ne: 'ne-NP',
    brx: 'hi-IN',
    sat: 'hi-IN'
  };

  class VoiceRecognitionEngine {
    constructor(config = {}) {
      this.inputElementId = config.inputElementId || 'desktop-query-input';
      this.btnElementId = config.btnElementId || 'desktop-btn-voice';
      this.modalElementId = config.modalElementId || null;
      this.statusElementId = config.statusElementId || null;
      this.transcriptElementId = config.transcriptElementId || null;
      this.searchBtnElementId = config.searchBtnElementId || null;
      this.onSubmit = config.onSubmit || null;
      this.silenceMs = config.silenceMs || 2000; // 2.0s within 1.5 - 2.5s range

      this.recognition = null;
      this.isListening = false;
      this.isRecognitionActive = false;
      this.hasSubmitted = false;
      this.manualStop = false;
      this.isManualStop = false;
      this.silenceTimer = null;
      this.sessionFinalTranscript = '';
      this.sessionCurrentTranscript = '';
      this.restartCount = 0;
      this.voiceRestartCount = 0;
      this.maxRestarts = 4;
      this.activeLang = 'en';
      this.voiceStartTime = 0;
      this.mediaStream = null;
      this.audioContext = null;
      this.analyser = null;
      this.visualizerFrame = null;

      this.init();
    }

    init() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        this.isSupported = false;
        return;
      }
      this.isSupported = true;
      this.setupRecognition();
    }

    async requestMicAccess() {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          return stream;
        } catch (err) {
          console.warn('[VoiceEngine] getUserMedia warning:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            throw new Error('PERMISSION_DENIED');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            throw new Error('NO_DEVICE');
          }
          return null;
        }
      }
      return null;
    }

    setupAudioVisualizer(stream) {
      if (!stream) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.audioContext = new AudioCtx();
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        const source = this.audioContext.createMediaStreamSource(stream);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        this.analyser = analyser;
        this.mediaStream = stream;

        const modalId = this.modalElementId;
        const waveBars = document.querySelectorAll(modalId ? `#${modalId} .desktop-wave-bar` : '.desktop-wave-bar');
        if (!waveBars || waveBars.length === 0) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateWave = () => {
          if (!this.isListening) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;

          waveBars.forEach((bar, idx) => {
            const val = dataArray[idx % dataArray.length] || avg;
            const h = Math.max(6, Math.min(32, Math.round((val / 255) * 36) + 6));
            bar.style.height = `${h}px`;
          });
          this.visualizerFrame = requestAnimationFrame(updateWave);
        };
        updateWave();
      } catch (e) {
        console.warn('[VoiceEngine] Visualizer error:', e);
      }
    }

    cleanupStream() {
      if (this.visualizerFrame) {
        cancelAnimationFrame(this.visualizerFrame);
        this.visualizerFrame = null;
      }
      if (this.mediaStream) {
        try {
          this.mediaStream.getTracks().forEach(track => track.stop());
        } catch (e) {}
        this.mediaStream = null;
      }
      if (this.audioContext) {
        try {
          if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
          }
        } catch (e) {}
        this.audioContext = null;
      }
      this.analyser = null;
    }

    setupRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      try {
        if (this.recognition) {
          this.recognition.onstart = null;
          this.recognition.onresult = null;
          this.recognition.onerror = null;
          this.recognition.onend = null;
          try { this.recognition.abort(); } catch (e) {}
          this.recognition = null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        this.recognition = recognition;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.isRecognitionActive = true;
          this.updateUiState(true);
        };

        this.recognition.onresult = (event) => {
          let interimText = '';
          let finalText = '';

          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            const transcript = res[0] ? res[0].transcript : '';
            if (res.isFinal) {
              finalText += (finalText ? ' ' : '') + transcript.trim();
            } else {
              interimText += (interimText ? ' ' : '') + transcript.trim();
            }
          }

          // Combine without duplicate words
          const currentCombined = [
            this.sessionFinalTranscript,
            finalText,
            interimText
          ].filter(Boolean).join(' ').trim();

          if (currentCombined) {
            this.sessionCurrentTranscript = currentCombined;
            this.restartCount = 0;
            this.voiceRestartCount = 0;

            // 1. LIVE reflection into actual search input field
            const combined = currentCombined;
            const queryInput = document.getElementById(this.inputElementId);
            if (queryInput) {
              queryInput.value = combined;
              queryInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // 2. Update modal transcript if element exists
            if (this.transcriptElementId) {
              const transcriptEl = document.getElementById(this.transcriptElementId);
              if (transcriptEl) {
                transcriptEl.innerHTML = `<span class="text-slate-900 font-semibold text-base">${this.escapeHtml(combined)}</span>`;
              }
            }

            // 3. Show search button if present
            if (this.searchBtnElementId) {
              const sBtn = document.getElementById(this.searchBtnElementId);
              if (sBtn) {
                sBtn.classList.remove('hidden');
                sBtn.classList.add('inline-flex');
              }
            }

            // 4. Update status title to show speech is recognized
            if (this.statusElementId) {
              const statusEl = document.getElementById(this.statusElementId);
              if (statusEl) {
                const t = this.getTranslation();
                statusEl.textContent = t.voice_listening || 'Listening...';
              }
            }

            // 5. Reset silence timer: wait exactly 2.0s of continuous silence after speech
            if (this.silenceTimer) {
              clearTimeout(this.silenceTimer);
            }
            this.silenceTimer = setTimeout(() => {
              this.handleSilenceTimeout();
            }, this.silenceMs);
          }
        };

        this.recognition.onerror = (event) => {
          const e = event;
          console.log('[VoiceEngine] Recognition event:', e.error);
          if (e.error === 'no-speech' || e.error === 'aborted') {
            return;
          }
          const t = this.getTranslation();
          if (e.error === 'not-allowed') {
            this.manualStop = true;
            this.isManualStop = true;
            this.isListening = false;
            this.cleanupStream();
            this.updateUiState(false, t.voice_mic_blocked || 'Microphone Blocked', t.voice_mic_blocked_hint || 'Please allow microphone access in browser settings.');
            return;
          }
          if (e.error === 'audio-capture') {
            this.manualStop = true;
            this.isManualStop = true;
            this.isListening = false;
            this.cleanupStream();
            this.updateUiState(false, 'No Microphone Found', 'Please connect a working microphone.');
            return;
          }
          if (e.error === 'network') {
            console.warn('[VoiceEngine] Network error in speech recognition service');
            return;
          }
          if (e.error === 'language-not-supported') {
            try {
              this.recognition.lang = (navigator.language || 'en-IN');
            } catch (err) {}
            return;
          }
        };

        this.recognition.onend = () => {
          this.isRecognitionActive = false;

          // 1. If manual stop or already submitted, clean up UI and exit
          if (this.manualStop || this.isManualStop || this.hasSubmitted) {
            this.isListening = false;
            this.cleanupStream();
            this.updateUiState(false);
            return;
          }

          // 2. If silenceTimer is active, speech was occurring and Chrome ended early on a brief pause:
          // Resume seamlessly to continue listening until full 1.5-2.5s silence occurs
          if (this.silenceTimer && (this.restartCount < this.maxRestarts || this.voiceRestartCount < this.maxRestarts)) {
            this.restartCount++;
            this.voiceRestartCount++;
            if (this.sessionCurrentTranscript) {
              this.sessionFinalTranscript = this.sessionCurrentTranscript;
            }
            try {
              this.restartRecognitionInstance();
              return;
            } catch (e) {}
          }

          // 3. If session text exists and silence timer fired or expired, submit
          if (this.sessionCurrentTranscript && !this.manualStop && !this.hasSubmitted) {
            this.handleSilenceTimeout();
            return;
          }

          // 4. If modal is still open and user hasn't spoken yet:
          // Keep listening! Reconnect recognizer so user can speak without early cut-off
          if (!this.manualStop && !this.hasSubmitted && (Date.now() - this.voiceStartTime < 25000) && (this.voiceRestartCount < 6)) {
            this.voiceRestartCount = (this.voiceRestartCount || 0) + 1;
            try {
              this.restartRecognitionInstance();
              return;
            } catch (e) {}
          }

          // 5. Inactivity timeout after full 25s
          this.isListening = false;
          this.cleanupStream();
          this.updateUiState(false);
        };
      } catch (err) {
        console.warn('[VoiceEngine] Initialization error:', err);
      }
    }

    restartRecognitionInstance() {
      if (this.manualStop || this.isManualStop || this.hasSubmitted) return;
      try {
        this.setupRecognition();
        if (this.recognition) {
          const savedLang = (localStorage.getItem('manak_lang') || 'en').toLowerCase();
          this.recognition.lang = VOICE_LANG_MAP[savedLang] || 'en-IN';
          this.recognition.start();
        }
      } catch (e) {
        console.warn('[VoiceEngine] Restart recognition error:', e);
      }
    }

    getTranslation() {
      const code = (this.activeLang || localStorage.getItem('manak_lang') || 'en').toLowerCase();
      const dict = (typeof window !== 'undefined' && (window.MANAK_TRANSLATIONS || window.LANDING_TRANSLATIONS)) || {};
      return dict[code] || dict['en'] || {};
    }

    async start() {
      const t = this.getTranslation();
      if (!this.isSupported) {
        if (this.modalElementId) {
          const modal = document.getElementById(this.modalElementId);
          if (modal) modal.classList.remove('hidden');
        }
        this.updateUiState(false, t.voice_not_supported || 'Voice Not Supported', t.voice_not_supported_desc || 'Web Speech recognition is not supported in this browser.');
        return;
      }
      if (this.isListening) return;

      // Determine active language
      const savedLang = (localStorage.getItem('manak_lang') || 'en').toLowerCase();
      this.activeLang = savedLang;

      // Reset session flags
      this.sessionFinalTranscript = '';
      this.sessionCurrentTranscript = '';
      this.hasSubmitted = false;
      this.manualStop = false;
      this.isManualStop = false;
      this.restartCount = 0;
      this.voiceRestartCount = 0;
      this.voiceStartTime = Date.now();
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      // If modal exists, show it and set initial localized hints
      if (this.modalElementId) {
        const modal = document.getElementById(this.modalElementId);
        if (modal) modal.classList.remove('hidden');
        if (this.transcriptElementId) {
          const tEl = document.getElementById(this.transcriptElementId);
          if (tEl) {
            tEl.innerHTML = `<span class="text-slate-400 italic">${this.escapeHtml(t.voice_default_transcript || t.voice_hint || 'Listening... please speak your question')}</span>`;
          }
        }
        if (this.searchBtnElementId) {
          const sBtn = document.getElementById(this.searchBtnElementId);
          if (sBtn) {
            sBtn.classList.add('hidden');
            sBtn.classList.remove('inline-flex');
          }
        }
        if (this.statusElementId) {
          const sEl = document.getElementById(this.statusElementId);
          if (sEl) sEl.textContent = t.voice_listening || 'Listening...';
        }
      }

      // Request hardware microphone access and initialize live audio visualizer
      try {
        const stream = await this.requestMicAccess();
        if (stream) {
          this.setupAudioVisualizer(stream);
        }
      } catch (err) {
        if (err.message === 'PERMISSION_DENIED') {
          this.manualStop = true;
          this.isManualStop = true;
          this.isListening = false;
          this.updateUiState(false, t.voice_mic_blocked || 'Microphone Blocked', t.voice_mic_blocked_hint || 'Please allow microphone access in browser settings.');
          return;
        } else if (err.message === 'NO_DEVICE') {
          this.manualStop = true;
          this.isManualStop = true;
          this.isListening = false;
          this.updateUiState(false, 'No Microphone Found', 'Please connect a working microphone.');
          return;
        }
      }

      this.setupRecognition();
      if (this.recognition) {
        this.recognition.lang = VOICE_LANG_MAP[savedLang] || 'en-IN';
        try {
          this.recognition.start();
        } catch (e) {
          this.restartRecognitionInstance();
        }
      }
    }

    stop(isManual = false) {
      if (isManual) {
        this.manualStop = true;
        this.isManualStop = true;
      }
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      this.isListening = false;
      this.isRecognitionActive = false;
      this.cleanupStream();
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {
          try { this.recognition.abort(); } catch (err) {}
        }
      }
      this.updateUiState(false);
    }

    toggle() {
      if (this.isListening) {
        this.stop(true);
      } else {
        this.start();
      }
    }

    commitNow() {
      if (this.hasSubmitted) return;
      const query = (this.sessionCurrentTranscript || '').trim();
      if (query) {
        this.handleSilenceTimeout();
      } else {
        this.stop(true);
      }
    }

    handleMicTrigger() {
      const query = (this.sessionCurrentTranscript || '').trim();
      if (query) {
        this.commitNow();
      } else if (this.isListening) {
        this.stop(true);
      } else {
        this.start();
      }
    }

    closeModal() {
      this.stop(true);
      if (this.modalElementId) {
        const modal = document.getElementById(this.modalElementId);
        if (modal) modal.classList.add('hidden');
      }
    }

    handleSilenceTimeout() {
      if (this.hasSubmitted) return;
      const query = (this.sessionCurrentTranscript || '').trim();
      if (!query) {
        this.stop(true);
        return;
      }

      this.hasSubmitted = true;
      this.stop(false);

      const t = this.getTranslation();
      if (this.statusElementId) {
        const statusEl = document.getElementById(this.statusElementId);
        if (statusEl) statusEl.textContent = t.voice_searching || 'Searching...';
      }

      // Hide modal if open
      if (this.modalElementId) {
        const modal = document.getElementById(this.modalElementId);
        if (modal) modal.classList.add('hidden');
      }

      if (typeof this.onSubmit === 'function') {
        this.onSubmit(query);
      }
    }

    updateUiState(isListening, errorTitle = '', errorDesc = '') {
      const t = this.getTranslation();
      const btn = document.getElementById(this.btnElementId);
      if (btn) {
        if (isListening) {
          btn.classList.add('bg-orange-600', 'text-white', 'ring-2', 'ring-orange-400', 'animate-pulse');
          btn.classList.remove('bg-slate-100', 'text-slate-700', 'text-slate-400');
        } else {
          btn.classList.remove('bg-orange-600', 'text-white', 'ring-2', 'ring-orange-400', 'animate-pulse');
          if (btn.id === 'btnVoice') {
            btn.classList.add('text-slate-400');
          } else {
            btn.classList.add('bg-slate-100', 'text-slate-700');
          }
        }
      }

      if (this.statusElementId) {
        const statusEl = document.getElementById(this.statusElementId);
        if (statusEl) {
          if (errorTitle) {
            statusEl.textContent = errorTitle;
          } else if (isListening) {
            statusEl.textContent = t.voice_listening || 'Listening...';
          } else {
            statusEl.textContent = t.voice_tap_to_speak || 'Tap Mic to Speak';
          }
        }
      }

      if (this.transcriptElementId && errorDesc) {
        const transcriptEl = document.getElementById(this.transcriptElementId);
        if (transcriptEl) {
          transcriptEl.innerHTML = `<span class="text-red-500 font-medium">${this.escapeHtml(errorDesc)}</span>`;
        }
      }
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  window.VoiceRecognitionEngine = VoiceRecognitionEngine;
  window.VOICE_LANG_MAP = VOICE_LANG_MAP;
})(window);
