import { LevelManager } from './levelManager.js';
import { generateWords } from './wordGenerator.js';
import { TypingEngine } from './typingEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    const levelManager = new LevelManager();
    let currentEngine = null;

    // Elements
    const container = document.getElementById('typing-container');
    const displayWpm = document.getElementById('live-wpm');
    const displayAcc = document.getElementById('live-acc');
    const displayHighWpm = document.getElementById('high-wpm');
    const levelDisplay = document.getElementById('current-level-display');
    const autoUnlockToggle = document.getElementById('auto-unlock-toggle');
    const soundToggle = document.getElementById('sound-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const themeToggle = document.getElementById('theme-toggle');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const letterSeriesBox = document.getElementById('letter-series-box');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fsEnterIcon = document.getElementById('fs-enter-icon');
    const fsExitIcon = document.getElementById('fs-exit-icon');
    const closeSettingsX = document.getElementById('close-settings-x');

    const settingsKey = 'proTypeSettings_v2';
    const savedSettings = JSON.parse(localStorage.getItem(settingsKey)) || {};

    let soundEnabled = savedSettings.sound === true;

    // Check initial theme logic (Fallback to unforced Light by default unless system specifies Dark, or storage overrides)
    let isDark = false;
    if (savedSettings.theme === 'dark') {
        isDark = true;
    } else if (savedSettings.theme === 'light') {
        isDark = false;
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDark = true;
        }
    }

    // Init UI toggles
    autoUnlockToggle.checked = levelManager.getState().autoUnlockMode;
    soundToggle.checked = soundEnabled;
    themeToggle.checked = isDark;

    // Apply the initial computed theme
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    soundToggle.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        savedSettings.sound = soundEnabled;
        localStorage.setItem(settingsKey, JSON.stringify(savedSettings));
    });

    autoUnlockToggle.addEventListener('change', (e) => {
        levelManager.toggleAutoUnlock(e.target.checked);
        updateHeader(levelManager);
        
        // Regenerate words visually to reflect changes
        container.classList.add('opacity-0');
        setTimeout(() => {
            if (currentEngine) currentEngine.stop();
            startRound();
        }, 300);
    });

    // Handle clicks on the visual keyboard for manual custom keys
    document.getElementById('keyboard').addEventListener('click', (e) => {
        if (!levelManager.getState().autoUnlockMode) return;
        const keyEl = e.target.closest('.key');
        if (!keyEl) return;
        
        const keyLetter = keyEl.dataset.key;
        if (keyLetter) {
            const changed = levelManager.toggleLetterLock(keyLetter);
            if (changed) {
                updateHeader(levelManager);
                // regenerate dynamically
                container.classList.add('opacity-0');
                setTimeout(() => {
                    if (currentEngine) currentEngine.stop();
                    startRound();
                }, 150);
            }
        }
    });

    // Settings Modal interactions
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden', 'pointer-events-none');
        void settingsModal.offsetWidth;
        settingsModal.classList.remove('opacity-0');
    });

    closeSettings.addEventListener('click', hideSettings);
    closeSettingsX.addEventListener('click', hideSettings);

    // Close modal when clicking outside the content area
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            hideSettings();
        }
    });

    function hideSettings() {
        settingsModal.classList.add('opacity-0');
        setTimeout(() => {
            settingsModal.classList.add('hidden', 'pointer-events-none');
        }, 300);
    }

    // Fullscreen Logic
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fsEnterIcon.classList.add('hidden');
            fsExitIcon.classList.remove('hidden');
        } else {
            fsEnterIcon.classList.remove('hidden');
            fsExitIcon.classList.add('hidden');
        }
    });

    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.classList.add('dark');
            savedSettings.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            savedSettings.theme = 'light';
        }
        localStorage.setItem(settingsKey, JSON.stringify(savedSettings));
    });

    resetDataBtn.addEventListener('click', () => {
        if (confirm("Reset all game progress and settings?")) {
            localStorage.removeItem('proTypeAppProgress_v2');
            localStorage.removeItem(settingsKey);
            window.location.reload();
        }
    });

    updateHeader(levelManager);
    
    // Tiny delay to avoid UI popping on load
    setTimeout(() => {
        startRound();
    }, 100);

    function startRound() {
        const wordCount = Math.floor(Math.random() * 6) + 20; // 20 to 25 length
        const words = generateWords(wordCount, levelManager);
        
        // Remove transparent state
        container.classList.remove('opacity-0');
        
        // We will pass the soundEnabled getter dynamically
        const getSoundState = () => soundEnabled;
        
        currentEngine = new TypingEngine(words, levelManager, onRoundComplete, onProgress, getSoundState);
        currentEngine.start();
        
        updateHeader(levelManager);
    }

    function onProgress(stats) {
        displayWpm.textContent = stats.wpm;
        displayAcc.textContent = `${stats.accuracy}%`;
    }

    function onRoundComplete(stats) {
        const previousHigh = levelManager.getState().highWPM;
        
        levelManager.addResult(stats);
        
        // If they broke the record, give the UI pop right at the end!
        if (stats.wpm > previousHigh && stats.wpm > 0) {
            displayHighWpm.classList.add('scale-110', 'text-amber-400', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]');
            setTimeout(() => {
                displayHighWpm.classList.remove('scale-110', 'text-amber-400', 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]');
            }, 500);
        }
        
        // Seamless transition -> animate out, stop old engine, animate in next round
        container.classList.add('opacity-0');
        setTimeout(() => {
            if (currentEngine) {
                currentEngine.stop();
            }
            startRound();
        }, 200); // 200ms quick fade out is seamless and distraction-free
    }

    function updateHeader(lm) {
        const state = lm.getState();
        levelDisplay.textContent = state.autoUnlockMode ? 'Auto' : state.level;
        displayHighWpm.textContent = state.highWPM || '0';
        updateKeyboard(state.unlockedLetters);

        // Update progress bar
        const progressBar = document.getElementById('level-progress-bar');
        if (progressBar) {
            if (state.autoUnlockMode || state.level >= lm.levels.length) {
                progressBar.style.width = '100%';
                progressBar.classList.add('bg-emerald-500');
                progressBar.classList.remove('bg-blue-500');
            } else {
                const progress = lm.getProgress();
                progressBar.style.width = `${progress}%`;
                progressBar.classList.add('bg-blue-500');
                progressBar.classList.remove('bg-emerald-500');
            }
        }

        // Render letter series box
        if (letterSeriesBox) {
            const allLevelsArray = lm.levels.flat();
            const unlockedSet = new Set(state.unlockedLetters);
            
            letterSeriesBox.innerHTML = '';
            
            allLevelsArray.forEach(char => {
                const span = document.createElement('span');
                span.textContent = char.toUpperCase();
                if (unlockedSet.has(char)) {
                    span.className = "text-blue-600 dark:text-blue-400 font-black";
                } else {
                    span.className = "text-gray-300 dark:text-gray-600 font-normal";
                }
                letterSeriesBox.appendChild(span);
            });
        }
    }

    function updateKeyboard(unlocked) {
        document.querySelectorAll('.key').forEach(el => {
            const key = el.getAttribute('data-key');
            if (unlocked.includes(key) || key === ' ') {
                el.classList.add('unlocked');
            } else {
                el.classList.remove('unlocked');
            }
        });
    }
});
