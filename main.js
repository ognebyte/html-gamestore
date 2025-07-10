import './components/custom-button.js'
import './components/catalog-menu-item.js'

const DEFAULT_LANG = 'ru';
let currentLang = localStorage.getItem('siteLang') || DEFAULT_LANG;
let currentModal = null;
let catalog = [];

const catalogWrapper = document.querySelector('.catalog-wrapper');

const navigationState = {
    currentPath: [],
    isMobile: false
};

const loadData = async () => {
    const res = await fetch('./data/catalog.json');
    catalog = await res.json();
};

window.setSiteLang = lang => {
    localStorage.setItem('siteLang', lang);
    document.documentElement.lang = lang;
    updateLangButtons(lang);
};

const updateLangButtons = activeLang => {
    document.querySelectorAll('.lang-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === activeLang);
    });
};

window.fetchInlineSVG = async path => {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(res.status);
        return await res.text();
    } catch (e) {
        console.error('Ошибка при загрузке SVG:', e);
        return null;
    }
};

window.chevronIcon = (() => {
    let cachedIcon = null;
    return async () => {
        if (!cachedIcon) {
            const svgString = await fetchInlineSVG('./icon/chevron-right.svg');
            if (svgString) {
                const wrapper = document.createElement('div');
                wrapper.className = 'chevron-wrapper';
                wrapper.innerHTML = svgString;
                cachedIcon = wrapper;
            }
        }
        return cachedIcon?.cloneNode(true);
    };
})();

window.checkIfMobile = () => document.body.offsetWidth < 768;

const getItemByPath = path => {
    let current = catalog;
    path.forEach(index => {
        current = current[index];
        if (current.items) current = current.items;
    });
    return current;
};

const updateActiveMenu = activePath => {
    document.querySelectorAll('catalog-menu-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeElement = document.querySelector(`catalog-menu-item[data-path='[${activePath[0] || 0}]']`);
    activeElement?.classList.add('active');
};

const renderCatalogMenuItem = async (item, path) => {
    const menuItem = document.createElement('catalog-menu-item');
    menuItem.dataset.path = JSON.stringify(path);

    if (item.link) menuItem.dataset.link = item.link;

    if (item.icon) {
        const svgContent = await fetchInlineSVG('./icon/' + item.icon);
        if (svgContent) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';
            iconWrapper.innerHTML = svgContent;
            menuItem.appendChild(iconWrapper);
        }
    }

    const title = document.createElement('p');
    title.textContent = item.title;
    menuItem.appendChild(title);

    if (item.items?.length > 0) {
        menuItem.dataset.hasSubitems = 'true';
    }

    return menuItem;
};

const renderMobileNavigation = async path => {
    const currentItems = path.length === 0 ? catalog : getItemByPath(path);
    const catalogMenu = document.querySelector('.catalog-menu-wrapper');
    catalogMenu.innerHTML = '';

    if (path.length > 0) {
        const prevPath = path.slice(0, -1);
        const prevItem = getItemByPath(prevPath)[path.at(-1)];

        const backButton = document.createElement('button');
        backButton.classList.add('back-button');

        const backButtonTitle = document.createElement('p');
        backButtonTitle.className = 'submenu-title';
        backButtonTitle.textContent = prevItem.title;

        backButton.innerHTML = await fetchInlineSVG('./icon/chevron-left.svg');
        backButton.appendChild(backButtonTitle);
        backButton.addEventListener('click', () => renderMobileNavigation(prevPath));

        catalogMenu.appendChild(backButton);
    }

    currentItems.forEach(async (item, index) => {
        const currentPath = [...path, index];
        const menuItem = await renderCatalogMenuItem(item, currentPath);
        catalogMenu.appendChild(menuItem);
    });
};

