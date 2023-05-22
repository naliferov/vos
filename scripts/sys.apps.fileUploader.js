() => {
    return class fileUploader {

        getV() { return this.v }
        getTitle() { return 'File uploader'; }
        async init() {

            if (this.v) this.v.clear();

            const v = await s.f('sys.ui.view');
            const http = new (await s.f('sys.httpClient'));
            let authPanel = new v;
            if (this.v) authPanel = this.v;
            else {
                this.v = authPanel;
            }
            const tokenInput = new v({ tagName: 'input', txt: 'clear', class: ['tokenInput'] });
            tokenInput.setAttr('placeholder', 'File upload');
            tokenInput.setAttr('type', 'password');
            tokenInput.on('pointerdown', e => {
                e.stopPropagation();
            });
            e('>', [tokenInput, authPanel]);
        }
    }
}