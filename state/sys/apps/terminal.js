() => {
    return class terminal {

        getV() { return this.v }
        getTitle() { return 'Terminal'; }
        init() {
            const v = s.f('sys.ui.view');

            this.v = new v({ class: 'terminal' });
            this.header = new v({ class: 'consoleHeader' });
            e('>', [this.header, this.v]);

            const clear = new v({ txt: 'clear', class: ['btn', 'cursorPointer'] });
            clear.on('click', e => this.content.clear());
            e('>', [clear, this.header]);

            const scrollBlock = new v({ class: ['scrollBlock', 'flex'] });
            e('>', [scrollBlock, this.header]);

            //add persistence chain for every attribute like checked and etc
            this.automaticScroll = new v({ tagName: 'input' });
            this.automaticScroll.setAttr('name', 'automaticScroll');
            this.automaticScroll.setAttr('type', 'checkbox');
            this.automaticScroll.setAttr('checked', 'true');

            e('>', [this.automaticScroll, scrollBlock]);
            e('>', [new v({ txt: 'automatic scroll' }), scrollBlock]);

            const consoleCmd = new v({ tagName: 'input', class: ['nooutline', 'consoleCmd'] });
            this.consoleCmd = consoleCmd;
            consoleCmd.setAttr('placeholder', 'cmd');
            consoleCmd.setAttr('name', 'cmdInput');
            consoleCmd.on('keydown', (e) => {
                if (e.key !== 'Enter') return;
                const v = e.target.value;

                //autocomplete for commands
                if (v === 'outliner.hide') {
                    //localState.set('outlinerHidden', 1);
                    //outliner hide
                }
                if (v === 'outliner.show') {
                    //localState.del('outlinerHidden');
                }
            });
            consoleCmd.on('keyup', e => { });
            e('>', [consoleCmd, this.header]);

            this.content = new v({ class: 'log' });
            e('>', [this.content, this.v]);

            e['terminal.logMsg'] = logMsg => {
                const prev = new v({ tagName: 'pre', txt: logMsg });
                e('>', [prev, this.content]);

                if (this.automaticScroll.isChecked()) {
                    this.v.scrollDown();
                }
            }
        }
        enableAutomaticScroll() { this.automaticScroll.setAttr('checked', ''); }
    }

}