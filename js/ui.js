// --- 1. TAILWIND CONFIGURATION ---
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Times New Roman', 'serif'] },
                screens: { 'xs': '375px' },
                colors: {
                    slate: { 850: '#1e293b', 900: '#0f172a', 950: '#020617' },
                    gold: { 400: '#FACC15', 500: '#EAB308', 600: '#CA8A04' }
                },
                animation: {
                    'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                    'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                },
                keyframes: {
                    shake: {
                        '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                        '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                        '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                        '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
                    },
                    pop: {
                        '0%': { transform: 'scale(0.8)', opacity: '0' },
                        '100%': { transform: 'scale(1)', opacity: '1' }
                    }
                }
            }
        }
    };
}

// --- 2. GLOBAL UX STYLES & ANIMATIONS ---
const uxStyle = document.createElement('style');
uxStyle.textContent = `
    /* Static Dark Skeletons (No Shimmer) */
    .skeleton-static {
        background-color: #334155;
        opacity: 0.5;
    }
    
    /* Staggered Entrance Animation */
    @keyframes slideUpFade {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-enter {
        animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0; /* Start hidden */
        will-change: transform, opacity;
    }

    /* Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
        .animate-enter {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
        }
    }

    /* Progress Bar */
    #nprogress-bar {
        position: fixed;
        left: 0;
        height: 3px;
        background: #EAB308;
        z-index: 9999;
        transition: width 0.3s ease-out, opacity 0.3s ease;
        box-shadow: 0 0 10px #EAB308;
        pointer-events: none;
    }
`;
document.head.appendChild(uxStyle);

// --- 3. COPY PROTECTION MODULE ---
export function initCopyProtection(options = {}) {
    if (window.__copyProtectionEnabled) return;
    window.__copyProtectionEnabled = true;

    const adminName = options.adminName || options.ownerName || 'Subham Sir';
    const brandLine = options.brandLine || `🔒 EnglishJibi Classes content is protected. 🚫 Unauthorized copying is prohibited. 👨‍💻 Developer/Admin: ${adminName}. 兒子，別抄襲了，專心學習吧😄`;

    // Replace copied content with a branded protection line.
    document.addEventListener('copy', (event) => {
        if (event.clipboardData) {
            event.clipboardData.setData('text/plain', brandLine);
        } else if (window.clipboardData) {
            window.clipboardData.setData('Text', brandLine);
        }
        event.preventDefault();
    }, true);
}

initCopyProtection({ adminName: 'Subham Sir' });

