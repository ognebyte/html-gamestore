import { loadData } from './scripts/data.js';
import { toggleModal, hideCatalog, store } from './scripts/render.js';


const DEFAULT_LANG = 'ru';
let currentLang = DEFAULT_LANG;


window.checkIfMobile = () => document.body.offsetWidth < 768;

window.setSiteLang = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-button').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.lang === lang)
    );
};

const initialize = async () => {
    await loadData();

    setSiteLang('ru');
    store.isMobile = checkIfMobile();

    const catalogButton = document.querySelector('#catalogButton');
    const catalogWrapper = document.querySelector('.catalog-wrapper');

    catalogButton.addEventListener('click', async () => {
        toggleModal('catalog');
    });

    document.addEventListener('click', (e) => {
        const clickedInside = catalogWrapper.contains(e.target) || catalogButton.contains(e.target);
        if (!clickedInside && !store.isMobile) {
            hideCatalog();
        }
    });

    window.addEventListener('resize', () => {
        const wasMobile = store.isMobile;
        store.isMobile = checkIfMobile();
        if (wasMobile !== store.isMobile) {
            hideCatalog();
        }
    });
};

initialize();
