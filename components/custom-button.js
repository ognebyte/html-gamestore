export class CustomButton extends HTMLElement {
    connectedCallback() {
        const isHref = this.getAttribute('button-href');
        var button;

        if (isHref) {
            button = document.createElement('a');
            button.href = this.getAttribute('button-href');
        } else {
            button = document.createElement('button');
        }
        button.classList.add('button')
        button.innerHTML = this.innerHTML;

        this.innerHTML = '';
        this.appendChild(button);
    }
}

if (!customElements.get('custom-button')) {
    customElements.define('custom-button', CustomButton);
}