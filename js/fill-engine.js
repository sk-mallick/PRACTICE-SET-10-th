import { Sound, Effects, injectHeader, injectFooter, injectMenu, getParams, discoverSetsFromConfig, discoverSetsFallback, UX, initPrintProtection } from './ui.js';

let allQuestions = [];
let displayQuestions = [];
let currentSetId = 1;
let availableSets = [1];

async function init() {
    // 0. Init Print Protection
    initPrintProtection();

    const { topic, level, set } = getParams();
    currentSetId = set;

    // 1. Show Fill Specific Skeletons IMMEDIATELY
    const container = document.getElementById('quiz-container');
    if (!container) {
        console.error('Quiz container not found in HTML');
        return;
    }
    container.innerHTML = Array(5).fill(UX.Skeletons.getFillSkeleton()).join('');

    // 2. PARALLEL LOAD: Config + Data fetched simultaneously (saves 200-400ms)
    const configPath = `../data/${topic}/${level}/config.js`;
    const dataUrl = `../data/${topic}/${level}/set${set}.json`;

    const [config, dataResult] = await Promise.all([
        import(configPath).then(m => m.default).catch(() => ({})),
        fetch(dataUrl).then(res => {
            if (!res.ok) throw new Error("Set not found");
            return res.json();
        }).catch(e => ({ error: true, message: e.message, url: dataUrl }))
    ]);

    // 3. Inject Header (uses config, no network)
    injectHeader(
        config.headerTitle || topic.replace(/-/g, ' '),
        `${config.headerSubtitlePrefix || "By Chiranjibi Sir"} • ${config.level || "CLASS 10"} • SET ${set}`
    );

    injectFooter();

    // 4. Discover Sets INSTANTLY from config (zero network calls)
    const configSets = discoverSetsFromConfig(config);
    availableSets = configSets || await discoverSetsFallback(topic, level);

    // 5. Handle Data Result
    if (dataResult && dataResult.error) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500 font-bold">Failed to load: ${dataResult.url}<br>${dataResult.message}</div>`;
        setupMenu();
        return;
    }

    // Ensure data is an array
    if (!Array.isArray(dataResult)) {
        console.error('Data is not an array:', dataResult);
        container.innerHTML = `<div class="text-center py-20 text-slate-500 font-bold">Invalid data format received</div>`;
        setupMenu();
        return;
    }

    // Validate and filter questions
    const validQuestions = dataResult.filter((q, idx) => {
        if (!q || typeof q !== 'object') {
            console.warn(`Question at index ${idx} is invalid:`, q);
            return false;
        }
        if (!q.q || typeof q.q !== 'string') {
            console.warn(`Question at index ${idx} missing question text`);
            return false;
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
            console.warn(`Question at index ${idx} has invalid options`, q.options);
            return false;
        }
        if (q.answer === undefined || q.answer === null || q.answer < 0 || q.answer >= q.options.length) {
            console.warn(`Question at index ${idx} has invalid answer index: ${q.answer}, options length: ${q.options.length}`);
            return false;
        }
        return true;
    });

    if (validQuestions.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500 font-bold">⚠️ No valid questions found. Data may be corrupted.</div>`;
        setupMenu();
        return;
    }

    if (validQuestions.length < dataResult.length) {
        const skipped = dataResult.length - validQuestions.length;
        console.warn(`⚠️ Skipped ${skipped} invalid questions. ${validQuestions.length} valid questions loaded.`);
    }

    allQuestions = validQuestions;
    // Questions appear in original order from the set file
    displayQuestions = [...allQuestions];

    // 6. Prefetch next set in background
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
        (count) => {
            generateRandomQuestions(count);
        }
    );
}

// Load all sets and generate random questions from combined pool
async function generateRandomQuestions(count) {
    const { topic, level } = getParams();
    const c = parseInt(count) || 10;

    // Show loading state
    const container = document.getElementById('quiz-container');
    const originalContent = container.innerHTML;
    container.innerHTML = '<div class="text-center py-20 text-slate-400"><p>🔄 Loading questions from all sets...</p></div>';

    try {
        // Combine questions from all available sets
        let allCombinedQuestions = [];

        for (const setNum of availableSets) {
            try {
                const response = await fetch(`../data/${topic}/${level}/set${setNum}.json`);
                if (response.ok) {
                    const setQuestions = await response.json();
                    if (Array.isArray(setQuestions)) {
                        allCombinedQuestions = allCombinedQuestions.concat(setQuestions);
                    }
                }
            } catch (e) {
                console.warn(`Failed to load set${setNum}:`, e);
            }
        }

        // Validate combined data
        if (allCombinedQuestions.length === 0) {
            container.innerHTML = '<div class="text-center py-20 text-red-500">❌ No questions found to generate</div>';
            return;
        }

        // Validate each question has required fields
        const validQuestions = allCombinedQuestions.filter(q => {
            return q && q.q && Array.isArray(q.options) && q.options.length >= 2 && q.answer !== undefined;
        });

        if (validQuestions.length === 0) {
            container.innerHTML = '<div class="text-center py-20 text-red-500">❌ No valid questions found. Data may be corrupted.</div>';
            return;
        }

        // Show stats
        console.log(`✅ Loaded ${validQuestions.length} valid questions from ${availableSets.length} sets`);

        // Shuffle and select
        const shuffled = UX.fisherYatesShuffle(validQuestions);
        displayQuestions = shuffled.slice(0, Math.min(c, validQuestions.length));

        render();
        closeMenu();

    } catch (e) {
        console.error('Error generating random questions:', e);
        container.innerHTML = `<div class="text-center py-20 text-red-500">❌ Error: ${e.message}</div>`;
    }
}

