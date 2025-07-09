async function fetchInlineSVG(path) {
    try {
        const res = await fetch(path);
        if (!res.ok)
            throw new Error(res.status)
        return res.text();
    } catch (e) {
        console.error('Ошибка при загрузке SVG:', e);
        return null;
    }
}

export function renderCatalog(catalog) {
    const catalogMenu = document.querySelector('.catalog-menu-wrapper');
    const catalogSubMenu = document.querySelector('.catalog-submenu-wrapper');

    catalog.map(async (item, index) => {
        const menuItem = document.createElement('catalog-menu-item');
        menuItem.classList.add('menu-item');
        menuItem.dataset.index = index;

        if (item.link) {
            menuItem.dataset.link = item.link;
        } else {
            menuItem.addEventListener('mouseenter', () => {
                // renderSubmenu(catalog, catalogSubMenu);
            });
        }

        if (item.icon) {
            const svgContent = await fetchInlineSVG('./icon/' + item.icon);
            if (svgContent !== null) {
                const svgWrapper = document.createElement('div');
                svgWrapper.className = 'catalog-icon';
                svgWrapper.innerHTML = svgContent;
                menuItem.appendChild(svgWrapper);
            }
        }

        const title = document.createElement('p');
        title.textContent = item.title;
        menuItem.appendChild(title);

        catalogMenu.appendChild(menuItem);
    });
}
