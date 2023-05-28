() => {
    return class V {

        constructor(data) {
            this.data = data || {};
        }
        getId() { return this.dom.id; }
        attachShadow() {
            this.shadow = this.getDOM().attachShadow({ mode: "open" });
        }

        insert(dom) {
            if (this.shadow) {
                this.shadow.appendChild(dom);
            }
        }

        on(eventName, callback) { this.getDOM().addEventListener(eventName, callback); }
        off(eventName, callback) { this.getDOM().removeEventListener(eventName, callback); }
        getValue() { return this.getDOM().value; }
        getVal() { return this.getValue(); }
        setVal(val) { this.getDOM().value = val; }

        setDOM(dom) { this.dom = dom; }
        getDOM() {
            if (this.dom) return this.dom;

            this.dom = document.createElement(this.data.tagName || 'div');

            if (this.data.style) {
                for (let key in this.data.style) this.dom.style[key] = this.data.style[key];
            }

            if (this.data.id) this.dom.id = this.data.id;
            if (this.data.class) {
                if (Array.isArray(this.data.class)) {
                    this.dom.className = this.data.class.join(' ');
                } else {
                    this.dom.className = this.data.class;
                }
            }
            if (this.data.txt !== undefined) this.dom.innerText = this.data.txt;
            if (this.data.value !== undefined) this.dom.value = this.data.value;

            return this.dom;
        }

        getTxt() { return this.getDOM().innerText; }
        setTxt(txt) { this.getDOM().innerText = txt; }

        setHtml(txt) { this.getDOM().innerHTML = txt; }

        setAttr(k, v) {
            this.getDOM().setAttribute(k, v);
            return this;
        }
        removeAttr(k) { this.getDOM().removeAttribute(k); }
        getAttr(k) { return this.getDOM().getAttribute(k); }
        getHtml() { return this.getDOM().innerHTML; }
        setStyles(data) { for (let k in data) this.getDOM().style[k] = data[k]; }
        getStyle(k) { return this.getDOM().style[k]; }
        getComputedStyle(k) {
            return window.getComputedStyle(this.getDOM(), null).getPropertyValue(k);
        }

        addShift() {
            let dom = this.dom;
            let x = dom.style.left ? parseInt(dom.style.left.replace('px', ''), 10) : 0
            let newX = (x + 100) + 'px';

            this.data.style.left = newX;
            dom.style.left = newX;
        }
        setPosition(x = 0, y = 0) {
            if (!this.data.style) this.data.style = {};
            if (x) {
                this.data.style.left = x + 'px';
                this.getDOM().style.left = x + 'px';
            }
            if (y) {
                this.data.style.top = y + 'px';
                this.getDOM().style.top = y + 'px';
            }
        }
        getPosition() {
            const sizes = this.getSizesAbsolute();
            return {
                x: sizes.x,
                y: sizes.y
            }
        }
        setSize(width, height) {
            if (width) this.getDOM().style.width = width + 'px';
            if (height) this.getDOM().style.height = height + 'px';
        }
        getSize() { return this.getSizesAbsolute(); }
        getSizes() { return this.dom.getBoundingClientRect() }
        getSizesAbsolute() {
            let sizes = this.dom.getBoundingClientRect();
            let scrollX = window.scrollX;
            let scrollY = window.scrollY;

            return {
                height: sizes.height,
                width: sizes.width,

                top: sizes.top + scrollY,
                bottom: sizes.bottom + scrollY,
                left: sizes.left + scrollX,
                right: sizes.right + scrollX,
                x: sizes.x + scrollX,
                y: sizes.y + scrollY,
            }
        }
        getChildren() { return this.dom.children }
        getChildrenCount() { return this.dom.children.length }
        select() {
            this.dom.style.border = '2px solid black';
            this.dom.style.padding = '4px';
        }
        unselect() {
            this.dom.style.border = '1px solid black';
            this.dom.style.padding = '5px';
        }
        addClass(className) { this.getDOM().classList.add(className); }
        hasClass(className) { return this.dom.classList.contains(className); }
        removeClass(className) { this.getDOM().classList.remove(className); }
        isShowed() { return !this.isHidden(); }
        isHidden() { return this.dom.classList.contains('hidden'); }
        toggleDisplay() { this.getDOM().classList.toggle('hidden'); }
        show() { this.getDOM().classList.remove('hidden'); }
        hide() { this.getDOM().classList.add('hidden'); }

        visibilityShow() { this.getDOM().classList.remove('visibilityHidden'); }
        visibilityHide() { this.getDOM().classList.add('visibilityHidden'); }

        removeFromDom() { this.dom.parentNode.removeChild(this.dom); }
        remove() { this.removeFromDom(); }
        toggleEdit() {
            if (this.dom.contentEditable === 'true') {
                this.dom.removeAttribute('contentEditable');
                this.data.txt = this.dom.innerText;

                return false;
            } else {
                this.dom.contentEditable = 'true';
                this.dom.focus();

                return true;
            }
        }
        iEditMod() { this.getDOM().contentEditable = 'true' }
        oEditMode() { this.getDOM().contentEditable = 'false' }
        focus() { this.getDOM().focus(); }
        clear() { this.getDOM().innerHTML = ''; }

        parentDOM() { return this.getDOM().parentNode; }
        nextDOM() { return this.getDOM().nextSibling; }
        prevDOM() { return this.getDOM().previousSibling; }

        parent() {
            const v = new V;
            v.setDOM(this.getDOM().parentNode);
            return v;
        }
        getDOMIndex() {
            const parent = this.parentDOM();
            return Array.prototype.indexOf.call(parent.children, this.getDOM());
        }
        scrollDown() {
            const dom = this.getDOM();
            dom.scrollTop = dom.scrollHeight;
        }
        isChecked() { return this.getDOM().checked; }
    }

}