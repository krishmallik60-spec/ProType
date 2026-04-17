import { EXTENDED_DICTIONARY } from './words.js';

const MASTER_WORDS = [
    ...new Set([
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would",
        "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can",
        "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them",
        "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use",
        "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
        "most", "us", "word", "letter", "keep", "light", "right", "might", "night", "near", "dear", "fear", "bear", "tear",
        "area", "idea", "part", "port", "sort", "short", "long", "song", "along", "wind", "window", "kind", "hand", "mind",
        ...EXTENDED_DICTIONARY
    ])
];

const EXTRA_PROGRESSION_WORDS = [
    // Base: E N I A R
    "are", "ear", "earn", "ran", "near", "rain", "nine", "inn", "inner", "arena",
    "rare", "rear", "ire", "air", "aria", "rein", "area", "inane", "rainier",
    // + L
    "line", "learn", "nail", "rail", "real", "lean", "lane", "alien", "linear",
    // + T
    "train", "tear", "rate", "tart", "treat", "tent", "trait", "retina",
    // + O
    "iron", "roan", "roar", "aero", "error", "onion", "orion", "one", "ore", "oar",
    // + S
    "arise", "raise", "sense", "snore", "snare", "sire", "seen", "seas", "sane",
    // + U
    "ruin", "rune", "aura", "run", "urn", "urea", "unreal", "urine", "nurse",
    // + D
    "dare", "read", "dear", "drain", "diner", "dinner", "dead", "dad", "add",
    // + Y
    "year", "yarn", "ray", "any", "eye", "nanny", "yearn", "rainy", "yare",
    // + C
    "care", "race", "cane", "nice", "ice", "acre", "crane", "cancer", "can", "car",
    // + G
    "gear", "rage", "ring", "gain", "age", "gag", "gig", "gang", "grain",
    // + H
    "hear", "hair", "hare", "here", "hire", "heir", "hen", "her",
    // + P
    "pair", "pain", "pen", "pin", "pine", "pipe", "paper", "pan", "pane",
    // + M
    "man", "men", "main", "mine", "name", "mean", "mare", "ream", "rim",
    // + K
    "kin", "ink", "keen", "keep", "knee", "ark", "dark", "rank", "rake",
    // + B
    "barn", "bare", "bear", "bain", "brain", "bar", "bane", "brine",
    // + W
    "war", "wear", "wane", "wire", "wine", "warn", "warren", "wair",
    // + F
    "fair", "fear", "fire", "finer", "fern", "far", "fan", "fine",
    // + Z
    "zine", "zair", "zen", "zaire", "raze", "zari",
    // + V
    "vane", "vain", "vine", "via", "vare", "vair",
    // + X
    "axer", "axin", "xen", "xir", "rixa",
    // + Q
    "qi", "qua", "qari", "iraq", "qair",
    // + J
    "jar", "jair", "jane", "jinn", "jin"
];

const SYMBOL_WORDS = [
    // Simple words (e, n, i, a, r)
    "are.", "rain,", "near;", "area:", "earn'", "air.", "era,", "near.", "rain.", "in.", "an.",
    // More complex
    "it's", "don't", "can't", "won't", "he's", "she's", "they're", "we're", "user.", "next.", "end.", "stop.", 
    "yes,", "no,", "well,", "however,", "then,", "stay;", "look;", "wait;", "go;", "run;", "here's", "there's", 
    "note:", "list:", "time:", "name:", "said:", "found:", "day.", "night.", "now.", "then.", "more,", "less,", 
    "high,", "low,", "point.", "page.", "home.", "move.", "try.", "kind.", "hand."
];

export function generateWords(count, levelManager, options = {}) {
    const letters = levelManager.getUnlockedLetters();
    const letterSet = new Set(letters);
    const { includeSymbols = false, includeCapitals = false } = options;
    
    // Find the absolute newest letter unlocked if we are not in auto mode
    const state = levelManager.getState();
    let newestLetter = null;
    if (!state.autoUnlockMode && state.level > 1 && state.level <= 22) {
        newestLetter = levelManager.levels[state.level - 1][0];
    }
    
    // Filter the massively expanded dataset
    let basePool = [...new Set([...MASTER_WORDS, ...EXTRA_PROGRESSION_WORDS])];
    
    let allValid = basePool.filter(w => {
        return [...w].every(c => letterSet.has(c));
    });

    if (allValid.length === 0) allValid = ["error", "dictionary", "empty"];
    
    let newestLetterPool = [];
    if (newestLetter) {
        newestLetterPool = allValid.filter(w => w.includes(newestLetter));
    }
    
    const selected = [];
    const usedWords = new Set();
    const letterMistakes = state.mistakesData || {};
    
    const strugglingLetters = Object.entries(letterMistakes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(x => x[0]);

    for (let i = 0; i < count; i++) {
        let candidates = allValid;
        
        // 1. Symbol handling
        if (includeSymbols && Math.random() < 0.4) { // 40% chance of symbol-word
            const validSymbols = SYMBOL_WORDS.filter(w => {
                // Check if all letters are unlocked
                const pureLetters = w.toLowerCase().replace(/[^a-z]/g, '');
                return [...pureLetters].every(c => letterSet.has(c));
            });
            if (validSymbols.length > 0) candidates = validSymbols;
        } 
        
        // 2. New Letter handling
        if (candidates === allValid && newestLetterPool.length > 0 && Math.random() < 0.5) {
            const unusedNew = newestLetterPool.filter(w => !usedWords.has(w));
            if (unusedNew.length > 0) candidates = unusedNew;
        }
        // 3. Struggle handling
        else if (candidates === allValid && strugglingLetters.length > 0 && Math.random() < 0.3) {
            const unusedHard = allValid.filter(w => strugglingLetters.some(sl => w.includes(sl)) && !usedWords.has(w));
            if (unusedHard.length > 0) candidates = unusedHard;
        }

        let available = candidates.filter(w => !usedWords.has(w));
        if (available.length === 0) {
            available = candidates.length > 0 ? candidates : allValid;
        }

        const chosenIndex = Math.floor(Math.random() * available.length);
        let word = available[chosenIndex];
        
        // Final transformation: Capitals
        if (includeCapitals && Math.random() < 0.3) {
            if (Math.random() < 0.7) {
                // Title Case: Apple
                word = word.charAt(0).toUpperCase() + word.slice(1);
            } else {
                // ALL CAPS: APPLE
                word = word.toUpperCase();
            }
        }
        
        selected.push(word);
        usedWords.add(word.toLowerCase());
    }
    
    return selected;
}
