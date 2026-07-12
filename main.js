/**
 * ----------------------------------------------------------------
 * HACKER TYPER: OMEGA ENGINE (Core System)
 * ----------------------------------------------------------------
 * ※問題データ (WORD_DB) は words.js から読み込まれます。
 */

/* 1. TYPING ENGINE CORE */
class TypingEngine {
    constructor() {
        this.kanaTable = {
            'あ':['a'], 'い':['i','yi'], 'う':['u','wu','whu'], 'え':['e'], 'お':['o'],
            'か':['ka','ca'], 'き':['ki'], 'く':['ku','cu','qu'], 'け':['ke'], 'こ':['ko','co'],
            'さ':['sa'], 'し':['shi','si','ci'], 'す':['su'], 'せ':['se','ce'], 'そ':['so'],
            'た':['ta'], 'ち':['chi','ti','tyi'], 'つ':['tsu','tu'], 'て':['te'], 'と':['to'],
            'な':['na'], 'に':['ni'], 'ぬ':['nu'], 'ね':['ne'], 'の':['no'],
            'は':['ha'], 'ひ':['hi'], 'ふ':['fu','hu'], 'へ':['he'], 'ほ':['ho'],
            'ま':['ma'], 'み':['mi'], 'む':['mu'], 'め':['me'], 'も':['mo'],
            'や':['ya'], 'ゆ':['yu'], 'よ':['yo'],
            'ら':['ra'], 'り':['ri'], 'る':['ru'], 'れ':['re'], 'ろ':['ro'],
            'わ':['wa'], 'を':['wo'], 'ん':['nn','xn','n'],
            'が':['ga'], 'ぎ':['gi'], 'ぐ':['gu'], 'げ':['ge'], 'ご':['go'],
            'ざ':['za'], 'じ':['ji','zi'], 'ず':['zu'], 'ぜ':['ze'], 'ぞ':['zo'],
            'だ':['da'], 'ぢ':['ji','di'], 'づ':['zu','du'], 'で':['de'], 'ど':['do'],
            'ば':['ba'], 'び':['bi'], 'ぶ':['bu'], 'べ':['be'], 'ぼ':['bo'],
            'ぱ':['pa'], 'ぴ':['pi'], 'ぷ':['pu'], 'ぺ':['pe'], 'ぽ':['po'],
            'ぁ':['la','xa'], 'ぃ':['li','xi'], 'ぅ':['lu','xu'], 'ぇ':['le','xe'], 'ぉ':['lo','xo'],
            'ゃ':['lya','xya'], 'ゅ':['lyu','xyu'], 'ょ':['lyo','xyo'],
            'っ':['ltu','xtu'], 
            'ー':['-'], '、':[','], '。':['.']
        };

        this.comboTable = {
            'きゃ':['kya','kixya'], 'きゅ':['kyu','kixyu'], 'きょ':['kyo','kixyo'],
            'しゃ':['sha','sya','sixya'], 'しゅ':['shu','syu','sixyu'], 'しょ':['sho','syo','sixyo'],
            'ちゃ':['cha','tya','cya','tixya'], 'ちゅ':['chu','tyu','cyu','tixyu'], 'ちょ':['cho','tyo','cyo','tixyo'],
            'にゃ':['nya','nixya'], 'にゅ':['nyu','nixyu'], 'にょ':['nyo','nixyo'],
            'ひゃ':['hya','hixya'], 'ひゅ':['hyu','hixyu'], 'ひょ':['hyo','hixyo'],
            'みゃ':['mya','mixya'], 'みゅ':['myu','mixyu'], 'みょ':['myo','mixyo'],
            'りゃ':['rya','rixya'], 'りゅ':['ryu','rixyu'], 'りょ':['ryo','rixyo'],
            'ぎゃ':['gya','gixya'], 'ぎゅ':['gyu','gixyu'], 'ぎょ':['gyo','gixyo'],
            'じゃ':['ja','jya','zya','jixya'], 'じゅ':['ju','jyu','zyu','jixyu'], 'じょ':['jo','jyo','zyo','jixyo'],
            'びゃ':['bya','bixya'], 'びゅ':['byu','bixyu'], 'びょ':['byo','bixyo'],
            'ぴゃ':['pya','pixya'], 'ぴゅ':['pyu','pixyu'], 'ぴょ':['pyo','pixyo'],
            'ふぁ':['fa','fua'], 'ふぃ':['fi','fui'], 'ふぇ':['fe','fue'], 'ふぉ':['fo','fuo'],
            'うぃ':['wi','whi'], 'うぇ':['we','whe'], 'うぉ':['who','whu'],
            'ゔぁ':['va'], 'ゔぃ':['vi'], 'ゔ':['vu'], 'ゔぇ':['ve'], 'ゔぉ':['vo'],
            'てぃ':['ti','thi'], 'でぃ':['di','dhi'], 
            'しぇ':['she','sye'], 'じぇ':['je','jye'], 'ちぇ':['che','tye'],
            'とぅ':['twu','tu'], 'どぅ':['dwu','du']
        };

        this.currentKanaList = [];
        this.chunkIndex = 0;
        this.typedInChunk = "";
        this.targetCandidates = [];
        this.words = [];
        this.deck = [];
    }

