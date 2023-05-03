async () => {
    return class TxtEditor {

        constructor(dataNode, v, vContainer) {

            this.dataNode = dataNode;
            this.v = new v({style: {height: '100%'}});
            this.v.attachShadow();

            const css = new v({tagName: 'style'});
            css.setHtml(`
textarea {
    font-family: 'Roboto', sans-serif;
    width: 99%;
    height: 99%;
    padding: 0;
    border: 0;
    outline: 0;
`);
            this.v.insert(css.getDOM());

            this.textArea = new v({ tagName: 'textarea', value: dataNode.getData()});
            this.textArea.on('keyup', e => {
                const newVal = e.target.value;
                if (dataNode.getData() === newVal) return;
                s.e('state.update', {dataNode: this.dataNode, data: newVal});
            });
            this.v.insert(this.textArea.getDOM());
            //e('>', [this.textArea, this.v]);
        }
        activate() {
            this.v.show();
            const parent = this.v.parent();
        }
        deactivate() { this.v.hide(); }
        getV() { return this.v; }
        close() { this.v.removeFromDom(); }
    }
}