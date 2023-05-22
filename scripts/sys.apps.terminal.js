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

            this.automaticScroll = new v({ tagName: 'input' });
            this.automaticScroll.setAttr('type', 'checkbox');
            this.automaticScroll.setAttr('checked', 'true');

            e('>', [this.automaticScroll, scrollBlock]);
            e('>', [new v({ txt: 'automatic scroll' }), scrollBlock]);

            //const http = new (s.f('sys.httpClient'));
            // const file = new v({tagName: 'input'});
            // file.setAttr('type', 'file');
            // e('>', [file, this.header]);
            // file.on('change', e => {
            //     const reader = new FileReader;
            //     reader.onload = async () => {
            //         s.l(await http.postBuf('/uploadFile', reader.result));
            //     }
            //     reader.readAsArrayBuffer(file.getDOM().files[0]);
            // });

            const cmds = {
                outlinerHide: () => {
                    //
                }
            };
            const consoleCmd = new v({ tagName: 'input', class: ['nooutline', 'consoleCmd'] });
            this.consoleCmd = consoleCmd;
            consoleCmd.setAttr('placeholder', 'cmd');
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

                //sticky header
                //scroll down content
            }

            //listen event logMsg.
            //on msg add to content
        }
        enableAutomaticScroll() { this.automaticScroll.setAttr('checked', ''); }
    }

}