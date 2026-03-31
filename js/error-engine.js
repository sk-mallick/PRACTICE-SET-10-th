import { Sound, Effects, injectHeader, injectFooter, injectMenu, getParams, discoverSetsFromConfig, discoverSetsFallback, UX, initPrintProtection } from './ui.js';

let allQuestions = [];
let displayQuestions = [];
let currentSetId = 1;
let availableSets = [1];

async function init() {
    initPrintProtection();

    const { topic, level, set } = getParams();
    currentSetId = set;

    const container = document.getElementById('quiz-container');
    if (!container) { console.error('Quiz container not found'); return; }
    container.innerHTML = Array(5).fill(UX.Skeletons.getMCQSkeleton()).join('');

    const configPath = `../data/${topic}/${level}/config.js`;
    const dataUrl = `../data/${topic}/${level}/set${set}.json?v=${Date.now()}`;

    const [config, dataResult] = await Promise.all([
        import(configPath).then(m => m.default).catch(() => ({})),
        fetch(dataUrl).then(res => {
            if (!res.ok) throw new Error("Set not found");
            return res.json();
        }).catch(e => ({ error: true, message: e.message, url: dataUrl }))
    ]);

    injectHeader(
        config.headerTitle || topic.replace(/-/g, ' '),
        `${config.headerSubtitlePrefix || "By Chiranjibi Sir"} • ${level.toUpperCase()} • SET ${set}`
    );
    injectFooter();

    const configSets = discoverSetsFromConfig(config);
    availableSets = configSets || await discoverSetsFallback(topic, level);

    if (dataResult && dataResult.error) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500 font-bold">Failed to load: ${dataResult.url}<br>${dataResult.message}</div>`;
        setupMenu();
        return;
    }

    if (!Array.isArray(dataResult)) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500 font-bold">Invalid data format received</div>`;
        setupMenu();
        return;
    }

    const validQuestions = dataResult.filter((q, idx) => {
        if (!q || typeof q !== 'object') return false;
        if (!q.q || typeof q.q !== 'string') return false;
        if (!Array.isArray(q.options) || q.options.length < 2) return false;
        if (q.answer === undefined || q.answer < 0 || q.answer >= q.options.length) return false;
        return true;
    });

    if (validQuestions.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500 font-bold">⚠️ No valid questions found. Data may be corrupted.</div>`;
        setupMenu();
        return;
    }

    allQuestions = validQuestions;
    displayQuestions = [...allQuestions];

    UX.prefetchNextSet(topic, level, set);
    setupMenu();
    render();
}

function setupMenu() {
    injectMenu(
        currentSetId,
        availableSets,
        (newSet) => {
            const { topic, level } = getParams();
            window.location.href = `?subject=${topic}&level=${level}&set=${newSet}`;
        },
        (filterType) => {
            if (filterType === 'odd') displayQuestions = allQuestions.filter((_, i) => (i + 1) % 2 !== 0);
            if (filterType === 'even') displayQuestions = allQuestions.filter((_, i) => (i + 1) % 2 === 0);
            render();
            closeMenu();
        },
        (count) => { generateRandomQuestions(count); }
    );
}

async function generateRandomQuestions(count) {
    const { topic, level } = getParams();
    const c = parseInt(count) || 10;

    const container = document.getElementById('quiz-container');
    container.innerHTML = '<div class="text-center py-20 text-slate-400"><p>🔄 Loading questions from all sets...</p></div>';

    try {
        let allCombined = [];
        for (const setNum of availableSets) {
            try {
                const res = await fetch(`../data/${topic}/${level}/set${setNum}.json?v=${Date.now()}`);
                if (res.ok) {
                    const setQ = await res.json();
                    if (Array.isArray(setQ)) allCombined = allCombined.concat(setQ);
                }
            } catch (e) { console.warn(`Failed to load set${setNum}:`, e); }
        }

        const valid = allCombined.filter(q => q && q.q && Array.isArray(q.options) && q.options.length >= 2 && q.answer !== undefined);
        if (valid.length === 0) {
            container.innerHTML = '<div class="text-center py-20 text-red-500">❌ No valid questions found.</div>';
            return;
        }

        const shuffled = UX.fisherYatesShuffle(valid);
        displayQuestions = shuffled.slice(0, Math.min(c, valid.length));
        render();
        closeMenu();
    } catch (e) {
        container.innerHTML = `<div class="text-center py-20 text-red-500">❌ Error: ${e.message}</div>`;
    }
}

function closeMenu() {
    const menu = document.getElementById('teacher-menu');
    if (menu) menu.classList.remove('open');
}