// --- 4. PRINT PROTECTION MODULE (MODULARIZED) ---
export function initPrintProtection() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
        /* HIDE ON SCREEN */
        #official-print-notice { display: none; }

        /* SHOW ON PRINT */
        @media print {
            @page { size: A4; margin: 0; }
            body, html {
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                width: 100% !important;
                overflow: hidden !important;
                background-color: #ffffff !important;
            }
            body > *:not(#official-print-notice) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            #official-print-notice {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                width: 100vw;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 2147483647;
                background: white;
                border: 20px solid white;
                box-sizing: border-box;
                font-family: 'Times New Roman', Times, serif;
                color: #000;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = 'official-print-notice';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:60px;font-weight:bold;color:rgba(0,0,0,0.03);white-space:nowrap;z-index:1;">ENGLISHJIBI CLASSES</div>
        <div style="border:2px solid #000;padding:40px;width:80%;max-width:600px;position:relative;background:white;z-index:2;">
            <div style="margin-bottom:25px;">
                <h1 style="font-size:28px;font-weight:bold;margin:0 0 5px 0;">ENGLISHJIBI CLASSES</h1>
                <h2 style="font-size:18px;font-weight:bold;margin:0;color:#444;">CHIRANJIBI SIR</h2>
            </div>
            <div style="margin-bottom:30px;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:20px 0;">
                <p style="font-size:16px;font-weight:bold;color:#dc2626;margin:0 0 10px 0;text-transform:uppercase;">This content is protected.</p>
                <p style="font-size:16px;font-weight:bold;color:#dc2626;margin:0 0 10px 0;text-transform:uppercase;">DIRECT BROWSER PRINTING IS DISABLED.</p>
                <p style="font-size:14px;color:#333;line-height:1.5;">Direct browser printing is disabled.<br>To obtain an official formatted PDF, please contact:</p>
            </div>
            <div style="text-align:left;font-size:13px;margin:0 auto;width:fit-content;line-height:1.8;">
                <div><strong>📞 Phone:</strong> +91 83289 22917  / +91 77358 12335</div>
                <div><strong>📧 Email:</strong> rangoclasses@gmail.com</div>
                <div><strong>📍Address:</strong> Duplex 37, Sailashree Vihar Bhubaneswar - 751021</div>
            </div>
            <div style="margin-top:30px;font-size:10px;color:#666;font-style:italic;">
                <p>Official PDFs are generated through EnglishJibi Authorized System.</p>
                <p>Website Designed by Subham Kumar Mallick</p>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

// --- 5. UX UTILITIES ---
export const UX = {
    // Progress Bar Psychology
    ProgressBar: {
        element: null,
        init() {
            if (!this.element) {
                this.element = document.createElement('div');
                this.element.id = 'nprogress-bar';
                this.element.style.width = '0%';
                this.element.style.opacity = '0';
                this.element.style.top = '0px'; // Default
                document.body.appendChild(this.element);
            }
        },
        start() {
            this.init();

            // Attempt to position below header if it exists
            const header = document.querySelector('header');
            if (header) {
                this.element.style.top = header.offsetHeight + 'px';
            }

            this.element.style.opacity = '1';
            this.element.style.width = '0%';
            requestAnimationFrame(() => {
                this.element.style.width = '40%';
                setTimeout(() => { if (this.element.style.width !== '100%') this.element.style.width = '80%'; }, 500);
            });
        },
        finish() {
            if (!this.element) return;
            this.element.style.width = '100%';
            setTimeout(() => {
                this.element.style.opacity = '0';
                setTimeout(() => { this.element.style.width = '0%'; }, 300);
            }, 300);
        }
    },

    // Skeleton Generators (Minimal & Static)
    Skeletons: {
        getCardSkeleton() {
            return `
            <div class="border border-slate-800 rounded-2xl p-8 text-center bg-slate-900/30">
                <div class="w-14 h-14 rounded-xl skeleton-static mx-auto mb-6"></div>
                <div class="h-6 w-3/4 skeleton-static mx-auto mb-3 rounded"></div>
                <div class="h-4 w-1/2 skeleton-static mx-auto rounded"></div>
            </div>`;
        },
        getMCQSkeleton() {
            return `
            <div class="bg-[#1e293b] rounded-xl border border-slate-700/50 mb-4 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-700">
                    <div class="h-6 w-2/3 skeleton-static rounded"></div>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="h-14 skeleton-static rounded-lg"></div>
                    <div class="h-14 skeleton-static rounded-lg"></div>
                    <div class="h-14 skeleton-static rounded-lg"></div>
                    <div class="h-14 skeleton-static rounded-lg"></div>
                </div>
            </div>`;
        },
        getFillSkeleton() {
            return `
            <div class="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 mb-4">
                <div class="flex gap-4 mb-4 items-center">
                    <div class="w-8 h-8 rounded-full skeleton-static shrink-0"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-5 w-full skeleton-static rounded"></div>
                    </div>
                </div>
                <div class="ml-12 flex gap-2">
                    <div class="h-8 w-20 skeleton-static rounded-full"></div>
                    <div class="h-8 w-20 skeleton-static rounded-full"></div>
                    <div class="h-8 w-20 skeleton-static rounded-full"></div>
                </div>
            </div>`;
        }
    },

    // Background Prefetching
    prefetchNextSet(topic, level, currentSet) {
        const nextSet = parseInt(currentSet) + 1;
        const url = `../data/${topic}/${level}/set${nextSet}.json`;
        if (window.requestIdleCallback) {
            requestIdleCallback(() => fetch(url, { priority: 'low' }).catch(() => { }));
        } else {
            setTimeout(() => fetch(url).catch(() => { }), 2000);
        }
    },

    // Staggered Reveal Helper (Optimized: cleanup will-change, cap max delay, respect prefers-reduced-motion)
    staggerElements(selector, baseDelay = 30) {
        // Skip animations if user prefers reduced motion
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const els = document.querySelectorAll(selector);

        els.forEach((el, index) => {
            // Always remove opacity-0 class to allow animations/styles to take effect
            el.classList.remove('opacity-0');

            if (prefersReduced) {
                el.style.opacity = '1';
                return;
            }
            // Cap max delay at 1500ms to avoid long waits for large sets
            const delay = Math.min(index * baseDelay, 1500);
            el.style.animationDelay = `${delay}ms`;
            el.classList.add('animate-enter');

            // Cleanup will-change after animation finishes to free compositor memory
            el.addEventListener('animationend', () => {
                el.style.willChange = 'auto';
            }, { once: true });
        });
    },

    // Fisher-Yates Shuffle (proper uniform distribution)
    fisherYatesShuffle(arr) {
        const a = [...arr];
        // Verify Fisher-Yates algorithm for uniform distribution
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Batch Rendering: builds ALL items in a DocumentFragment, appends once (single reflow)
    renderBatch(items, renderFn, container) {
        const fragment = document.createDocumentFragment();
        items.forEach((item, i) => renderFn(item, i, fragment));
        container.appendChild(fragment);
    }
};

// --- 5. GLOBAL STATE ---
const UI_STATE = {
    sound: true,
    confetti: true,
    audioCtx: null,
    isMenuOpen: false
};

// --- 6. HELPER: SET DISCOVERY (OPTIMIZED) ---
// Uses config.sets count to generate array instantly. Zero network calls.
// Falls back to parallel batch probing only if config has no sets field.
export function discoverSetsFromConfig(config) {
    if (config && typeof config.sets === 'number' && config.sets > 0) {
        return Array.from({ length: config.sets }, (_, i) => i + 1);
    }
    return null; // Signal: fallback needed
}

// Legacy fallback: parallel batch probing (much faster than sequential HEAD loop)
export async function discoverSetsFallback(topic, level) {
    const MAX = 20;
    const probes = [];
    for (let i = 1; i <= MAX; i++) {
        const url = `../data/${topic}/${level}/set${i}.json`;
        probes.push(
            fetch(url, { method: 'HEAD' })
                .then(res => (res.ok ? i : null))
                .catch(() => null)
        );
    }
    const results = (await Promise.all(probes)).filter(Boolean).sort((a, b) => a - b);
    return results.length > 0 ? results : [1];
}

// Backward-compatible export (kept for any external callers)
export async function discoverSets(topic, level) {
    return discoverSetsFallback(topic, level);
}

// --- 7. SOUND ENGINE ---
function initAudio() {
    if (!UI_STATE.audioCtx) {
        UI_STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (UI_STATE.audioCtx.state === 'suspended') {
        return UI_STATE.audioCtx.resume();
    }
    return Promise.resolve();
}

function playTone(freq, type, duration) {
    if (!UI_STATE.sound || !UI_STATE.audioCtx) return;
    const osc = UI_STATE.audioCtx.createOscillator();
    const gain = UI_STATE.audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(UI_STATE.audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, UI_STATE.audioCtx.currentTime + duration);
    osc.stop(UI_STATE.audioCtx.currentTime + duration);
}

export const Sound = {
    playCorrect: async () => {
        if (!UI_STATE.sound) return;  // ✅ Check sound is enabled FIRST
        await initAudio();
        playTone(800, 'sine', 0.1);
        setTimeout(() => playTone(1200, 'sine', 0.2), 100);
    },
    playWrong: async () => {
        if (!UI_STATE.sound) return;  // ✅ Check sound is enabled FIRST
        await initAudio();
        if (!UI_STATE.audioCtx) return;
        const osc = UI_STATE.audioCtx.createOscillator();
        const gain = UI_STATE.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, UI_STATE.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, UI_STATE.audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(UI_STATE.audioCtx.destination);
        osc.start();
        gain.gain.setValueAtTime(0.5, UI_STATE.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, UI_STATE.audioCtx.currentTime + 0.3);
        osc.stop(UI_STATE.audioCtx.currentTime + 0.3);
    }
};

export const Effects = {
    triggerConfetti: () => {
        if (UI_STATE.confetti && window.confetti) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    },
    toggleSound: (btn) => {
        UI_STATE.sound = !UI_STATE.sound;
        btn.classList.toggle('effect-disabled', !UI_STATE.sound);
        // Only init audio if turning sound ON
        if (UI_STATE.sound) {
            initAudio();
        }
    },
    toggleConfetti: (btn) => {
        UI_STATE.confetti = !UI_STATE.confetti;
        btn.classList.toggle('effect-disabled', !UI_STATE.confetti);
    }
};

// --- 8. APP SHELL INJECTION (Header + Menu Assembly) ---

export function injectHeader(title, subtitle) {
    const style = document.createElement('style');
    style.textContent = `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
    `;
    document.head.appendChild(style);

    const html = `
    <!-- MAIN APP SHELL WRAPPER -->
    <div class="fixed top-0 left-0 w-full z-50" id="main-header-wrapper">
        
        <!-- HEADER (Z-INDEX 20: Sits on top of menu) -->
        <header class="relative z-20 bg-[#020617]/95 backdrop-blur-md shadow-2xl border-b border-slate-800">
            <div class="w-full max-w-[98%] mx-auto px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center gap-2 sm:gap-4 flex-nowrap">
                
                <!-- BRANDING -->
                <div class="flex items-stretch gap-2 sm:gap-4 self-center min-w-0">
                    <div class="w-1 sm:w-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] self-stretch shrink-0"></div>
                    <div class="flex flex-col justify-center min-w-0">
                        <h1 class="text-sm xs:text-base sm:text-xl md:text-2xl font-black tracking-wide text-white uppercase leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                            ${title} <span class="text-blue-400 hidden xs:inline">PRACTICE</span>
                        </h1>
                        <p class="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 tracking-[0.15em] mt-0.5 sm:mt-1 uppercase leading-tight truncate">
                            ${subtitle}
                        </p>
                    </div>
                </div>
                
                <!-- CONTROLS -->
                <div class="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
                    <!-- Sound -->
                    <button id="btn-sound" class="relative overflow-hidden group flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700 transition-all shadow-lg text-slate-200">
                        <span class="text-base xs:text-lg sm:text-xl">🔊</span>
                        <div class="slash-line absolute top-1/2 left-1/2 w-[80%] h-[2px] bg-red-500 -translate-x-1/2 -translate-y-1/2 -rotate-45 hidden"></div>
                    </button>
                    
                    <!-- Confetti -->
                    <button id="btn-confetti" class="relative overflow-hidden group flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700 transition-all shadow-lg text-slate-200">
                        <span class="text-base xs:text-lg sm:text-xl">🎉</span>
                        <div class="slash-line absolute top-1/2 left-1/2 w-[80%] h-[2px] bg-red-500 -translate-x-1/2 -translate-y-1/2 -rotate-45 hidden"></div>
                    </button>

                    <div class="w-px h-6 sm:h-8 bg-slate-700 mx-0.5 sm:mx-1"></div>

                    <!-- Home -->
                    <a href="../class10-home.html" class="group flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700 transition-all shadow-lg text-slate-400 hover:text-white">
                        <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    </a>

                    <!-- MENU TOGGLE -->
                    <button id="menu-toggle-btn" class="group flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 xs:px-3 xs:py-2 sm:px-5 sm:py-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700 transition-all shrink-0 shadow-lg cursor-pointer">
                        <span class="text-[10px] xs:text-xs sm:text-sm font-bold text-slate-300 group-hover:text-white tracking-wide">
                            <span class="sm:hidden text-lg">⚙</span>
                            <span class="hidden sm:inline">TOOLS</span>
                        </span>
                        <svg class="hidden sm:block h-3.5 w-3.5 sm:h-5 sm:w-5 text-slate-400 group-hover:text-blue-400 transition-transform duration-300" id="menu-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- SLIDING MENU -->
        <nav id="teacher-menu" class="absolute top-full left-0 w-full z-10 bg-[#0f172a] border-b border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -translate-y-[150%] transition-transform duration-300 ease-out origin-top">
            <div id="menu-content" class="py-4 px-3 md:py-8 md:px-6">
                <!-- Content injected via JS -->
            </div>
        </nav>

    </div>
    
    <!-- CLICK OUTSIDE OVERLAY -->
    <div id="menu-overlay" class="fixed inset-0 bg-black/20 z-40 hidden backdrop-blur-[2px] transition-opacity duration-300"></div>
    `;

    document.getElementById('header-mount').innerHTML = html;

    // UPDATE PROGRESS BAR POSITION AFTER INJECTION
    const headerWrapper = document.getElementById('main-header-wrapper');
    const progressBar = document.getElementById('nprogress-bar');
    if (headerWrapper && progressBar) {
        // Use offsetHeight of the wrapper since it is the fixed element
        progressBar.style.top = headerWrapper.offsetHeight + 'px';
    }

    document.getElementById('btn-sound').onclick = function () { Effects.toggleSound(this); };
    document.getElementById('btn-confetti').onclick = function () { Effects.toggleConfetti(this); };

    initMenuSystem();
}

function initMenuSystem() {
    const btn = document.getElementById('menu-toggle-btn');
    const menu = document.getElementById('teacher-menu');
    const arrow = document.getElementById('menu-arrow');
    const overlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        UI_STATE.isMenuOpen = !UI_STATE.isMenuOpen;
        updateMenuState();
    }

    function closeMenu() {
        if (!UI_STATE.isMenuOpen) return;
        UI_STATE.isMenuOpen = false;
        updateMenuState();
    }

    function updateMenuState() {
        if (UI_STATE.isMenuOpen) {
            menu.classList.remove('-translate-y-[150%]');
            menu.classList.add('translate-y-0');
            arrow.classList.add('rotate-180');

            overlay.classList.remove('hidden');
            requestAnimationFrame(() => overlay.classList.remove('opacity-0'));

            btn.classList.add('border-blue-500', 'bg-slate-700');
        } else {
            menu.classList.add('-translate-y-[150%]');
            menu.classList.remove('translate-y-0');
            arrow.classList.remove('rotate-180');

            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);

            btn.classList.remove('border-blue-500', 'bg-slate-700');
        }
    }

    btn.onclick = (e) => { e.stopPropagation(); toggleMenu(); };
    overlay.onclick = () => closeMenu();
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI_STATE.isMenuOpen) closeMenu(); });
    window.closeAppMenu = closeMenu;
}

