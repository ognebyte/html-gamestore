import { fetchInlineSVG, chevronIcon } from './cache.js';
import { getCatalog } from './data.js';

const catalogWrapper = document.querySelector('.catalog-wrapper');
let modalOpen = false;
let store = {
    isMobile: false
}

const getItemByPath = (path) => {
    let current = getCatalog();
    for (const index of path) {
        current = current[index]?.items || current[index];
    }
    return current;
};

const updateActiveMenu = (path) => {
    document.querySelectorAll('.catalog-menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.catalog-menu-item[data-path='[${path[0] || 0}]']`)?.classList.add('active');
};

const handleClickCatalogMenuItem = (e, path) => {
    e.preventDefault();
    renderCatalogSubItems(path);
}

const renderCatalogSubItems = async (path) => {
    if (store.isMobile) {
        await renderMobileNavigation(path);
    } else {
        await renderDesktopSubmenu(path);
    }
};

const renderCatalogMenuItem = async (item, path) => {
    const pathKey = path;
    const element = item.link ? document.createElement('a') : document.createElement('button');

    if (item.link) {
        element.href = item.link;
        element.addEventListener('click', hideCatalog);
    } else {
        if (store.isMobile) {
            element.addEventListener('click', (e) => handleClickCatalogMenuItem(e, pathKey));
        } else {
            element.addEventListener('mouseenter', (e) => {
                if (element.classList.contains('active')) return;
                handleClickCatalogMenuItem(e, pathKey)
            });
        }
    }

    element.className = 'catalog-menu-item';
    element.dataset.path = JSON.stringify(path);

    if (item.icon) {
        const icon = await fetchInlineSVG('./icon/' + item.icon);
        if (icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';
            iconWrapper.innerHTML = icon;
            element.appendChild(iconWrapper);
        }
    }

    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = item.title;

    if (item.count) {
        const count = document.createElement('span');
        count.className = 'item-count';
        count.textContent = item.count;
        title.appendChild(count);
    }

    element.appendChild(title);

    if (item.items?.length) {
        const chevron = await chevronIcon();
        if (chevron) element.appendChild(chevron);
    }

    return element;
};

const renderMobileNavigation = async (path) => {
    const wrapper = document.querySelector('.catalog-menu-wrapper');
    wrapper.innerHTML = '';

    const currentItems = path.length === 0 ? getCatalog() : getItemByPath(path);

    if (path.length > 0) {
        const prevPath = path.slice(0, -1);
        const prevItem = getItemByPath(prevPath)[path.at(-1)];

        const backButton = document.createElement('button');
        backButton.classList.add('back-button');

        backButton.innerHTML = await fetchInlineSVG('./icon/chevron-left.svg');

        const backButtonTitle = document.createElement('p');
        backButtonTitle.className = 'submenu-title';
        backButtonTitle.textContent = prevItem.title;
        backButton.appendChild(backButtonTitle);

        backButton.addEventListener('click', () => {
            renderMobileNavigation(prevPath)
        });

        wrapper.appendChild(backButton);
    }

    const itemsPromises = currentItems.map(async (item, index) => {
        const currentPath = [...path, index];
        return await renderCatalogMenuItem(item, currentPath);
    });

    const menuItems = await Promise.all(itemsPromises);
    menuItems.forEach(item => wrapper.appendChild(item));
};

const renderDesktopSubmenu = async (path) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'catalog-submenu-wrapper';

    const category = getCatalog()[path[0]];
    if (!category?.items) return;

    if (path.length !== 0) updateActiveMenu(path);

    const submenus = await Promise.all(category.items.map(async (sub, i) => {
        const block = document.createElement('div');
        block.className = 'submenu';
        const title = document.createElement('p');
        title.className = 'submenu-title';
        title.textContent = sub.title;
        block.appendChild(title);

        const content = document.createElement('div');
        content.className = 'submenu-content';

        if (sub.items) {
            const elements = await Promise.all(sub.items.map(async (item) => {
                const el = document.createElement(item.items ? 'button' : 'a');
                el.className = 'submenu-content-item';
                el.textContent = item.title;
                if (item.count) {
                    const count = document.createElement('span');
                    count.className = 'item-count';
                    count.textContent = item.count;
                    el.appendChild(count);
                }
                if (item.items) {
                    const chevron = await chevronIcon();
                    if (chevron) el.appendChild(chevron);
                } else {
                    el.href = '#' + item.title;
                    el.addEventListener('click', function () {
                        hideCatalog();
                    });
                }
                return el;
            }));
            elements.forEach(el => content.appendChild(el));
        }

        block.appendChild(content);
        return block;
    }));

    submenus.forEach(el => wrapper.appendChild(el));

    document.querySelector('.catalog-submenu-wrapper')?.remove();
    catalogWrapper.appendChild(wrapper);
};

const hideCatalog = () => {
    catalogWrapper.style.display = '';
    catalogWrapper.innerHTML = '';
    modalOpen = false;
};

const renderCatalog = async () => {
    let wrapper = document.createElement('div');
    wrapper.className = 'catalog-menu-wrapper';

    const menuItems = await Promise.all(getCatalog().map((item, i) =>
        renderCatalogMenuItem(item, [i])
    ));
    menuItems.forEach(el => wrapper.appendChild(el));

    catalogWrapper.innerHTML = '';
    catalogWrapper.style.display = 'inline-flex';
    catalogWrapper.appendChild(wrapper);

    if (!store.isMobile) {
        await renderDesktopSubmenu([0]);
    }
    modalOpen = true;
};

const toggleModal = async (modalName) => {
    if (modalName === 'catalog') {
        if (modalOpen) {
            hideCatalog();
        }
        else {
            await renderCatalog();
        }
    }
}

export {
    toggleModal,
    hideCatalog,
    store
};
