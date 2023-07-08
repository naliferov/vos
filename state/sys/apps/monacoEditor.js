async () => {
    return class MonacoEditor {

        constructor(dataNode, v) {
            this.dataNode = dataNode;
            this.v = new v({ class:['monacoEditor']});
            this.isEditorInitiated = false;
        }

        activate() {
            this.show();

            if (this.isEditorInitiated) return;
            this.isEditorInitiated = true;

            // this.editor = ace.edit(this.v.getDOM(), {mode: 'ace/mode/javascript', selectionStyle: 'text'});
            // this.editor.setTheme('ace/theme/iplastic');
            // this.editor.session.on('changeMode', (e, session) => {
            //     if ("ace/mode/javascript" === session.getMode().$id) {
            //         if (!!session.$worker) {
            //             session.$worker.send("setOptions", [{"esversion": 9, "esnext": false}]);
            //         }
            //     }
            // });
            // this.editor.session.setUseWorker(false);
            // this.editor.session.setMode('ace/mode/javascript');
            // this.editor.setValue(this.outlinerNode.getContextNode().getData(), 1);
            //this.editor.destroy();

            this.editor = monaco.editor.create(this.v.getDOM(), {
                value: this.dataNode.getData(),
                automaticLayout: true,
                language: 'javascript', fontSize: '14px', theme: 'vs-light',
            });
            //this.editor.layout();
            this.editor.getModel().onDidChangeContent(async e => {
                const value = this.editor.getValue();
                // try { eval(js); s.e('JsEvalResult', {error: 0}); }
                // catch (e) { s.e('JsEvalResult', {error: e}); }

                s.e('state.update', {dataNode: this.dataNode, data: value});
            });
        }
        deactivate() {
            this.hide();
        }

        getV() { return this.v; }
        show() { this.v.show(); }
        hide() { this.v.hide(); }
        close() { this.v.removeFromDom(); }
    }
}