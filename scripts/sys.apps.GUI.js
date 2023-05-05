async () => {
    return class GUI {

        async globals() {
            //todo reactivity for deps and realtime updates
            this.http = new (await s.f('sys.httpClient'));
            this.v = await s.f('sys.ui.view');

            s.sys.eventHandlers = {};

            globalThis.e = new Proxy(() => { }, {
                apply(target, thisArg, args) {
                    const handler = args[0];
                    const data = args[1];
                    if (s.sys.eventHandlers[handler]) {
                        return s.sys.eventHandlers[handler](data);
                    }
                },
                set(target, k, v) {
                    s.sys.eventHandlers[k] = v;
                    return true;
                }
            });
            s.def('e', e);

            s.e['>'] = (args) => {
                let [v1, v2, index] = args;

                if (v1.getV) v1 = v1.getV();
                if (v2.getV) v2 = v2.getV();

                if (index !== undefined) {
                    v2.getDOM().insertBefore(v1.getDOM(), v2.getDOM().children[index]);
                    return;
                }
                v2.getDOM().append(v1.getDOM());
            }
            s.e['>before'] = (args) => {
                const [domA, domB] = args;
                domB.getDOM().before(domA.getDOM())
            }
            s.e['>after'] = (args) => {
                const [domA, domB] = args;
                domB.getDOM().after(domA.getDOM())
            }
        }

        async start() {
            await this.globals();
            s.sys.proxyS.set = (obj, prop, val) => {
                if (prop === 'isTerminalShowed') {
                    if (val) localState.set('isTerminalShowed', 1)
                    else localState.del('isTerminalShowed');
                    return false;
                }
                return Reflect.set(obj, prop, val);
            }

            // const baseUrl = document.location.protocol + '//' + document.location.host;
            // require.config({ paths: { 'vs': baseUrl + '/node_modules/monaco-editor/min/vs' }});
            // window.MonacoEnvironment = {
            //     getWorkerUrl: (workerId, label) => {
            //         return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            //     self.MonacoEnvironment = { baseUrl: '${baseUrl}/node_modules/monaco-editor/min/' };
            //     importScripts('${baseUrl}/node_modules/monaco-editor/min/vs/base/worker/workerMain.js');`
            //         )}`;
            //     }
            // };
            // await (new Promise((resolve, reject) => {
            //     require(["vs/editor/editor.main"], () => resolve());
            // }));

            const input = new (await s.f('sys.ui.input'));
            input.onKeyDown(e => appsManager.inputEvent('keydown', e));
            input.onKeyUp(e => appsManager.inputEvent('keyup', e));
            input.onClick(e => appsManager.inputEvent('click', e));
            input.onDblClick(e => appsManager.inputEvent('dblclick', e));
            input.onContextMenu(e => appsManager.inputEvent('contextmenu', e));
            this.input = input;

            e['openNode'] = async ({ appPath = 'apps.monacoEditor', outlinerNode }) => {
                const dataNode = outlinerNode.getDataNode();
                dataNode.setPath(outlinerNode.getPath().join('.'));

                await appsManager.openApp(appPath, dataNode);
                appsManager.updateFocusedAppContainerDimensions();
            }
            e['outlinerSizeChanged'] = outlinerWidth => {

                localState.setOutlinerWidth(outlinerWidth);

                const appContainerWidth = window.innerWidth - outlinerWidth.width;
                appsManager.setWidth(appContainerWidth);
            }
            e['terminalSizeChanged'] = () => {
                s.e('recalcDimensions');
            }
            e['recalcDimensions'] = () => {
                //const height = window.innerHeight - terminal.getHeight();

                //outliner.setHeight(height - runBtn.getSizes().height);
                //appsManager.setHeight(height);

                //const appContainerWidth = window.innerWidth - this.outliner.getWidth();
                //appsManager.setWidth(appContainerWidth);
            }
            e['getDimensionsForAppContainer'] = () => {
                return {
                    width: window.innerWidth - this.outliner.getWidth(),
                    height: window.innerHeight - terminal.getHeight() - appsManager.getTabsHeight()
                }
            };
            e['state.update'] = async ({ outlinerNode, dataNode, data }) => {

                if (!dataNode) dataNode = outlinerNode.getDataNode();
                dataNode.setData(data);

                let path, k;
                if (outlinerNode) {
                    path = outlinerNode.getPath();
                    if (!path || path.length < 1) return;

                    const parentDataNode = outlinerNode.getParent().getDataNode();
                    k = path.at(-1);
                    parentDataNode.set(k, data);
                } else {
                    path = dataNode.getPath();
                    if (typeof path === 'string') {
                        path = path.split('.');
                    }
                    const parent = path.length > 1 ? s.find(path.slice(0, -1)) : s;
                    k = path.at(-1);
                    if (parent && k) parent[k] = data;
                }
                if (path) {
                    await this.http.post('/stateUpdate', { cmds: [{ path, v: data, op: 'set' }] });
                    if (k === 'js') {
                        const { parent } = s.findParentAndK(path);
                        if (parent) delete parent[s.sys.SYMBOL_FN];
                    }
                }
            }
            e['state.mv'] = async ({ oldPath, newPath }) => { }
            e['state.del'] = async ({ outlinerNode, dataNode }) => {
                //todo case  for dataNode
                const path = outlinerNode.getPath();
                await this.http.post('/stateUpdate', { cmds: [{ path, op: 'rm' }] });

                const parentOutlinerNode = outlinerNode.getParent();
                const parentDataNode = parentOutlinerNode.getDataNode();
                parentDataNode.del(path.at(-1));

                if (parentDataNode.isEmpty()) parentOutlinerNode.openCloseBtnHide();
                outlinerNode.remove();
            }
            s.e['outlinerNode.find'] = id => {
                const node = this.outliner.nodes.get(id);
                if (!node) {
                    s.l(id, this.outliner.nodes);
                }
                return node;
            }
            e['app.addViewElement'] = v => e('>', [v, app]);
            e['localState.set'] = d => {
                let [k, v] = d;
                if (!k || typeof v === 'object') return;
                localState.set(k, v);
            }
            e['localState.get'] = k => localState.get(k);

            const localState = new (await s.f('sys.apps.GUI.localState'));

            //BUILDING UI
            const app = new this.v;
            app.setDOM(document.getElementById('app'));


            const runBtn = new this.v({ class: 'burger-btn' });
            e('>', [runBtn, app]);
            [1, 1, 1].forEach(() => e('>', [new this.v({ class: 'burger-line' }), runBtn]));

            runBtn.on('pointerdown', (e) => {
                e.stopPropagation();
                runBtn.addClass('active');

                const popup = s.sys.popup; popup.clear();
                const createBtn = (txt) => new this.v({ txt, class: ['btn', 'contextMenu', 'white', 'hoverGray'] });

                let oBtn = createBtn('Auth');
                oBtn.on('click', () => {
                    popup.clear();
                    const authBar = new (s.f('sys.apps.GUI.authBar'));
                    authBar.init(this.v, this.http);
                    s.e('>', [authBar, popup]);
                });
                //oBtn.on('pointerenter', removeSubmenu);
                window.e('>', [oBtn, popup]);

                oBtn = createBtn('Data browser');
                oBtn.on('click', () => {
                    appsManager.openApp2('sys.apps.dataBrowser', null, this.mainContainer);
                    popup.clear();
                });
                //oBtn.on('pointerenter', removeSubmenu);
                window.e('>', [oBtn, popup]);

                popup.putRightTo(runBtn);
            });

            const mainContainer = new this.v({ class: ['mainContainer'] });
            this.mainContainer = mainContainer;
            e('>', [mainContainer, app]);
            s.sys.popup = new (await s.f('sys.apps.GUI.popup'));
            e('>', [s.sys.popup, app]);

            mainContainer.on('pointerdown', (e) => {
                s.sys.popup.clear();
            });

            const appsManager = new (await s.f('sys.apps.GUI.appsManager'));
            await appsManager.init(localState);
            await appsManager.openApp2('sys.apps.dataBrowser', null, this.mainContainer);

            input.onResize(e => s.e('recalcDimensions'));

            //localState.set('isTerminalShowed', '');
            //if (!localState.get('isTerminalShowed')) {
            //terminal.hide();
            //localState.set('isTerminalShowed', '');
            //}
            const eventSource = () => {
                const sse = new EventSource('/stream');
                sse.onmessage = (event) => {
                    let msg = '';
                    try {
                        msg = JSON.parse(event.data);
                    } catch (e) {
                        console.error(e);
                        return;
                    }
                    s.l(msg);
                }
                sse.onerror = (e) => console.log('An error occurred while attempting to connect.', e);
            }
            eventSource();
        }

        resizerDragAndDrop() {

            return;

            let resizerSizes;
            let shift;

            const outlinerPadding = this.outliner.getHorizontalPadding();

            const move = e => {
                const mouseX = e.clientX;
                if (mouseX < 20 || mouseX > (window.innerWidth - 20)) return;

                const oulinerWidth = mouseX - outlinerPadding - resizerSizes.width + shift;

                this.outliner.getV().setStyles({ width: oulinerWidth + 'px' });
                window.e('outlinerSizeChanged', oulinerWidth);
            }
            this.resizer.on('pointerdown', e => {
                s.sys.popup.clear();

                e.preventDefault();
                resizerSizes = this.resizer.getSizes();
                shift = (resizerSizes.x + resizerSizes.width) - e.clientX;

                this.input.onMouseMove(move);
                this.input.onMouseUp(() => {
                    this.input.onMouseUp(null);
                    this.input.onMouseMove(null);
                });
            });
        }
    }
}