// Build a single error-finding card (MCQ-style layout)
function buildErrorCard(item, index, parent) {
    if (!item || !item.options || !Array.isArray(item.options) || item.answer === undefined) return;

    const displayNum = index + 1;
    const yearText = item.year !== undefined && item.year !== null ? String(item.year).trim() : '';

    const card = document.createElement('div');
    card.className = "opacity-0 error-card-entry bg-[#1e293b] rounded-xl md:rounded-2xl shadow-2xl border-2 border-slate-700 overflow-hidden break-inside-avoid mb-4";
    card.setAttribute('data-answered', 'false');

    // Header — blue theme matching MCQ
    const header = document.createElement('div');
    header.className = "bg-[#0f172a] px-4 py-3 md:px-6 md:py-4 border-b border-slate-700 flex flex-wrap md:flex-nowrap gap-3 md:gap-4 items-start";
    header.innerHTML = `
        <div class="flex flex-col gap-1.5 md:flex-row md:gap-0">
            <span class="font-black text-blue-400 text-lg md:text-xl whitespace-nowrap mt-0.5 bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800 shadow-[0_0_10px_rgba(30,58,138,0.5)]">Q${displayNum}</span>
            ${yearText ? `<span class="inline-flex md:hidden items-center self-start px-2.5 py-1 rounded-full border border-cyan-700/60 bg-cyan-900/25 text-cyan-200 text-xs font-bold tracking-wide shadow-sm">${yearText}</span>` : ''}
        </div>
        <div class="min-w-0 flex-1 order-last md:order-none w-full md:w-auto">
            <p class="text-white font-bold text-lg md:text-xl leading-relaxed tracking-wide pt-0.5">${item.q.replace(/\s*\/\s*/g, ' <span class="text-blue-500/60 font-black">/</span> ')}</p>
        </div>
        ${yearText ? `<span class="hidden md:inline-flex items-center self-start mt-0.5 shrink-0 px-2.5 py-1 rounded-full border border-cyan-700/60 bg-cyan-900/25 text-cyan-200 text-xs font-bold tracking-wide shadow-sm">${yearText}</span>` : ''}
    `;

    // Options — 2-column grid matching MCQ
    const optsDiv = document.createElement('div');
    optsDiv.className = "p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4";

    const labels = ['1', '2', '3', '4'];
    item.options.forEach((optText, i) => {
        const btn = document.createElement('button');
        btn.className = "option-btn w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-lg md:rounded-xl border-2 border-slate-600 text-slate-100 font-bold text-base md:text-lg bg-slate-800 hover:bg-slate-700 hover:border-slate-500 focus:outline-none relative overflow-hidden group flex items-center shadow-lg transition-all transform active:scale-95";

        btn.innerHTML = `
            <span class="badge-default inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black mr-3 transition-colors shrink-0 border border-slate-500 bg-slate-700 text-slate-400 group-hover:border-slate-400">${labels[i]}</span>
            <span class="flex-1">${optText}</span>
        `;

        btn.onclick = () => handleAnswer(btn, i, item, optsDiv, card, displayNum);
        optsDiv.appendChild(btn);
    });

    // Correction container (hidden initially)
    const corrDiv = document.createElement('div');
    corrDiv.id = `correction-${displayNum}`;
    corrDiv.className = "hidden";

    card.appendChild(header);
    card.appendChild(optsDiv);
    card.appendChild(corrDiv);
    parent.appendChild(card);
}

function handleAnswer(btn, index, item, container, card, qNum) {
    if (card.getAttribute('data-answered') === 'true') return;

    const badge = btn.querySelector('span');
    btn.style.transform = "scale(0.98)";

    if (index === item.answer) {
        // CORRECT
        Sound.playCorrect();
        Effects.triggerConfetti();

        btn.className = "option-btn w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-lg md:rounded-xl border-2 border-[#22c55e] bg-[#16a34a] text-white font-bold text-base md:text-lg shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center opacity-100 transition-all duration-200";
        if (badge) badge.className = "inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black mr-3 shrink-0 border border-white text-white bg-transparent";

        btn.style.transform = "scale(1)";
        card.setAttribute('data-answered', 'true');

        // Show correction banner
        const corrDiv = document.getElementById(`correction-${qNum}`);
        if (corrDiv && item.correction) {
            corrDiv.innerHTML = `
                <div class="mx-4 mb-4 md:mx-6 md:mb-6 bg-emerald-900/20 border border-emerald-800/50 rounded-lg px-5 py-4">
                    <p class="text-emerald-400 font-extrabold text-base md:text-lg tracking-wide">${item.correction}</p>
                </div>
            `;
            corrDiv.classList.remove('hidden');
        } else if (corrDiv && !item.correction) {
            corrDiv.innerHTML = `
                <div class="mx-4 mb-4 md:mx-6 md:mb-6 bg-emerald-900/20 border border-emerald-800/50 rounded-lg px-5 py-4">
                    <p class="text-emerald-400 font-extrabold text-base md:text-lg tracking-wide">No error — the sentence is correct.</p>
                </div>
            `;
            corrDiv.classList.remove('hidden');
        }

    } else {
        // WRONG
        setTimeout(() => {
            Sound.playWrong();
            btn.className = "option-btn w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-lg md:rounded-xl border-2 border-[#ef4444] bg-[#dc2626] text-white font-bold text-base md:text-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-shake flex items-center opacity-100";
            if (badge) badge.className = "inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black mr-3 shrink-0 border border-white text-white bg-transparent";
            btn.style.transform = "scale(1)";
        }, 150);
    }
}

function render() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = '';

    if (!displayQuestions || displayQuestions.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500">No questions found.</div>`;
        return;
    }

    UX.renderBatch(displayQuestions, buildErrorCard, container);

    requestAnimationFrame(() => {
        UX.staggerElements('.error-card-entry', 30);
    });
}

init();