function closeMenu() {
    document.getElementById('teacher-menu').classList.remove('open');
}

// Build a single fill card and append to parent (DocumentFragment or container)
function buildFillCard(item, index, parent) {
    if (!item || !item.options || !Array.isArray(item.options) || item.answer === undefined) {
        console.warn('Invalid question format at index', index, item);
        return;
    }

    const displayNum = index + 1;
    const yearText = item.year !== undefined && item.year !== null ? String(item.year).trim() : '';

    const card = document.createElement('div');
    card.className = "relative opacity-0 fill-card-entry bg-[#1e293b] rounded-xl border border-slate-700/50 shadow-lg overflow-hidden break-inside-avoid inline-block w-full mb-1";
    card.setAttribute('data-answered', 'false');

    const qContent = document.createElement('div');
    qContent.className = "p-4 md:p-5 pr-20 md:pr-24 flex flex-wrap md:flex-nowrap gap-3 md:gap-4 items-baseline";

    // Create a wrapper for question number + mobile year badge
    const numWrapper = document.createElement('div');
    numWrapper.className = "flex flex-col md:block";

    const qNum = document.createElement('span');
    qNum.className = "font-black text-[#38bdf8] text-xl md:text-2xl min-w-[1.8rem]";
    qNum.textContent = `${displayNum}.`;
    numWrapper.appendChild(qNum);

    // Mobile year badge (below question number)
    if (yearText) {
        const yearBadgeMobile = document.createElement('span');
        yearBadgeMobile.className = "md:hidden inline-flex items-center px-2.5 py-1 rounded-full border border-cyan-700/60 bg-cyan-900/25 text-cyan-200 text-xs font-bold tracking-wide shadow-sm mt-1";
        yearBadgeMobile.textContent = yearText;
        numWrapper.appendChild(yearBadgeMobile);
    }

    const textContainer = document.createElement('div');
    textContainer.className = "text-white font-bold text-lg md:text-xl leading-snug tracking-wide flex-1";

    const blankId = `blank-${displayNum}`;
    let processedText = (item.q || '').replace(/_{2,}|\.{3,}|…/g, `<span id="${blankId}" class="inline-block min-w-[100px] border-b-2 border-slate-500 text-transparent text-center px-1 transition-all font-extrabold">_______</span>`);
    textContainer.innerHTML = processedText;

    // Desktop year badge (top right absolute)
    if (yearText) {
        const yearBadgeDesktop = document.createElement('span');
        yearBadgeDesktop.className = "hidden md:inline-flex absolute top-3 right-3 items-center px-2.5 py-1 rounded-full border border-cyan-700/60 bg-cyan-900/25 text-cyan-200 text-xs font-bold tracking-wide shadow-sm";
        yearBadgeDesktop.textContent = yearText;
        card.appendChild(yearBadgeDesktop);
    }

    const btnContainer = document.createElement('span');
    btnContainer.className = "inline-flex flex-wrap gap-2 ml-3 align-baseline";

    const correctText = item.options[item.answer];
    let opts = item.options.map(opt => ({ text: opt, isCorrect: opt === correctText }));

    // Fisher-Yates shuffle for proper uniform distribution
    opts = UX.fisherYatesShuffle(opts);

    opts.forEach(optObj => {
        const btn = document.createElement('button');
        btn.className = "px-3 py-1 rounded-full border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all duration-200 active:scale-95 shadow-sm align-middle";
        btn.textContent = optObj.text;
        btn.onclick = () => handleAnswer(btn, optObj, blankId, btnContainer, card);
        btnContainer.appendChild(btn);
    });

    textContainer.appendChild(btnContainer);
    qContent.appendChild(numWrapper);
    qContent.appendChild(textContainer);
    card.appendChild(qContent);
    parent.appendChild(card);
}

function render() {
    const container = document.getElementById('quiz-container');
    if (!container) {
        console.error('Quiz container not found');
        return;
    }

    container.innerHTML = '';

    if (!displayQuestions || displayQuestions.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500">No questions found.</div>`;
        return;
    }

    // Batch render ALL questions using DocumentFragment (single DOM operation)
    UX.renderBatch(displayQuestions, buildFillCard, container);

    // TRIGGER STAGGER ANIMATION after a microtask (so DOM is ready)
    requestAnimationFrame(() => {
        UX.staggerElements('.fill-card-entry', 30);
    });
}

function handleAnswer(btn, optObj, blankId, container, card) {
    if (card.getAttribute('data-answered') === 'true') return;

    // Visual feedback immediately
    btn.style.transform = "scale(0.95)";

    if (optObj.isCorrect) {
        // CORRECT: Instant
        Sound.playCorrect();
        Effects.triggerConfetti();

        btn.className = "px-3 py-1 rounded-full border border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pop pointer-events-none align-middle transition-all";

        const blank = document.getElementById(blankId);
        if (blank) {
            blank.textContent = optObj.text;
            blank.classList.remove('text-transparent', 'border-slate-500');
            blank.classList.add('text-[#34d399]', 'border-[#34d399]');
        }
        card.setAttribute('data-answered', 'true');

        // Disable siblings
        const siblings = container.querySelectorAll('button');
        siblings.forEach(b => {
            if (b !== btn) {
                b.disabled = true;
                b.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

    } else {
        // WRONG: Slight delay
        setTimeout(() => {
            Sound.playWrong();
            btn.className = "px-3 py-1 rounded-full border border-red-500 bg-red-500/20 text-red-400 font-semibold text-sm animate-shake align-middle cursor-not-allowed";
            btn.disabled = true;
            btn.style.transform = "scale(1)";
        }, 150);
    }
}

init();
