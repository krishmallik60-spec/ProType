export class LevelManager {
    constructor() {
        this.levels = [
            ['e','n','i','a','r'],
            ['l'], ['t'], ['o'], ['s'], ['u'],
            ['d'], ['y'], ['c'], ['g'], ['h'],
            ['p'], ['m'], ['k'], ['b'], ['w'],
            ['f'], ['z'], ['v'], ['x'], ['q'], ['j']
        ];
        this.state = this.loadState();
    }

    loadState() {
        // Namespace v2 to avoid conflicts from the old state
        const saved = localStorage.getItem('proTypeAppProgress_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return {
                    level: parsed.level || 1,
                    history: parsed.history || [],
                    letterMistakes: parsed.letterMistakes || {},
                    autoUnlockLetters: parsed.autoUnlockLetters || [],
                    autoUnlockMode: parsed.autoUnlockMode || false,
                    highWPM: parsed.highWPM || 0
                };
            } catch(e) {}
        }
        return {
            level: 1,
            history: [],
            letterMistakes: {},
            autoUnlockLetters: [],
            autoUnlockMode: false,
            highWPM: 0
        };
    }

    saveState() {
        localStorage.setItem('proTypeAppProgress_v2', JSON.stringify(this.state));
    }

    getUnlockedLetters() {
        let letters = [];
        if (!this.state.autoUnlockMode) {
            for (let i = 0; i < this.state.level && i < this.levels.length; i++) {
                letters = letters.concat(this.levels[i]);
            }
        } else {
            letters = [...this.state.autoUnlockLetters];
            // Provide a base so you can actually type words from the start
            if (letters.length < 5) {
                const base = ['e','n','i','a','r'];
                base.forEach(l => { if(!letters.includes(l)) letters.push(l); });
            }
        }
        return letters;
    }

    addResult(stats) {
        this.state.history.push(stats);
        if (this.state.history.length > 10) {
            this.state.history.shift(); // keep last 10
        }
        
        for (let [letter, count] of Object.entries(stats.letterMistakes || {})) {
            this.state.letterMistakes[letter] = (this.state.letterMistakes[letter] || 0) + count;
        }

        if (stats.wpm > this.state.highWPM) {
            this.state.highWPM = stats.wpm;
        }
        
        // Level up naturally without auto-unlock
        if (!this.state.autoUnlockMode && this.checkLevelUp()) {
            this.state.level++;
            this.state.history = [];
        }
        
        this.saveState();
    }

    checkLevelUp() {
        if (this.state.level >= this.levels.length) return false;
        
        let goodSets = 0;
        for (let set of this.state.history) {
            if (set.accuracy >= 95 && set.wpm >= 10) {
                goodSets++;
            }
        }
        return goodSets >= 5; // 5 excellent sets to unlock next standard level
    }

    getProgress() {
        if (this.state.level >= this.levels.length) return 100;
        let goodSets = 0;
        for (let set of this.state.history) {
            if (set.accuracy >= 95 && set.wpm >= 10) {
                goodSets++;
            }
        }
        return Math.min(100, Math.round((goodSets / 5) * 100));
    }

    getState() {
        return {
            level: this.state.level,
            unlockedLetters: this.getUnlockedLetters(),
            history: this.state.history,
            autoUnlockMode: this.state.autoUnlockMode,
            highWPM: this.state.highWPM,
            mistakesData: this.state.letterMistakes
        };
    }
    
    toggleAutoUnlock(enabled) {
        this.state.autoUnlockMode = enabled;
        this.saveState();
    }

    toggleLetterLock(key) {
        const lower = key.toLowerCase();
        if (this.state.autoUnlockMode && /[a-z]/.test(lower)) {
            if (this.state.autoUnlockLetters.includes(lower)) {
                // Remove from unlocked only if more than 5 remain to guarantee words
                if (this.state.autoUnlockLetters.length > 5) {
                    this.state.autoUnlockLetters = this.state.autoUnlockLetters.filter(l => l !== lower);
                    this.saveState();
                    return true;
                }
            } else {
                this.state.autoUnlockLetters.push(lower);
                this.saveState();
                return true;
            }
        }
        return false;
    }
}
