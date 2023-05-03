async () => {
    return class TabName {
        constructor(tabId, name) {

            const v = s.f('sys.ui.view');
            this.v = new v({id: tabId, class: 'tab'});

            this.name = new v({class: 'tabName', txt: name});
            e('>', [this.name, this.v]);
            this.closeBtn = new v({class: 'tabCloseBtn'});
            e('>', [this.closeBtn, this.v]);

        }
        hightLightErr() { this.v.addClass('error'); }
        unHightlightErr() { this.v.removeClass('error'); }

        getOutlinerNode() { return this.outlinerNode; }
        activate() { this.v.addClass('active'); }
        deactivate() { this.v.removeClass('active'); }
        onTabClick(fn) { this.v.on('click', e => fn(e)); }
        onTabCloseClick(fn) {
            this.closeBtn.on('click', e => {
                fn(e, this.closeBtn.parent().getDOMIndex());
            });
        }
        close() { this.v.removeFromDom(); }
        getV() { return this.v; }
    }
}