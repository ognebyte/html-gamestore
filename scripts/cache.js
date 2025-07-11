const svgIcons = new Map();

const fetchInlineSVG = async (path) => {
    if (svgIcons.has(path)) {
        return svgIcons.get(path);
    }

    try {
        const res = await fetch(path);
        const text = await res.text();
        svgIcons.set(path, text);
        return text;
    } catch (e) {
        console.error('Ошибка при загрузке SVG:', e);
        return null;
    }
};

const chevronIcon = (() => {
    let cached = null;
    return async () => {
        if (!cached) {
            const svg = await fetchInlineSVG('../icon/chevron-right.svg');
            if (svg) {
                const wrap = document.createElement('div');
                wrap.className = 'chevron-wrapper';
                wrap.innerHTML = svg;
                cached = wrap;
            }
        }
        return cached?.cloneNode(true);
    };
})();

export {
    fetchInlineSVG,
    chevronIcon
};