    setDifficulty(level) {
        // words.js から読み込んだ WORD_DB を使用
        this.words = WORD_DB.filter(w => w.level === level);
        this.shuffleDeck();
    }

    shuffleDeck() {
        this.deck = [...this.words];
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    setSentence() {
        if (this.deck.length === 0) this.shuffleDeck();
        const data = this.deck.pop();
        this.currentKanaList = this.parseKana(data.k);
        this.chunkIndex = 0;
        this.typedInChunk = "";
        this.updateCandidates();
        return { display: data.d, kana: data.k, meaning: `【 TARGET: ${data.term} 】` };
    }

    parseKana(str) {
        let chunks = [];
        let i = 0;
        while (i < str.length) {
            const c2 = str.substr(i, 2);
            if (this.comboTable[c2]) {
                chunks.push({ char: c2, type: 'combo' });
                i += 2; continue;
            }
            if (str[i] === 'っ' && i + 1 < str.length) {
                const nextChar = str[i+1];
                const nextCombo = str.substr(i+1, 2);
                chunks.push({ char: 'っ', type: 'sokuon', nextChar: nextChar, nextCombo: this.comboTable[nextCombo] ? nextCombo : null });
                i++; continue;
            }
            chunks.push({ char: str[i], type: 'normal' });
            i++;
        }
        return chunks;
    }

    updateCandidates() {
        if (this.chunkIndex >= this.currentKanaList.length) {
            this.targetCandidates = []; return;
        }
        const chunk = this.currentKanaList[this.chunkIndex];
        let valids = [];

        if (chunk.type === 'combo') valids = [...this.comboTable[chunk.char]];
        else if (chunk.type === 'sokuon') {
            valids = [...this.kanaTable['っ']];
            if (chunk.nextCombo) this.comboTable[chunk.nextCombo].forEach(r => { if (!valids.includes(r[0])) valids.push(r[0]); });
            else if (chunk.nextChar) {
                 const nexts = this.kanaTable[chunk.nextChar];
                 if(nexts) nexts.forEach(r => { if (!['a','i','u','e','o'].includes(r[0]) && !valids.includes(r[0])) valids.push(r[0]); });
            }
        } else if (chunk.char === 'ん') {
            valids = [...this.kanaTable['ん']];
            const nextChunk = this.currentKanaList[this.chunkIndex + 1];
            let allowSingleN = true;
            if (nextChunk) {
                const nextTop = (nextChunk.type==='combo') ? this.comboTable[nextChunk.char][0] : 
                                (this.kanaTable[nextChunk.char] ? this.kanaTable[nextChunk.char][0] : nextChunk.char.toLowerCase());
                if (['a','i','u','e','o','n','y'].includes(nextTop[0])) allowSingleN = false;
            } else allowSingleN = false;
            if (!allowSingleN) valids = valids.filter(v => v !== 'n');
        } else {
            if (this.kanaTable[chunk.char]) valids = [...this.kanaTable[chunk.char]];
            else valids = [chunk.char.toLowerCase()];
        }
        this.targetCandidates = valids.filter(v => v.startsWith(this.typedInChunk));
    }

    input(key) {
        if (this.chunkIndex >= this.currentKanaList.length) return "DONE";
        const nextInput = this.typedInChunk + key;
        const match = this.targetCandidates.some(cand => cand.startsWith(nextInput));
        if (match) {
            this.typedInChunk = nextInput;
            const exactMatch = this.targetCandidates.find(cand => cand === nextInput);
            if (exactMatch) {
                const longerCandidate = this.targetCandidates.some(cand => cand.startsWith(nextInput) && cand.length > nextInput.length);
                if (longerCandidate) return "CORRECT"; 
                else return this.completeChunk();
            }
            return "CORRECT";
        } else {
            const prevWasValid = this.targetCandidates.includes(this.typedInChunk);
            if (prevWasValid && this.typedInChunk.length > 0) {
                this.completeChunk(); return this.input(key); 
            }
            return "MISS";
        }
    }

    completeChunk() {
        this.chunkIndex++; this.typedInChunk = "";
        if (this.chunkIndex >= this.currentKanaList.length) return "SENTENCE_CLEAR";
        this.updateCandidates(); return "CORRECT_CHUNK_DONE";
    }

    getDisplayHTML() {
        let html = "";
        if (this.chunkIndex < this.currentKanaList.length) {
            const bestCandidate = this.targetCandidates[0];
            if (bestCandidate) {
                for (let i = 0; i < bestCandidate.length; i++) {
                    if (i < this.typedInChunk.length) html += `<span class="char correct">${bestCandidate[i].toUpperCase()}</span>`;
                    else if (i === this.typedInChunk.length) html += `<span class="char current">${bestCandidate[i].toUpperCase()}</span>`;
                    else html += `<span class="char pending">${bestCandidate[i].toUpperCase()}</span>`;
                }
            }
        }
        for (let i = this.chunkIndex + 1; i < this.currentKanaList.length; i++) {
            const c = this.currentKanaList[i];
            let def = "";
            if (c.type === 'combo') def = this.comboTable[c.char][0];
            else if (c.type === 'sokuon') def = this.kanaTable['っ'][0];
            else def = this.kanaTable[c.char] ? this.kanaTable[c.char][0] : c.char.toLowerCase();
            if(def) for (let char of def) html += `<span class="char pending">${char.toUpperCase()}</span>`;
        }
        return html;
    }
}

/* 2. SOUND */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now   = audioCtx.currentTime;
    const combo = state ? state.combo : 0;

