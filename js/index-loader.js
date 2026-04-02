/**
 * GRAMMARHUB AUTOMATION LOADER
 * Scans /data directories for config.js and builds the index grid.
 * Enhanced with Skeletons and Staggered Animations.
 */

import { UX } from './ui.js';

// 1. REGISTRY - Add new subject folder names here
const SUBJECTS = [
    'tenses',
    'sva',
    'preposition',
    'voice',
    'articles',
    'prepositions',
    'modals',
    'nouns',
    'pronouns',
    'adjectives',
    'adverbs',
    'conjunctions'
];

// Levels to probe
const LEVELS = ['primary', 'middle', 'high'];

// 2. ICON SYSTEM - Exact SVG paths from your original design
const ICONS = {
    // Clock icon (for Tenses)
    'time': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    // Clipboard icon (for SVA/Rules)
    'list': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>',
    // Default fallback
    'default': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>'
};

// 3. SCANNING LOGIC
async function scanLibrary() {
    const validModules = [];
    const promises = [];

    // Probe every combination
    for (const subject of SUBJECTS) {
        for (const level of LEVELS) {
            // Construct path: ../data/tenses/high/config.js
            const configPath = `../data/${subject}/${level}/config.js`;

            // Dynamic import probe
            const p = import(configPath)
                .then(module => {
                    return {
                        ...module.default,
                        subject: subject,
                        level: level
                    };
                })
                .catch(() => null); // Silent fail if file missing

            promises.push(p);
        }
    }

    // Wait for all probes
    const results = await Promise.all(promises);

    // Filter successful hits
    return results
        .filter(r => r !== null)
        .sort((a, b) => (a.order || 999) - (b.order || 999));
}

// 4. RENDERER (Optimized: DocumentFragment batch rendering)
function renderGrid(cards) {
    const container = document.getElementById('card-grid');
    if (!container) return;

    // Clear skeletons
    container.innerHTML = '';

    if (cards.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">No config.js files found in /data</div>`;
        return;
    }

    // Build all cards in a DocumentFragment (single DOM operation)
    const fragment = document.createDocumentFragment();

    cards.forEach(card => {
        const iconSvg = ICONS[card.icon] || ICONS['default'];
        const num = String(card.order).padStart(2, '0');

        const wrapper = document.createElement('a');
        wrapper.href = `engine/${card.engine}.html?subject=${card.subject}&level=${card.level}&set=1`;
        wrapper.className = "version-card opacity-0 group relative block border border-gray-800 rounded-2xl p-8 text-center cursor-pointer no-underline overflow-hidden";
        wrapper.innerHTML = `
            <div class="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-gray-500 group-hover:text-gold-500 transition-colors">${num}</div>
            <div class="icon-box w-14 h-14 rounded-xl bg-gray-900 text-gold-500 border border-gray-700 flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSvg}</svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">${card.title}</h3>
            <p class="text-gray-500 text-sm font-medium">${card.description}</p>
        `;
        fragment.appendChild(wrapper);
    });

    // Append Placeholder
    const placeholderDiv = document.createElement('div');
    placeholderDiv.className = "version-card opacity-0 group relative block border border-gray-800 rounded-2xl p-8 text-center opacity-50 cursor-not-allowed";
    placeholderDiv.innerHTML = `<h3 class="text-xl font-bold text-gray-600 mb-2">More Coming Soon...</h3>`;
    fragment.appendChild(placeholderDiv);

    // Single DOM mutation
    container.appendChild(fragment);

    // TRIGGER STAGGER ANIMATION
    UX.staggerElements('.version-card', 70);
}

// 5. BOOTSTRAP
(async () => {
    try {
        // Show Skeletons IMMEDIATELY
        const container = document.getElementById('card-grid');
        if (container) container.innerHTML = Array(6).fill(UX.Skeletons.getCardSkeleton()).join('');

        const cards = await scanLibrary();
        renderGrid(cards);

    } catch (err) {
        console.error("Auto-discovery failed:", err);
    }
})();