export function injectMenu(currentSet, activeSets, onSetClick, onFilter, onRandom) {
    let setButtonsHtml = '';

    activeSets.sort((a, b) => a - b);

    activeSets.forEach(i => {
        const isActive = (i == currentSet) ? 'bg-[#16a34a] border-[#22c55e] text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700';
        setButtonsHtml += `<button data-set="${i}" class="btn-set py-2 md:py-3 border font-bold rounded-lg transition-all text-xs md:text-base ${isActive}"><span class="md:hidden">${i}</span><span class="hidden md:inline">Set ${i}</span></button>`;
    });

    const html = `
    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
        <!-- Sets (Fixed Height + Scroll) -->
        <div class="col-span-2 md:col-span-1 space-y-2 md:space-y-4">
            <h3 class="text-purple-400 text-xs font-black uppercase tracking-widest border-b border-slate-800 pb-2 flex justify-between">
                <span>Select Set</span>
                <span class="text-slate-600">${activeSets.length} Available</span>
            </h3>
            <!-- INTERNAL SCROLL CONTAINER -->
            <div class="max-h-[160px] md:max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 gap-2 md:gap-3" id="menu-set-grid">
                    ${setButtonsHtml}
                </div>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="col-span-1 space-y-2 md:space-y-4">
            <h3 class="text-yellow-400 text-xs font-black uppercase tracking-widest border-b border-slate-800 pb-2">Filter</h3>
            <div class="flex md:grid md:grid-cols-2 gap-2 md:gap-4 h-10 md:h-auto">
                <button id="btn-odd" class="flex-1 md:py-8 bg-slate-800 border border-slate-700 text-slate-400 font-black rounded-lg md:rounded-xl hover:text-white hover:bg-slate-700 hover:border-indigo-500 flex items-center justify-center transition-all text-sm md:text-5xl">O</button>
                <button id="btn-even" class="flex-1 md:py-8 bg-slate-800 border border-slate-700 text-slate-400 font-black rounded-lg md:rounded-xl hover:text-white hover:bg-slate-700 hover:border-indigo-500 flex items-center justify-center transition-all text-sm md:text-5xl">E</button>
            </div>
        </div>
        
        <!-- Random -->
        <div class="col-span-1 space-y-2 md:space-y-4">
            <h3 class="text-indigo-500 text-xs font-black uppercase tracking-widest border-b border-slate-800 pb-2">Random</h3>
            <div class="flex flex-col gap-2 md:gap-3">
                <div class="flex gap-2 h-10 md:h-auto">
                    <div class="relative w-12 md:w-24 shrink-0">
                        <input type="number" id="random-count" placeholder="10" value="10" class="w-full h-full bg-slate-800 border border-slate-700 rounded-lg pl-1 pr-1 md:pl-3 md:pr-2 text-white font-bold focus:border-emerald-500 focus:outline-none text-center text-xs md:text-base">
                    </div>
                    <button id="btn-random" class="flex-1 md:py-3 bg-emerald-900/10 hover:bg-emerald-600 border border-emerald-900 hover:border-emerald-500 text-emerald-500 hover:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-xs md:text-base px-2">
                        <span>GENERATE</span>
                    </button>
                </div>
                <p class="hidden md:block text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed">
                    Generates a unique test from the entire pool of questions. Options are automatically shuffled.
                </p>
            </div>
        </div>
    </div>
    `;

    document.getElementById('menu-content').innerHTML = html;

    document.querySelectorAll('.btn-set').forEach(btn => {
        btn.onclick = () => {
            if (window.closeAppMenu) window.closeAppMenu();
            onSetClick(btn.dataset.set);
        };
    });

    document.getElementById('btn-odd').onclick = () => { if (window.closeAppMenu) window.closeAppMenu(); onFilter('odd'); };
    document.getElementById('btn-even').onclick = () => { if (window.closeAppMenu) window.closeAppMenu(); onFilter('even'); };
    document.getElementById('btn-random').onclick = () => { if (window.closeAppMenu) window.closeAppMenu(); onRandom(document.getElementById('random-count').value); };
}

export function injectFooter() {
    const html = `
    <div class="fixed bottom-3 w-full text-center pointer-events-none select-none z-0">
        <p class="text-slate-600 opacity-40 text-[10px] font-bold tracking-[0.2em] uppercase">Designed by Subham Kumar Mallick</p>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

export function getParams() {
    const p = new URLSearchParams(window.location.search);
    return {
        topic: p.get('subject') || 'tenses',
        level: p.get('level') || 'high',
        set: p.get('set') || '1'
    };
}