    if (type === 'type') {
        // コンボに応じてピッチと波形が変化
        const base = combo >= 50  ? 1400
                   : combo >= 25  ? 1100
                   : combo >= 10  ? 950
                   : 800;
        const top  = combo >= 50  ? 2000
                   : combo >= 25  ? 1600
                   : combo >= 10  ? 1350
                   : 1200;
        // コンボ50以上はsineに変えて澄んだ音に
        osc.type = combo >= 50 ? 'sine' : 'square';
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(top, now + 0.05);
        // コンボが高いほど少し音量も上がる
        const vol = combo >= 50 ? 0.08 : combo >= 25 ? 0.065 : combo >= 10 ? 0.055 : 0.05;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now); osc.stop(now + 0.07);

    } else if (type === 'miss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);

    } else if (type === 'extend') {
        // クリアボーナス：明るく上昇する3音
        [0, 0.08, 0.16].forEach((delay, i) => {
            const o2 = audioCtx.createOscillator();
            const g2 = audioCtx.createGain();
            o2.connect(g2); g2.connect(audioCtx.destination);
            o2.type = 'sine';
            const freq = [600, 800, 1200][i];
            o2.frequency.setValueAtTime(freq, now + delay);
            o2.frequency.linearRampToValueAtTime(freq * 1.5, now + delay + 0.1);
            g2.gain.setValueAtTime(0.1, now + delay);
            g2.gain.linearRampToValueAtTime(0, now + delay + 0.2);
            o2.start(now + delay); o2.stop(now + delay + 0.2);
        });
    }
}

