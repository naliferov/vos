() => {
    return class popup {

        constructor() {
            const v = s.f('sys.ui.view');
            this.v = new v({class: 'popup'});
        }
        clear() {
            this.v.clear();
            if (this.clearCallback) this.clearCallback();
            this.clearCallback = null;
        }
        remove() { this.v.remove(); }
        onClear(cb) { this.clearCallback = cb; }

        setDimensions(width, height) {
            this.v.setStyles({
                width: width + 'px',
                height: height + 'px',
            });
        }

        putRightTo(v) {
            const sizes = v.getSizesAbsolute();
            this.v.setStyles({top: sizes.top + 'px', left: sizes.right + 'px'});
        }
        putRightToPointer(pointer) {
            //todo scroll?
            this.v.setStyles({left: pointer.x + 8 + 'px', top: pointer.y + 'px'});
        }
        getV() { return this.v; }
    }

}