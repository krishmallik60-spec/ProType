const COMMON_WORDS_STRING = "the of and a to in is you that it he was for on are as with his they i at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should america world high every near add food between own below country plant last school father keep tree never start city earth eyes light thought head under story saw left don't few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later miss idea enough eat face watch far indian real almost let above girl sometimes mountains cut young talk soon list song being leave family it's apple baby back bad ball bank bar base basket bath bear beautiful bed bedroom beef beer before begin behind believe bell below beside best better between big bird birth birthday bit bite black bleed block blood blow blue board boat body bone book border born boss both bottle bottom bowl box boy branch brave bread break breakfast breath breathe bridge bright bring brother brown brush build burn bus business busy but butter buy button by cake call camera camp car card care carry case cat catch cause cell center century certain chair chance change character cheap check cheese chicken child children chocolate choice choose circle city class clear clever clock close clothes cloud club coast coat coffee cold collect color come comfortable common compare complete computer condition consider continue control cook cool copy corn corner correct cost cotton could count country course cover cow crash crazy create cross cry cup cut dance danger dark daughter day dead deal dear death decide deep degree depend describe desk destroy detail develop device die difference different difficult dinner direct direction dirty discover discuss disease dish distance divide doctor dog door double down draw dream dress drink drive drop dry duck dust duty each ear early earn earth east easy eat edge education effect egg eight either electric elephant else empty end enemy engine enough enter equal especially even evening event ever every everybody everyone everything exactly example except exciting exercise expect expensive experience explain eye face fact factory fail fair fall false family far farm fast fat father fault fear feed feel female fever few fight fill film find fine finger finish fire first fish fit five fix flag flat floor flower fly focus fold follow food foot for force foreign forest forget forgive form forward four free freeze fresh friend friendly from front fruit full fun funny future game garden gas gate gather general gently get girl give glad glass go god gold good goodbye govern grand grandfather grandmother grass gray great green grey ground group grow gun hair half hand happen happy hard hat hate have he head healthy hear heart heat heavy height hello help here hide high hill hole holiday home hope horse hospital hot hotel hour house how huge human hundred hungry hunt husband ice idea if important in inside into iron is island it jacket jeans job join jump just keep key kill kind king kiss kitchen knee knife knock know lady lake land language large last late laugh lazy lead leaf learn leave left leg let letter level lie life light like line lion lip list listen little live local long look lose lot love low luck lucky machine main make male man many map mark market marry matter may meal mean measure meat media medical meet meeting member memory mention message message method middle midnight mile milk million mind minute miss mistake mix model modern moment money month moon more morning most mother mountain mouse mouth move much music must name narrow nation nature near nearly necessary neck need needle neighbor neither net never new news next nice night nine no noise none nor north nose not note notice now number nurse object ocean odd off offer office often oil old on once one only open opposite or orange order other our out outside over own page pain paint paper parent part partner party pass past path pay peace pen pencil people perfect perhaps person pet phone photograph pick picture piece pig place plan plant plastic plate play please plenty pocket point police polite poor pop popular position possible potato pound pour power practice prepare present press pretty price print prison private probably problem program promise protect public pull pump punish pure purpose push put queen question quick quietly quite race radio rain raise rarely reach read ready real realize really reason receive recent red reduce refuse relation remember remove repair repeat report represent result return rice rich ride right ring rise river road rock roll room root rope rose rough round rubber rule run sad safe sail salt same sand sat save say school science sea season seat second secret see seed seem sell send sentence separate serious serve set seven several shade shadow shake shape share sharp she sheep sheet shine ship shirt shoe shoot shop short should shoulder shout show sick side sight sign sign silence silent silk silver simple sing single sink sister sit situation six size skill skin skirt sky sleep slide slow small smell smile smoke snow so soap soft soil soldier solid some somebody someone something sometimes son song soon sorry sound soup south space speak special speed spell spend spoon sport spot spread spring square stand star start state station stay steal step stick still stone stop store storm story street strong student study stupid success such sudden sugar summer sun Sunday supper sure sweet swim system table take talk tall taste tax tea teach team tear telephone television tell ten test than thank that them then there these thick thin thing think third thirsty thirteen thirty this those though thought thousand thread three through throw ticket tie tight till time tired to today together tomorrow too tooth top total touch toward town toy train travel tree trick trouble true trust truth try Tuesday turn twelve twenty twice twin two type ugly uncle under understand unit until up upon use usual valley valuable value variety vegetable very video view village visit voice wait walk wall want war warm wash waste watch water wave way we weak wealth wear weather web week weight welcome well west what wheel where which while white who whole why wide wife will win wind window wine winter wire wise wish with without woman wonder wood word work world worry worse worst would write wrong year yellow yes yesterday yet young zero zoo";

const MASTER_WORDS = Array.from(new Set(COMMON_WORDS_STRING.split(" ")
    .map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
    .filter(w => w.length > 0)));

