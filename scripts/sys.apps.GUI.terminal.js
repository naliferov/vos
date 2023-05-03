async () => {
    return class Terminal {

        constructor(localState, input) {
            const v = s.f('sys.ui.view');

            this.v = new v({class: 'terminal'});
            this.header = new v({class: 'consoleHeader'});
            e('>', [this.header, this.v]);
            
            e('>', [new v({txt: 'Terminal', style: {fontWeight: 'bold'}}), this.header]);

            const clear = new v({txt: 'clear', class: ['btn', 'cursorPointer']});
            clear.on('click', e => this.content.clear());
            e('>', [clear, this.header]);

            const scrollContainer = new v({class: ['scrollContainer', 'flex']});
            e('>', [scrollContainer, this.header]);

            this.automaticScroll = new v({tagName: 'input'});
            this.automaticScroll.setAttr('type', 'checkbox');
            this.automaticScroll.setAttr('checked', 'true');

            e('>', [this.automaticScroll, scrollContainer]);
            e('>', [new v({txt: 'automatic scroll'}), scrollContainer]);

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
            const consoleCmd = new v({tagName: 'input', class: ['nooutline', 'consoleCmd']});
            this.consoleCmd = consoleCmd;
            consoleCmd.setAttr('placeholder', 'cmd');
            consoleCmd.on('keydown', (e) => {
                if (e.key !== 'Enter') return;
                const v = e.target.value;

                //autocomplete for commands
                if (v === 'outliner.hide') {
                    localState.set('outlinerHidden', 1);
                    //outliner hide
                }
                if (v === 'outliner.show') {
                    localState.del('outlinerHidden');
                }
            });
            consoleCmd.on('keyup', (e) => {

            });
            e('>', [consoleCmd, this.v]);

            this.content = new v({class: 'processLogContent'});
            e('>', [this.content, this.v]);

            const height = Number(localState.getLogPanelHeight());
            if (height && height < window.innerHeight) {
                this.content.setStyles({height: height + 'px'});
            } else {
                this.content.setStyles({height: '100px'});
                localState.setLogPanelHeight(100);
            }

            this.input = input;
            this.localState = localState;

            this.dragAndDrop();
        }

        init() { e('terminalSizeChanged', this.v.getSizes().height); }
        getHeight() { return this.v.getSizes().height; }

        dragAndDrop() {
            let headerSizes;
            let consoleCmdSizes;
            let shift;

            const pointerMove = (e) => {
                const mouseY = e.clientY;
                if (mouseY < headerSizes.height) {
                    this.content.setStyles({height: window.innerHeight - headerSizes.height - consoleCmdSizes.height + 'px'});
                    return;
                }
                const contentHeight = window.innerHeight - mouseY - headerSizes.height - consoleCmdSizes.height + shift;
                this.content.setStyles({height: contentHeight + 'px'});

                window.e('terminalSizeChanged');
            }
            this.header.on('pointerdown', (e) => {
                e.preventDefault();
                headerSizes = this.header.getSizes();
                consoleCmdSizes = this.consoleCmd.getSizes();
                shift = e.clientY - headerSizes.y;

                this.input.onMouseMove(pointerMove);
                this.input.onMouseUp(() => {
                    this.input.onMouseUp(null);
                    this.input.onMouseMove(null);
                    this.localState.setLogPanelHeight(this.content.getSizes().height);
                });
            });
        }

        getV() { return this.v; }
        show() {
            this.v.show();
        }
        hide() {
            this.v.hide();
            window.e('terminalSizeChanged');
        }
        switchVisibility() { this.v.isShowed() ? this.v.hide() : this.v.show(); }

        addMsg() {


        }

        enableAutomaticScroll() { this.automaticScroll.setAttr('checked', ''); }
}
    
}