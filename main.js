import './components/custom-button.js'

const DEFAULT_LANG = 'ru';
let currentLang = localStorage.getItem('siteLang') || DEFAULT_LANG;

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
