export class CatalogMenuItem extends HTMLElement {
    async connectedCallback() {
        const props = this.props || null;
        const link = this.dataset.link;
        var button, chevron;

        if (link) {
            button = document.createElement('a');
            button.href = link;
        } else {
            button = document.createElement('button');
            button.addEventListener('click', (e) => {
                this.dispatchEvent(new Event('click'));
                console.log(props);
            });
            var icon = await fetchInlineSVG('./icon/chevron-right.svg');
            if (icon !== null) {
                chevron = document.createElement('div');
                chevron.className = 'chevron';
                chevron.innerHTML = icon;
            }
        }

        button.classList.add('button')
        button.innerHTML = this.innerHTML;
        if (chevron) button.appendChild(chevron);
        this.innerHTML = '';
        this.appendChild(button);
    }
}

if (!customElements.get('catalog-menu-item')) {
    customElements.define('catalog-menu-item', CatalogMenuItem);
}