() => {

    return class dataBrowser {

        getV() { return this.v; }
        getTitle() { return 'Data browser'; }
        async init() {
            this.http = new (await s.f('sys.httpClient'));
            this.nodes = new Map;

            const v = await s.f('sys.ui.view');
            this.v = new v({ class: 'dataBrowser' });

            const DataNode = await s.f('sys.apps.GUI.dataNode');
            this.node = DataNode;
            const DataBrowserNode = await s.f('sys.apps.dataBrowser.node');
            this.outlinerNode = DataBrowserNode;

            const dataNode = new DataNode(s);
            const node = new DataBrowserNode;
            await node.init(dataNode, true, this);
            node.removeSubNodesShift();
            e('>', [node, this.v]);

            this.openedPaths = s.e('localState.get', 'openedPaths');
            if (this.openedPaths) {
                this.openedPaths = JSON.parse(this.openedPaths);
            } else {
                this.openedPaths = {};
            }

            //todo clear this.openedPaths which not exists in "s"
            this.addNode(node);
            await node.open(this.openedPaths);

            this.buffer = null;
        }
        addNode(dataBrowserNode) {
            this.nodes.set(dataBrowserNode.getId(), dataBrowserNode);
        }
        removeNode(id) {
            this.nodes.delete(id);
        }
        activate() {
            this.v.show();
            //const parent = this.v.parent();
        }
        deactivate() { this.v.hide(); }
        close() {

        }

        setHeight(height) { this.getV().setStyles({ height: height + 'px' }); }
        //todo put outliner content in container without padding and remove this shit
        getWidth() { return this.getV().getSizes().width; }
        getHorizontalPadding() {
            return parseInt(this.getV().getComputedStyle('padding-left').slice(0, -2), 10) * 2;
        }
        //isEmpty() { return this.outLinerRootNode.isEmpty()}
        getOutlinerNodeById(id) { return this.nodes.get(id); }

        async duplicate(outlinerNode) {

            const parentDataNode = outlinerNode.getParent().getDataNode();
            const dataNode = outlinerNode.getDataNode();
            const newK = dataNode.getKey() + '_copy';

            if (parentDataNode.get(newK)) {
                console.log(`Key ${newK} already exists in object.`); return;
            }
            let v = dataNode.getData();
            if (s.f('sys.isObject', v) || s.f('sys.isArray', v)) v = structuredClone(v);

            const newDataNode = new this.node(v);
            newDataNode.setKey(newK);
            const newOutlinerNode = new this.outlinerNode;
            await newOutlinerNode.init(newDataNode, false);

            e('>after', [newOutlinerNode.getV(), outlinerNode.getV()]);
            this.nodes.set(newOutlinerNode.getDomId(), newOutlinerNode);

            parentDataNode.set(newK, v);
            setTimeout(() => newOutlinerNode.focus(), 100);

            newDataNode.setPath(newOutlinerNode.getPath());
            s.e('state.update', { dataNode: newDataNode, data: v });
        }

        async handleKeyDown(e) {

            if (!e.target.classList.contains('dataKey')) return;

            const outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
            if (!outlinerNode) { console.log('outlinerNode not found'); return; }

            const k = e.key;
            const ctrl = e.ctrlKey || e.metaKey;

            if (k === 'Enter') {
                e.preventDefault();
            } else if (k === 'Tab') {
                e.preventDefault();
                // if (e.shiftKey) {
                //     const parent = outlinerNode.getParent();
                //     window.e('>after', [outlinerNode.getV(), parent.getV()]);
                // } else if (outlinerNode.prev()) {
                //     window.e('>', [outlinerNode.getV(), outlinerNode.prev().getNodesV()]);
                // }

            } /*else if (ctrl && k === 'ArrowUp' && outlinerNode.prev()) {
                window.e('>after', [outlinerNode.prev().getV(), outlinerNode.getV()]);
            } else if (ctrl && k === 'ArrowDown' && outlinerNode.next()) {
                window.e('>after', [outlinerNode.getV(), outlinerNode.next().getV()]);
            } */else if (ctrl && k === 'v') {
                //setTimeout(() => {
                //outlinerNode.updateNameInContextNode();
                //this.save();
                //}, 200);
                return;
            } else {
                return;
            }
            e.target.focus();
            //await this.save();
        }

        async handleKeyUp(e) {

            if (!e.target.classList.contains('dataKey')) return;

            const ignoreKeys = ['Enter', 'Tab', 'Control', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (new Set(ignoreKeys).has(e.key)) return;

            const outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));

            const node = outlinerNode.getDataNode();
            const newK = e.target.innerText;
            const v = node.getData();

            if (newK.length === 0) {
                if (!confirm('Delete object?')) return;
                s.e('state.del', { outlinerNode })
                return;
            }

            const oldKPath = outlinerNode.getPath();
            const newKPath = [...oldKPath];
            newKPath[newKPath.length - 1] = newK;

            if (newKPath.toString() === oldKPath.toString()) return;

            await this.http.post('/stateUpdate', { cmds: [{ newPath: newKPath, oldPath: oldKPath, op: 'mv' }] });
            const parentDataNode = outlinerNode.getParent().getDataNode();

            parentDataNode.set(newKPath.at(-1), v);
            parentDataNode.del(oldKPath.at(-1));

            node.setKey(newK);
        }

        async handleClick(e) {

            const addOpenedNode = node => {
                //todo some func to direct iteration in depth of object by path
                let lastObj = this.openedPaths;
                const path = node.getPath();

                for (let i = 0; i < path.length; i++) {
                    const part = path[i];
                    if (!lastObj[part]) lastObj[part] = {};
                    lastObj = lastObj[part];
                }
                s.e('localState.set', ['openedPaths', JSON.stringify(this.openedPaths)]);
            }
            const deleteOpenedNode = node => {

                let lastObj = this.openedPaths;
                let lastPart;
                const path = node.getPath();

                for (let i = 0; i < path.length; i++) {
                    const part = path[i];
                    const isLastIndex = i === path.length - 1;
                    if (isLastIndex) {
                        delete lastObj[part];
                        break;
                    }
                    lastObj = lastObj[part];
                    lastPart = part;
                }
                s.e('localState.set', ['openedPaths', JSON.stringify(this.openedPaths)]);
            }
            const classList = e.target.classList;

            if (classList.contains('openClose') || classList.contains('openCloseArrow')) {

                let outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
                if (!outlinerNode.hasSomethingToOpen()) {
                    return;
                }
                if (outlinerNode.isOpened) {
                    outlinerNode.close()
                    deleteOpenedNode(outlinerNode);
                } else {
                    outlinerNode.open();
                    addOpenedNode(outlinerNode);
                }
                return;
            }

            if (classList.contains('dataKey')) {

                let node = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
                if (!node.hasSomethingToOpen()) return;
                if (!node.isOpened) {
                    node.open();
                    addOpenedNode(node);
                }
            }
        }

        async handleDblClick(e) {
            if (!e.target.classList.contains('dataKey') && !e.target.classList.contains('dataValue')) {
                return;
            }
            //let outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
            //window.e('openNode', {outlinerNode});
        }

        handleContextMenu(e) {
            e.preventDefault();

            const isDataK = e.target.classList.contains('dataKey');
            const isDataV = e.target.classList.contains('dataValue');
            if (!isDataK && !isDataV) return;

            const outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
            const dataNode = outlinerNode.getDataNode();
            const data = dataNode.getData();

            const v = s.f('sys.ui.view');
            const createBtn = (txt) => {
                return new v({ txt, class: ['btn', 'contextMenu', 'white', 'hoverGray'] });
            }

            const popup = s.sys.popup;
            let submenu;
            const removeSubmenu = () => {
                if (!submenu) return;
                submenu.clear();
                submenu = null;
            }

            let oBtn = createBtn('Open with');
            let openWithBtn = oBtn;
            oBtn.on('pointerenter', async () => {
                removeSubmenu();
                submenu = new (s.f('sys.apps.GUI.popup'));
                window.e('app.addViewElement', submenu);

                const apps = s.sys.apps;
                //todo const authorizedUserApps = s.users[user].apps;

                for (let name in apps) {
                    if (name === 'GUI') continue;
                    let appBtn = createBtn(name);
                    appBtn.on('click', () => {
                        window.e('openNode', { appPath: `sys.apps.${name}`, outlinerNode });
                        popup.clear();
                    });
                    window.e('>', [appBtn, submenu]);
                }
                submenu.putRightTo(openWithBtn);
            });
            window.e('>', [oBtn, popup]);


            if (typeof data === 'object' && data !== null) {
                oBtn = createBtn('Add item');
                oBtn.on('pointerenter', removeSubmenu);
                oBtn.on('click', () => {

                    if (Array.isArray(data)) {
                        data.push('item' + data.length + 1);
                    } else {
                        let c = 0;
                        while (1) {
                            c++;
                            const k = 'newKey' + c; const v = 'newValue';
                            if (data[k]) continue;

                            data[k] = v;
                            const dataNode = new this.node;
                            dataNode.setPath([...outlinerNode.getPath(), k]);
                            s.e('state.update', { dataNode, data: v });
                            break;
                        }
                    }

                    outlinerNode.reopen();
                    popup.clear();
                });
                window.e('>', [oBtn, popup]);
            }

            oBtn = createBtn('Copy');
            oBtn.on('click', () => {
                this.buffer = { mode: 'copy', outlinerNode };
                popup.clear();
            });
            oBtn.on('pointerenter', removeSubmenu);
            window.e('>', [oBtn, popup]);

            oBtn = createBtn('Cut');
            oBtn.on('click', () => {
                this.buffer = { mode: 'cut', outlinerNode };
                popup.clear();
            });
            oBtn.on('pointerenter', removeSubmenu);
            window.e('>', [oBtn, popup]);

            if (this.buffer) {
                oBtn = createBtn('Paste');
                oBtn.on('click', async () => {
                    if (!this.buffer) return;

                    const contextNodeData = outlinerNode.getDataNode().getData();
                    if (!s.f('sys.isObject', contextNodeData) && !Array.isArray(contextNodeData)) return;

                    const bufOurlinerNode = this.buffer.outlinerNode;
                    const dataPath = bufOurlinerNode.getPath();

                    const dataNodeCopy = new this.node;
                    //todo in case of array we don't need to set key. just push to array
                    dataNodeCopy.setPath([...outlinerNode.getPath(), dataPath.at(-1)]);

                    const data = structuredClone(bufOurlinerNode.getDataNode().getData());
                    s.e('state.update', { dataNode: dataNodeCopy, data });
                    if (this.buffer.mode === 'cut') {
                        await s.e('state.del', { outlinerNode: bufOurlinerNode });
                    }

                    this.buffer = null;
                    outlinerNode.reopen(); //todo remember opened nodes
                    popup.clear();
                });
                oBtn.on('pointerenter', removeSubmenu);
                window.e('>', [oBtn, popup]);
            }

            oBtn = createBtn('Duplicate');
            oBtn.on('click', async () => {
                await this.duplicate(outlinerNode);
                popup.clear();
            });
            oBtn.on('pointerenter', removeSubmenu);
            window.e('>', [oBtn, popup]);

            oBtn = createBtn('Console log');
            oBtn.on('pointerenter', removeSubmenu);
            oBtn.on('click', () => {
                s.l(dataNode);
                popup.clear();
            });
            window.e('>', [oBtn, popup]);

            oBtn = createBtn('Console path');
            oBtn.on('pointerenter', removeSubmenu);
            oBtn.on('click', () => {
                s.l(outlinerNode.getPath());
                popup.clear();
            });
            window.e('>', [oBtn, popup]);

            oBtn = createBtn('Convert type to');
            let convertTypeBtn = oBtn;
            oBtn.on('pointerenter', () => {
                removeSubmenu();
                submenu = new (s.f('sys.apps.GUI.popup'));
                window.e('app.addViewElement', submenu);

                const types = ['Object', 'Array', 'String'];
                types.forEach(type => {
                    let btn = createBtn(type);
                    btn.on('click', () => {
                        let data;
                        if (type === 'Array') data = [];
                        if (type === 'Object') data = {};
                        if (type === 'String') data = 'str';
                        if (data === undefined) return;
                        s.e('state.update', { outlinerNode, data });

                        outlinerNode.getParent().reopen();
                        popup.clear();
                    });
                    window.e('>', [btn, submenu]);
                });
                submenu.putRightTo(convertTypeBtn);

            });
            window.e('>', [oBtn, popup]);

            popup.onClear(() => removeSubmenu());
            popup.putRightToPointer({ x: e.clientX, y: e.clientY });
        }

    }
}