/* 3. UI & GAME LOOP */
const engine = new TypingEngine();
const ui = {
    jp: document.getElementById('sentenceJP'),
    roma: document.getElementById('romajiContainer'),
    meaning: document.getElementById('wordMeaning'),
    highScore: document.getElementById('highScoreDisplay'),
    panel: document.getElementById('panel'),
    score: document.getElementById('scoreDisplay'),
    combo: document.getElementById('comboDisplay'),
    time: document.getElementById('timeDisplay'),
    trace: document.getElementById('traceBar'),
    traceStatus: document.getElementById('traceStatus'),
    progress: document.getElementById('progressBar'),
    modal: document.getElementById('resultModal'),
    canvas: document.getElementById('matrixCanvas'),
    ctx: null, drops: [],
    
    initMatrix() {
        this.ctx = this.canvas.getContext("2d");
        this.resizeMatrix(); window.addEventListener("resize", () => this.resizeMatrix());
        const cols = Math.floor(this.canvas.width / 20);
        this.drops = Array(cols).fill(0);
        setInterval(() => this.drawMatrix(), 50);
    },
    resizeMatrix() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; },
    drawMatrix() {
        if (!this.ctx) return;
        // コンボに応じてマトリックスの速度・色・密度が変わる
        const combo = state ? state.combo : 0;
        const speed  = combo >= 50 ? 0.04 : combo >= 25 ? 0.07 : combo >= 10 ? 0.08 : 0.1;
        const resetP = combo >= 50 ? 0.94 : combo >= 25 ? 0.965 : 0.975;
        const color  = combo >= 100 ? "#ff003c" : combo >= 50 ? "#ffb000" : combo >= 25 ? "#00f3ff" : "#0F0";

        this.ctx.fillStyle = `rgba(0,0,0,${speed})`; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = color; this.ctx.font = "15px monospace";
        for (let i = 0; i < this.drops.length; i++) {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            this.ctx.fillText(text, i * 20, this.drops[i] * 20);
            if (this.drops[i] * 20 > this.canvas.height && Math.random() > resetP) this.drops[i] = 0;
            this.drops[i]++;
        }
    },
    // コンボに応じてパネル枠色を変える
    updateComboColor(combo) {
        const p = this.panel;
        p.style.borderColor = combo >= 100 ? 'var(--neon-red)'
            : combo >= 50  ? 'var(--neon-orange)'
            : combo >= 25  ? 'var(--neon-blue)'
            : combo >= 10  ? '#0f0'
            : '';
        p.style.boxShadow = combo >= 50
            ? `0 0 40px rgba(255,176,0,0.3)`
            : combo >= 25
            ? `0 0 30px rgba(0,243,255,0.2)`
            : '';
        // HUDのコンボ表示を強調
        if (this.combo) {
            this.combo.style.color = combo >= 100 ? 'var(--neon-red)'
                : combo >= 50  ? 'var(--neon-orange)'
                : combo >= 25  ? 'var(--neon-blue)'
                : 'var(--neon-green)';
            this.combo.style.fontSize = combo >= 50 ? '2.4rem' : combo >= 25 ? '2.2rem' : combo >= 10 ? '2rem' : '';
            this.combo.style.textShadow = combo >= 25 ? `0 0 15px currentColor` : '';
        }
    },
    // コンボリセット時に色を戻す
    resetComboColor() {
        this.panel.style.borderColor = '';
        this.panel.style.boxShadow = '';
        if (this.combo) {
            this.combo.style.color = '';
            this.combo.style.fontSize = '';
            this.combo.style.textShadow = '';
        }
    },
    // マイルストーンフラッシュ（10/25/50/100コンボ）
    milestoneFlash(combo) {
        const milestones = { 10: '#0f0', 25: '#00f3ff', 50: '#ffb000', 100: '#ff003c' };
        const color = milestones[combo];
        if (!color) return;
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;inset:0;background:${color};opacity:0.15;
            z-index:999;pointer-events:none;animation:milestoneFlash 0.4s ease-out forwards;`;
        document.body.appendChild(el);
        // テキスト表示
        const txt = document.createElement('div');
        txt.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            font-family:'Share Tech Mono',monospace;font-size:3rem;color:${color};
            text-shadow:0 0 20px ${color};z-index:1000;pointer-events:none;
            animation:milestoneFlash 0.8s ease-out forwards;`;
        txt.textContent = `${combo} COMBO!!`;
        document.body.appendChild(txt);
        setTimeout(() => { el.remove(); txt.remove(); }, 800);
    },
    updateView(jp, romaHTML, meaningText) {
        if(jp) this.jp.textContent = jp;
        if(meaningText !== null && this.meaning) {
            this.meaning.textContent = meaningText;
        }
        this.roma.innerHTML = romaHTML;
    },
    shake() {
        this.panel.classList.remove("shake"); void this.panel.offsetWidth; 
        this.panel.classList.add("shake", "flash-red");
        setTimeout(() => this.panel.classList.remove("flash-red"), 200);
    },
    spawnParticles() {
        const rect = this.panel.getBoundingClientRect();
        const centerX = rect.width / 2; const centerY = rect.height / 2;
        for(let i=0; i<8; i++) {
            const p = document.createElement("div"); p.className = "particle";
            const angle = Math.random() * Math.PI * 2; const dist = 50 + Math.random() * 100;
            p.style.left = centerX + "px"; p.style.top = centerY + "px";
            p.style.setProperty("--dx", Math.cos(angle) * dist + "px"); p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
            this.panel.appendChild(p); setTimeout(() => p.remove(), 500);
        }
    }
};