const EXTRA_PROGRESSION_WORDS = [
    // =========================
    // Base: E N I A R
    // =========================
    "are", "ear", "earn", "ran", "near", "rain", "nine", "inn", "inner", "arena",
    "rare", "rear", "ire", "air", "aria", "rein", "area", "inane", "rainier",
    "remain", "marine", "anime", "ram", "airer", "iran", "rein", "rani",

    // =========================
    // + L
    // =========================
    "line", "learn", "nail", "rail", "real", "lean", "lane", "alien", "linear",
    "airline", "liar", "lair", "lien", "renal", "nailer", "aliner", "lira",
    "relain", "lenair",

    // =========================
    // + T
    // =========================
    "train", "tear", "rate", "tart", "treat", "tent", "trait", "retina",
    "retain", "rent", "art", "tar", "tan", "tine", "terrain", "trainer",
    "entire", "tarn", "rental", "rattier",

    // =========================
    // + O
    // =========================
    "iron", "roan", "roar", "aero", "error", "onion", "orion", "one", "ore", "oar",
    "ratio", "riot", "ornate", "orient", "roamer", "aerion", "ironier",

    // =========================
    // + S
    // =========================
    "arise", "raise", "sense", "snore", "snare", "sire", "seen", "seas", "sane",
    "sins", "assassin", "resin", "serine", "arisen", "saner", "season", "snarl",
    "seran", "rainess",

    // =========================
    // + U
    // =========================
    "ruin", "rune", "aura", "run", "urn", "urea", "unreal", "urine", "nurse",
    "aurine", "uran", "suren", "ruiner", "nausea",

    // =========================
    // + D
    // =========================
    "dare", "read", "dear", "drain", "diner", "dinner", "dead", "dad", "add",
    "arid", "denari", "rained", "adren", "darein", "radin", "andier",

    // =========================
    // + Y
    // =========================
    "year", "yarn", "ray", "any", "eye", "nanny", "yearn", "rainy", "yare",
    "yen", "yean", "yarnier",

    // =========================
    // + C
    // =========================
    "care", "race", "cane", "nice", "ice", "acre", "crane", "cancer", "can", "car",
    "cairn", "crania", "caner", "crane", "ranic",

    // =========================
    // + G
    // =========================
    "gear", "rage", "ring", "gain", "age", "gag", "gig", "gang", "grain",
    "regain", "gainer", "range", "raging", "earing", "garnier",

    // =========================
    // + H
    // =========================
    "hear", "hair", "hare", "here", "hire", "heir", "hen", "her",
    "hernia", "hearin", "hainer", "rhine", "harier",

    // =========================
    // + P
    // =========================
    "pair", "pain", "pen", "pin", "pine", "pipe", "paper", "pan", "pane",
    "pear", "reap", "rip", "ripe", "prain", "parin", "prine", "repin",

    // =========================
    // + M
    // =========================
    "man", "men", "main", "mine", "name", "mean", "mare", "ream", "rim",
    "marine", "remain", "miner", "anime", "mainer", "ramen",

    // =========================
    // + K
    // =========================
    "kin", "ink", "keen", "keep", "knee", "ark", "dark", "rank", "rake",
    "krane", "karen", "rinker",

    // =========================
    // + B
    // =========================
    "barn", "bare", "bear", "bain", "brain", "bar", "bane", "brine",
    "bairn", "bean", "briar",

    // =========================
    // + W
    // =========================
    "war", "wear", "wane", "wire", "wine", "warn", "warren", "wair",
    "wrain", "wairn",

    // =========================
    // + F
    // =========================
    "fair", "fear", "fire", "finer", "fern", "far", "fan", "fine",
    "frain", "feria",

    // =========================
    // + Z
    // =========================
    "zine", "zair", "zen", "zaire", "raze", "zari",

    // =========================
    // + V
    // =========================
    "vane", "vain", "vine", "via", "vare", "vair",

    // =========================
    // + X
    // =========================
    "axer", "axin", "xen", "xir", "rixa",

    // =========================
    // + Q
    // =========================
    "qi", "qua", "qari", "iraq", "qair",

    // =========================
    // + J
    // =========================
    "jar", "jair", "jane", "jinn", "jin"
];

export function generateWords(count, levelManager) {
    const letters = levelManager.getUnlockedLetters();
    const letterSet = new Set(letters);
    
    // Find the absolute newest letter unlocked if we are not in auto mode
    const state = levelManager.getState();
    let newestLetter = null;
    if (!state.autoUnlockMode && state.level > 1 && state.level <= 22) {
        newestLetter = levelManager.levels[state.level - 1][0];
    }
    
    // Filter the massively expanded dataset
    let allValid = [...new Set([...MASTER_WORDS, ...EXTRA_PROGRESSION_WORDS])].filter(w => {
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
        
        // 50% chance to force a word featuring the brand new unlocked letter
        if (newestLetterPool.length > 0 && Math.random() < 0.5) {
            const unusedNew = newestLetterPool.filter(w => !usedWords.has(w));
            if (unusedNew.length > 0) candidates = unusedNew;
        }
        // otherwise, 30% chance to favor struggled letters
        else if (strugglingLetters.length > 0 && Math.random() < 0.3) {
            const unusedHard = allValid.filter(w => strugglingLetters.some(sl => w.includes(sl)) && !usedWords.has(w));
            if (unusedHard.length > 0) candidates = unusedHard;
        }

        // Try to only pick words not yet used in this set
        let available = candidates.filter(w => !usedWords.has(w));
        
        // If the targeted pool is exhausted, fallback to any unused word
        if (available.length === 0) {
            available = allValid.filter(w => !usedWords.has(w));
        }
        
        // If the ENTIRE dictionary of unused words is exhausted, allow repetitions
        if (available.length === 0) {
            available = allValid;
        }

        const chosenIndex = Math.floor(Math.random() * available.length);
        const chosenWord = available[chosenIndex];
        
        selected.push(chosenWord);
        usedWords.add(chosenWord);
    }
    
    return selected;
}
