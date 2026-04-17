export class TypingEngine {
    constructor(words, levelManager, onRoundComplete, onProgress, isSoundEnabled) {
        this.words = words;
        this.levelManager = levelManager;
        this.onRoundComplete = onRoundComplete;
        this.onProgress = onProgress;
        this.isSoundEnabled = isSoundEnabled;
        
        this.container = document.getElementById('typing-container');
        this.wordEls = [];
        this.currentWordIndex = 0;
        this.currentLetterIndex = 0;

        this.mistakes = 0;
        this.totalKeystrokes = 0;
        this.correctCharacters = 0;
        this.letterMistakes = {};

        this.isFinished = false;
        this.startTime = null;
        
        this.audioCtx = null;

        this.keyHandler = this.handleEvent.bind(this);
    }
    
    playClick() {
        if (!this.isSoundEnabled || !this.isSoundEnabled()) return;
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);     
            osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.04);

            gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.04);

            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.04);
        } catch(e) {}
    }

    start() {
        this.renderWords();
        window.addEventListener('keydown', this.keyHandler);
        // Force focus if possible so mobile keyboards pop up
        this.container.focus();
        this.updateCursor();
    }

    stop() {
        window.removeEventListener('keydown', this.keyHandler);
        this.isFinished = true;
    }

    renderWords() {
        this.container.innerHTML = '';
        this.wordEls = this.words.map((word) => {
            const wordEl = document.createElement('span');
            wordEl.className = 'word text-[#4b5563] relative';
            
            const letterEls = [...word].map((char) => {
                const letterEl = document.createElement('span');
                letterEl.className = 'letter';
                letterEl.textContent = char;
                wordEl.appendChild(letterEl);
                return letterEl;
            });
            this.container.appendChild(wordEl);
            return { wordEl, letterEls, word };
        });
    }

    updateCursor() {
        if (this.isFinished) return;
        
        document.querySelectorAll('.cursor-active, .cursor-right').forEach(el => {
            el.classList.remove('cursor-active', 'cursor-right');
        });

        if (this.currentWordIndex >= this.words.length) return;

        const currentWordData = this.wordEls[this.currentWordIndex];
        
        if (this.currentLetterIndex < currentWordData.word.length) {
            currentWordData.letterEls[this.currentLetterIndex].classList.add('cursor-active');
        } else {
            // End of word => waiting for space
            currentWordData.letterEls[currentWordData.letterEls.length - 1].classList.add('cursor-right');
        }
    }

    handleEvent(e) {
        if (['Shift', 'Control', 'Alt', 'Meta', 'Escape', 'Tab', 'CapsLock'].includes(e.key)) return;
        if (this.isFinished) return;
        
        if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace') {
            e.preventDefault();
        }

        // Timer starts strictly on the first valid typed character
        if (!this.startTime && e.key.length === 1 && e.key !== ' ') {
            this.startTime = Date.now();
        }

        const searchKey = e.key === ' ' ? ' ' : e.key.toLowerCase();
        const keyEl = document.querySelector(`.key[data-key="${searchKey}"]`);
        if (keyEl) {
            keyEl.classList.add('pressed');
            setTimeout(() => keyEl.classList.remove('pressed'), 100);
        }

        if (this.currentWordIndex >= this.words.length) return;
        const currentWordData = this.wordEls[this.currentWordIndex];
        const word = currentWordData.word;

        if (e.key === 'Backspace') {
            if (this.currentLetterIndex > 0) {
                this.playClick();
                this.currentLetterIndex--;
                const letterEl = currentWordData.letterEls[this.currentLetterIndex];
                if (letterEl.classList.contains('correct')) {
                    this.correctCharacters--;
                }
                letterEl.classList.remove('correct', 'incorrect');
                this.updateCursor();
                this.triggerProgress();
            }
            return;
        }

        if (e.key === ' ') {
            if (this.currentLetterIndex === word.length) {
                this.playClick();
                currentWordData.wordEl.classList.remove('error');
                this.correctCharacters++; // Space counts as valid keystroke in WPM
                this.currentWordIndex++;
                this.currentLetterIndex = 0;
                
                this.triggerProgress();

                if (this.currentWordIndex === this.words.length) {
                    this.finishRound();
                } else {
                    this.updateCursor();
                }
            } else {
                const activeWrapper = currentWordData.wordEl;
                activeWrapper.classList.remove('shake');
                void activeWrapper.offsetWidth;
                activeWrapper.classList.add('shake');
                this.mistakes++;
                this.triggerProgress();
            }
            return;
        }

        if (e.key.length === 1 && this.currentLetterIndex < word.length) {
            // BLOCKING MODE: If there is an existing mistake in the current word, stop typing further
            const hasError = Array.from(currentWordData.letterEls).some(el => el.classList.contains('incorrect'));
            if (hasError) {
                currentWordData.wordEl.classList.remove('shake');
                void currentWordData.wordEl.offsetWidth; // trigger reflow
                currentWordData.wordEl.classList.add('shake');
                return;
            }

            this.playClick();
            this.totalKeystrokes++;
            const expectedChar = word[this.currentLetterIndex];
            const letterEl = currentWordData.letterEls[this.currentLetterIndex];
            
            if (e.key.toLowerCase() === expectedChar.toLowerCase()) {
                letterEl.classList.add('correct');
                letterEl.classList.remove('incorrect');
                this.correctCharacters++;
            } else {
                letterEl.classList.add('incorrect');
                letterEl.classList.remove('correct');
                this.mistakes++;
                this.letterMistakes[expectedChar] = (this.letterMistakes[expectedChar] || 0) + 1;
            }
            this.currentLetterIndex++;
            this.updateCursor();
            this.triggerProgress();
            
            // Check auto-transition logic at the very end of the set!
            if (this.currentWordIndex === this.words.length - 1 && this.currentLetterIndex === word.length) {
                // If there are no incorrect letters in the current word, we finish immediately 
                // avoiding the need for final spacebar.
                const hasError = Array.from(currentWordData.letterEls).some(el => el.classList.contains('incorrect'));
                if (!hasError) {
                    this.finishRound();
                }
            }
            
        } else if (e.key.length === 1 && this.currentLetterIndex >= word.length) {
            const activeWrapper = currentWordData.wordEl;
            activeWrapper.classList.remove('shake');
            void activeWrapper.offsetWidth; // trigger reflow
            activeWrapper.classList.add('shake');
            this.mistakes++;
            this.triggerProgress();
        }
    }

    correctKeystrokes() {
        return Math.max(0, this.totalKeystrokes - this.mistakes);
    }

    triggerProgress() {
        if (!this.startTime) return;
        const elapsedMins = (Date.now() - this.startTime) / 60000;
        let wpm = 0;
        if (elapsedMins > 0) {
            wpm = Math.round((this.correctCharacters / 5) / elapsedMins);
        }
        const acc = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes() / this.totalKeystrokes) * 100) : 100;

        if (this.onProgress) {
            this.onProgress({
                wpm: wpm > 0 ? wpm : 0,
                accuracy: acc,
                mistakes: this.mistakes
            });
        }
    }

    finishRound() {
        if (this.isFinished) return;
        this.stop();
        // Snap compute final stats
        const elapsedMins = this.startTime ? ((Date.now() - this.startTime) / 60000) : 1;
        const wpm = this.startTime ? Math.round((this.correctCharacters / 5) / elapsedMins) : 0;
        const accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes() / this.totalKeystrokes) * 100) : 100;
        
        // Immediate callback for seamless switch
        this.onRoundComplete({
            wpm: wpm > 0 ? wpm : 0,
            accuracy: accuracy,
            mistakes: this.mistakes,
            letterMistakes: this.letterMistakes
        });
    }
}