const renderDesktopSubmenu = path => {
    var catalogSubmenu = document.querySelector('.catalog-submenu-wrapper');

    if (catalogSubmenu === null) {
        catalogSubmenu = document.createElement('div');
        catalogSubmenu.className = 'catalog-submenu-wrapper';
    } else {
        catalogSubmenu.innerHTML = '';
    }

    const category = catalog[path[0]];

    if (!category.items) return;

    if (navigationState.currentPath.length !== 0) updateActiveMenu(path);

    category.items.forEach((submenuItem, index) => {
        const submenu = document.createElement('div');
        submenu.classList.add('submenu');

        const submenuTitle = document.createElement('p');
        submenuTitle.classList.add('submenu-title');
        submenuTitle.textContent = submenuItem.title;
        submenu.appendChild(submenuTitle);

        const submenuContent = document.createElement('div');
        submenuContent.classList.add('submenu-content');

        if (submenuItem.items) {
            submenuItem.items.forEach(async item => {
                const submenuContentItem = document.createElement(item.items ? 'button' : 'a');

                if (!item.items) {
                    submenuContentItem.href = '#' + item.title;
                    submenuContentItem.addEventListener('click', function () {
                        hideCatalog();
                    });
                }

                submenuContentItem.classList.add('submenu-content-item');
                submenuContentItem.textContent = item.title;

                if (item.count) {
                    const itemCount = document.createElement('span');
                    itemCount.classList.add('item-count');
                    itemCount.textContent = item.count;
                    submenuContentItem.appendChild(itemCount);
                }

                if (item.items) {
                    const chevron = await chevronIcon();
                    if (chevron) submenuContentItem.appendChild(chevron);
                }

                submenuContent.appendChild(submenuContentItem);
            });
        }

        submenu.appendChild(submenuContent);
        catalogSubmenu.appendChild(submenu);
    });

    catalogWrapper.appendChild(catalogSubmenu);
};

window.renderCatalogSubItems = path => {
    if (navigationState.currentPath === path) return;
    navigationState.currentPath = path;

    if (navigationState.isMobile) {
        renderMobileNavigation(path);
    } else {
        renderDesktopSubmenu(path);
    }
};

const renderCatalog = () => {
    currentModal = 'catalog';

    const catalogMenu = document.createElement('div');
    catalogMenu.className = 'catalog-menu-wrapper';
    catalog.forEach(async (item, index) => {
        const menuItem = await renderCatalogMenuItem(item, [index]);
        if (!navigationState.isMobile && index === 0) {
            menuItem.classList.add('active');
        }
        catalogMenu.appendChild(menuItem);
    });

    catalogWrapper.appendChild(catalogMenu);
    catalogWrapper.style.display = 'inline-flex';

    if (!navigationState.isMobile) {
        renderDesktopSubmenu([0])
    }
};

window.hideCatalog = () => {
    currentModal = null;
    catalogWrapper.style.display = null;
    catalogWrapper.innerHTML = '';
};

window.renderSubcategoryModal = subcategoryPath => {
    const subcategory = getItemByPath(subcategoryPath);

    if (!subcategory.items) return;

    const modal = document.createElement('div');
    modal.classList.add('subcategory-modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close');
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => document.body.removeChild(modal));

    const title = document.createElement('h3');
    title.textContent = subcategory.title;

    const itemsContainer = document.createElement('div');
    itemsContainer.classList.add('modal-items');

    subcategory.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('modal-item');
        itemElement.textContent = item.title;

        if (item.link) {
            itemElement.addEventListener('click', () => {
                window.location.href = item.link;
            });
        }

        itemsContainer.appendChild(itemElement);
    });

    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(itemsContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};

const initialize = async () => {
    await loadData();

    navigationState.isMobile = checkIfMobile();

    document.documentElement.lang = currentLang;
    updateLangButtons(currentLang);

    window.addEventListener('resize', () => {
        const wasMobile = navigationState.isMobile;
        navigationState.isMobile = checkIfMobile();

        if (wasMobile !== navigationState.isMobile) {
            navigationState.currentPath = [];
            hideCatalog();
        }
    });

    const catalogButton = document.querySelector('#catalogButton button');
    catalogButton.addEventListener('click', (e) => {
        if (currentModal === 'catalog') {
            hideCatalog();
        } else {
            renderCatalog();
        }
    });

    document.addEventListener('click', function (event) {
        const isClickInsideCatalog = catalogWrapper.contains(event.target);
        const isClickOnButton = catalogButton.contains(event.target);

        if (!isClickInsideCatalog && !isClickOnButton && !navigationState.isMobile) {
            hideCatalog();
        }
    });
};

initialize();