import './components/custom-button.js'
import './components/catalog-menu-item.js'

const DEFAULT_LANG = 'ru';
let currentLang = localStorage.getItem('siteLang') || DEFAULT_LANG;

const catalogMenu = document.querySelector('.catalog-menu-wrapper');
const catalogSubMenu = document.querySelector('.catalog-submenu-wrapper');


document.documentElement.lang = currentLang;
updateLangButtons(currentLang);

window.setSiteLang = function (lang) {
    localStorage.setItem('siteLang', lang);
    document.documentElement.lang = lang;
    updateLangButtons(lang);
};

function updateLangButtons(activeLang) {
    document.querySelectorAll('.lang-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === activeLang);
    });
}

window.fetchInlineSVG = async function (path) {
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

function renderCatalog(catalog) {
    catalog.map(async (item, index) => {
        const menuItem = document.createElement('catalog-menu-item');
        menuItem.classList.add('menu-item');
        menuItem.dataset.index = index;

        if (item.link) {
            menuItem.dataset.link = item.link;
        } else {
            menuItem.props = item.subcategories;
        }

        if (item.icon) {
            const svgContent = await fetchInlineSVG('./icon/' + item.icon);
            if (svgContent !== null) {
                menuItem.innerHTML = svgContent;
            }
        }

        const title = document.createElement('p');
        title.textContent = item.title;
        menuItem.appendChild(title);

        catalogMenu.appendChild(menuItem);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('./data/catalog.json');
        const catalog = await res.json();
        renderCatalog(catalog);
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
});