/* ----------------------------------------------------------------
   SUPABASE CONFIG
---------------------------------------------------------------- */
const SB_URL  = "https://yfnxmkqrmpbzpnqzsusg.supabase.co";
const SB_KEY  = "sb_publishable_SUagZt0Rs83NvR7T63l04g_va9NV_IB";

async function sbFetch(path, options = {}) {
    const res = await fetch(SB_URL + path, {
        ...options,
        headers: {
            "apikey": SB_KEY,
            "Authorization": "Bearer " + SB_KEY,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }
    // 204 No Content の場合はボディなし
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function postScore(name, score, level, kpm, accuracy) {
    return sbFetch("/rest/v1/rankings", {
        method: "POST",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify({ name, score, level, kpm, accuracy: parseFloat(accuracy) })
    });
}

async function fetchRanking(level) {
    return sbFetch(`/rest/v1/rankings?level=eq.${level}&order=score.desc&limit=10&select=name,score,kpm,accuracy,created_at`);
}

/* ----------------------------------------------------------------
   DIFFICULTY CONFIG
---------------------------------------------------------------- */
const DIFFICULTY = {
    EASY:   { traceSpeed: 0.03, missPenalty: 5.0,  scoreMult: 1.0, clearBonus: 500  },
    NORMAL: { traceSpeed: 0.08, missPenalty: 8.0,  scoreMult: 1.5, clearBonus: 1000 },
    OMEGA:  { traceSpeed: 0.15, missPenalty: 15.0, scoreMult: 2.5, clearBonus: 2000 },
};

/* ----------------------------------------------------------------
   STATE
---------------------------------------------------------------- */
let state = {
    playing: false, paused: false,
    startTime: 0, pausedAt: 0,
    timeLimit: 60, score: 0, combo: 0, maxCombo: 0,
    trace: 0, traceSpeed: 0.08, missPenalty: 8.0, currentLevel: 'NORMAL',
    missCount: 0, correctCount: 0, totalKeystrokes: 0, totalChunks: 0
};
let loopId = null;

function getHighScore(level) { return parseInt(localStorage.getItem(`hackerTyperHighScore_${level || state.currentLevel}`)) || 0; }

function updateHUD() {
    if (ui.highScore) ui.highScore.textContent = "$" + getHighScore().toLocaleString();
}

function updateGameSettings() {
    ui.time.textContent = state.timeLimit.toFixed(2);
    ui.score.textContent = "$0";
    if (ui.combo) ui.combo.textContent = "0";
    if (ui.kpm)   ui.kpm.textContent   = "0";
    updateHUD();
}

function startGame(level) {
    if (loopId) cancelAnimationFrame(loopId);
    state.currentLevel = level;
    const diff = DIFFICULTY[level];
    state.traceSpeed  = diff.traceSpeed;
    state.missPenalty = diff.missPenalty;

    engine.setDifficulty(level);
    updateGameSettings();

    state.playing = true; state.paused = false;
    state.startTime = performance.now(); state.pausedAt = 0;
    state.score = 0; state.combo = 0; state.maxCombo = 0; state.trace = 0;
    state.missCount = 0; state.correctCount = 0; state.totalKeystrokes = 0; state.totalChunks = 0;

    ui.modal.classList.remove('active');
    hidePauseOverlay();
    ui.resetComboColor();
    document.getElementById('controls').style.display = 'none';
    nextWord();
    gameLoop();
}

function nextWord() {
    const next = engine.setSentence();
    state.totalChunks = engine.currentKanaList.length;
    ui.updateView(next.display, engine.getDisplayHTML(), next.meaning);
    ui.progress.style.width = "0%";
}

/* --- PAUSE --- */
function showPauseOverlay() {
    let el = document.getElementById('pauseOverlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pauseOverlay';
        el.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.8);
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            z-index:50;font-family:'Share Tech Mono',monospace;color:#0f0;`;
        el.innerHTML = `<div style="font-size:2.5rem;text-shadow:0 0 10px #0f0;margin-bottom:16px;">// PAUSED</div>
            <div style="color:#666;font-size:0.9rem;">ESC to resume &nbsp;|&nbsp; R to abort</div>`;
        document.getElementById('panel').appendChild(el);
    }
    el.style.display = 'flex';
}
function hidePauseOverlay() {
    const el = document.getElementById('pauseOverlay');
    if (el) el.style.display = 'none';
}
function pauseGame() {
    if (!state.playing || state.paused) return;
    state.paused = true; state.pausedAt = performance.now();
    cancelAnimationFrame(loopId);
    showPauseOverlay();
}
function resumeGame() {
    if (!state.playing || !state.paused) return;
    state.paused = false;
    state.startTime += (performance.now() - state.pausedAt);
    hidePauseOverlay();
    gameLoop();
}

function gameLoop() {
    if (!state.playing || state.paused) return;
    const now = performance.now();
    const elapsed = (now - state.startTime) / 1000;
    const remain = Math.max(0, state.timeLimit - elapsed);

    ui.time.textContent = remain.toFixed(2);
    state.trace += state.traceSpeed;
    ui.trace.style.width = Math.min(100, state.trace) + "%";

    if (state.trace > 80) ui.traceStatus.classList.add('active');
    else ui.traceStatus.classList.remove('active');

    if (elapsed > 1 && ui.kpm) {
        ui.kpm.textContent = Math.round(state.correctCount / elapsed * 60);
    }

    if (remain <= 0) endGame("TIME UP");
    else if (state.trace >= 100) endGame("TRACE DETECTED");
    else loopId = requestAnimationFrame(gameLoop);
}

/* ----------------------------------------------------------------
   END GAME + RANKING
---------------------------------------------------------------- */
function endGame(reason) {
    state.playing = false; state.paused = false;
    cancelAnimationFrame(loopId);
    hidePauseOverlay();
    document.getElementById('controls').style.display = 'flex';

    const currentHighScore = getHighScore();
    let isNewRecord = false;
    if (state.score > currentHighScore) {
        localStorage.setItem(`hackerTyperHighScore_${state.currentLevel}`, state.score);
        isNewRecord = true;
    }

    const playedTime = (performance.now() - state.startTime) / 1000;
    const kpm = playedTime > 0 ? Math.round(state.correctCount / playedTime * 60) : 0;
    const totalAttempts = state.correctCount + state.missCount;
    const accuracy = totalAttempts > 0 ? ((state.correctCount / totalAttempts) * 100).toFixed(1) : "100.0";
    const accColor = parseFloat(accuracy) >= 95 ? 'var(--neon-green)' : parseFloat(accuracy) >= 80 ? 'var(--neon-orange)' : 'var(--neon-red)';

    const titleText  = reason === "TRACE DETECTED" ? "MISSION FAILED" : reason === "ABORTED" ? "ABORTED" : "TIME UP";
    const titleColor = reason === "TRACE DETECTED" ? "var(--neon-red)" : reason === "ABORTED" ? "var(--neon-orange)" : "var(--neon-green)";

    document.getElementById('resultTitle').textContent = titleText;
    document.getElementById('resultTitle').style.color = titleColor;

    const shareText = `【HACKER TYPER: OMEGA】\n` +
        `LEVEL: ${state.currentLevel}\n` +
        `SCORE: $${state.score.toLocaleString()}\n` +
        `KPM: ${kpm}　ACCURACY: ${accuracy}%\n` +
        `MAX COMBO: ${state.maxCombo}\n` +
        `#HackerTyper #タイピング`;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

    // スコア0・ABORTED はランキング送信しない
    const canSubmit = state.score > 0 && reason !== "ABORTED";

    document.getElementById('finalSummary').innerHTML = `
        <h4 style="margin:0;color:#888;">LEVEL: ${state.currentLevel}</h4>
        ${isNewRecord ? '<h3 style="color:var(--neon-orange);margin-top:10px;margin-bottom:15px;animation:blink 0.8s infinite;">★ NEW RECORD ★</h3>' : ''}
        <div class="stat-row" style="font-size:1.5rem;font-weight:bold;border-bottom:2px solid #555;padding-bottom:10px;margin-bottom:15px;margin-top:10px;">
            <span>SCORE:</span><span style="color:var(--neon-blue);">$${state.score.toLocaleString()}</span>
        </div>
        <div class="stat-row"><span>HIGH SCORE:</span><span>$${Math.max(state.score, currentHighScore).toLocaleString()}</span></div>
        <div class="stat-row"><span>MAX COMBO:</span><span>${state.maxCombo}</span></div>
        <div class="stat-row"><span>KPM:</span><span>${kpm}</span></div>
        <div class="stat-row"><span>ACCURACY:</span><span style="color:${accColor};">${accuracy}%</span></div>
        <div class="stat-row"><span>MISS:</span><span style="color:${state.missCount > 0 ? 'var(--neon-red)' : 'var(--neon-green)'};">${state.missCount}</span></div>

        ${canSubmit ? `
        <div id="rankingSubmit" style="margin-top:20px;border-top:1px solid #333;padding-top:16px;">
            <div style="color:#888;font-size:0.85rem;margin-bottom:8px;">ランキングに登録する（最大12文字）</div>
            <div style="display:flex;gap:8px;">
                <input id="playerName" maxlength="12" placeholder="YOUR NAME"
                    style="flex:1;background:#111;border:1px solid #0f0;color:#0f0;
                    padding:8px;font-family:'Share Tech Mono',monospace;font-size:1rem;">
                <button id="btnSubmitScore"
                    style="background:#000;border:2px solid #0f0;color:#0f0;
                    padding:8px 16px;font-family:'Share Tech Mono',monospace;
                    font-size:1rem;cursor:pointer;white-space:nowrap;">
                    SUBMIT
                </button>
            </div>
            <div id="submitMsg" style="margin-top:8px;font-size:0.85rem;min-height:1.2em;"></div>
        </div>` : ''}

        <div style="display:flex;gap:8px;margin-top:16px;">
            <a href="${shareUrl}" target="_blank" rel="noopener" style="
                flex:1;display:block;padding:12px;
                background:#000;border:2px solid #1d9bf0;color:#1d9bf0;
                font-family:'Share Tech Mono',monospace;font-size:1rem;
                text-decoration:none;text-align:center;letter-spacing:2px;transition:all 0.2s;
            " onmouseover="this.style.background='#1d9bf0';this.style.color='#000';"
               onmouseout="this.style.background='#000';this.style.color='#1d9bf0';">POST TO X</a>
            <button id="btnShowRanking" style="
                flex:1;background:#000;border:2px solid #555;color:#888;
                font-family:'Share Tech Mono',monospace;font-size:1rem;
                cursor:pointer;letter-spacing:2px;transition:all 0.2s;
            " onmouseover="this.style.borderColor='#0f0';this.style.color='#0f0';"
               onmouseout="this.style.borderColor='#555';this.style.color='#888';">RANKING</button>
        </div>
        <div id="rankingBoard" style="display:none;margin-top:16px;"></div>
    `;

    ui.modal.classList.add('active');
    updateHUD();

    // SUBMITボタン
    document.getElementById('btnSubmitScore')?.addEventListener('click', async () => {
        const nameInput = document.getElementById('playerName');
        const msg = document.getElementById('submitMsg');
        const name = nameInput.value.trim();
        if (!name) { msg.style.color = 'var(--neon-red)'; msg.textContent = "名前を入力してください"; return; }

        const btn = document.getElementById('btnSubmitScore');
        btn.textContent = "SENDING..."; btn.disabled = true;
        msg.style.color = '#888'; msg.textContent = "";

        try {
            await postScore(name, state.score, state.currentLevel, kpm, accuracy);
            msg.style.color = 'var(--neon-green)';
            msg.textContent = "✅ 登録完了！";
            document.getElementById('rankingSubmit').style.opacity = '0.5';
            btn.style.display = 'none';
            // 登録後すぐランキングを表示
            showRankingBoard(state.currentLevel);
        } catch(e) {
            msg.style.color = 'var(--neon-red)';
            msg.textContent = "送信エラー。もう一度お試しください。";
            btn.textContent = "SUBMIT"; btn.disabled = false;
        }
    });

    // RANKINGボタン
    document.getElementById('btnShowRanking')?.addEventListener('click', () => {
        const board = document.getElementById('rankingBoard');
        if (board.style.display === 'none') {
            showRankingBoard(state.currentLevel);
        } else {
            board.style.display = 'none';
            document.getElementById('btnShowRanking').textContent = 'RANKING';
        }
    });
}

async function showRankingBoard(level) {
    const board = document.getElementById('rankingBoard');
    const btn   = document.getElementById('btnShowRanking');
    board.style.display = 'block';
    board.innerHTML = `<div style="color:#555;text-align:center;padding:10px;">LOADING...</div>`;
    if (btn) btn.textContent = 'HIDE';

    try {
        const data = await fetchRanking(level);
        if (!data || data.length === 0) {
            board.innerHTML = `<div style="color:#555;text-align:center;padding:10px;">まだ記録がありません</div>`;
            return;
        }
        const medalColor = ['#ffd700','#c0c0c0','#cd7f32'];
        let html = `<div style="font-size:0.8rem;color:#555;text-align:center;margin-bottom:8px;">─ TOP ${data.length} / ${level} ─</div>`;
        data.forEach((r, i) => {
            const medal = i < 3 ? `<span style="color:${medalColor[i]};">${['①','②','③'][i]}</span>` : `<span style="color:#555;">${String(i+1).padStart(2,' ')}.</span>`;
            html += `<div style="display:flex;justify-content:space-between;align-items:center;
                padding:6px 4px;border-bottom:1px dotted #222;font-size:0.9rem;">
                <span>${medal} <span style="color:#ddd;">${escHtml(r.name)}</span></span>
                <span style="color:var(--neon-blue);font-weight:bold;">$${Number(r.score).toLocaleString()}</span>
            </div>`;
        });
        board.innerHTML = html;
    } catch(e) {
        board.innerHTML = `<div style="color:var(--neon-red);text-align:center;padding:10px;">読み込みエラー</div>`;
    }
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!state.playing) return;
        if (state.paused) resumeGame(); else pauseGame();
        return;
    }
    if ((e.key === 'r' || e.key === 'R') && state.playing && state.paused) {
        endGame("ABORTED"); return;
    }

    if (!state.playing || state.paused) return;
    if (e.key.length !== 1) return;

    const res = engine.input(e.key.toLowerCase());
    state.totalKeystrokes++;

    if (res === "MISS") {
        playSound('miss');
        state.combo = 0; state.missCount++; state.trace += state.missPenalty;
        ui.shake();
        ui.resetComboColor();
    } else {
        playSound('type');
        state.combo++; state.correctCount++;
        if (state.combo > state.maxCombo) state.maxCombo = state.combo;

        const diff = DIFFICULTY[state.currentLevel];
        const earned = Math.floor((50 + Math.floor(state.combo / 2)) * diff.scoreMult);
        state.score += earned;
        const comboBonus = Math.min(state.combo * 0.2, 4.0);
        state.trace = Math.max(0, state.trace - (0.5 + comboBonus));

        // コンボ演出
        ui.updateComboColor(state.combo);

        if (state.totalChunks > 0) {
            ui.progress.style.width = Math.min(100, (engine.chunkIndex / state.totalChunks) * 100) + "%";
        }

        if (res === "SENTENCE_CLEAR") {
            ui.spawnParticles(); playSound('extend');
            state.score += diff.clearBonus;
            state.trace = Math.max(0, state.trace - 25);
            setTimeout(nextWord, 50);
        }
    }

    ui.updateView(null, engine.getDisplayHTML(), null);
    ui.score.textContent = "$" + state.score.toLocaleString();
    ui.combo.textContent = state.combo;
});

// イベントリスナーの登録
document.getElementById('btnEasy')?.addEventListener('click', () => { state.currentLevel='EASY'; updateHUD(); startGame('EASY'); });
document.getElementById('btnNormal')?.addEventListener('click', () => { state.currentLevel='NORMAL'; updateHUD(); startGame('NORMAL'); });
document.getElementById('btnOmega')?.addEventListener('click', () => { state.currentLevel='OMEGA'; updateHUD(); startGame('OMEGA'); });

document.getElementById('closeResult')?.addEventListener('click', () => {
    ui.modal.classList.remove('active');
    updateGameSettings();
});

// 初期化
ui.initMatrix();
updateGameSettings();