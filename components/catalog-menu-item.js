export class CatalogMenuItem extends HTMLElement {
    constructor() {
        super();
        this.isMobile = checkIfMobile();
        this.currentHandlers = {
            click: null,
            mouseenter: null
        };
    }

    async connectedCallback() {
        const link = this.dataset.link;
        const hasSubitems = this.dataset.hasSubitems === 'true';
        var button;

        if (link) {
            button = document.createElement('a');
            button.href = link;

            button.addEventListener('click', function () {
                hideCatalog();
            })
        } else {
            button = document.createElement('button');
        }

        button.classList.add('button');
        button.innerHTML = this.innerHTML;
        if (hasSubitems) {
            const chevron = await chevronIcon();
            if (chevron) button.appendChild(chevron);
        }
        this.innerHTML = '';
        this.appendChild(button);

        this.setupEventListeners();
    }

    setupEventListeners() {
        const button = this.querySelector('button');
        if (!button) return;

        this.removeEventListeners(button);

        if (this.isMobile) {
            this.currentHandlers.click = (e) => this.handleClick(e);
            button.addEventListener('click', this.currentHandlers.click);
        } else {
            this.currentHandlers.mouseenter = (e) => this.handleClick(e);
            button.addEventListener('mouseenter', this.currentHandlers.mouseenter);
        }
    }

    removeEventListeners(button) {
        if (this.currentHandlers.click) {
            button.removeEventListener('click', this.currentHandlers.click);
        }
        if (this.currentHandlers.mouseenter) {
            button.removeEventListener('mouseenter', this.currentHandlers.mouseenter);
        }

        this.currentHandlers.click = null;
        this.currentHandlers.mouseenter = null;
    }

    handleClick(e) {
        e.preventDefault();
        renderCatalogSubItems(JSON.parse(this.dataset.path));
    }
}

if (!customElements.get('catalog-menu-item')) {
    customElements.define('catalog-menu-item', CatalogMenuItem);
}