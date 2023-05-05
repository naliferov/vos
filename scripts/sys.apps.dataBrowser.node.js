async () => {

    return class dataBrowserNode {

        async init(dataNode, isRoot, dataBrowser) {
            this.dataNode = dataNode;
            this.dataBrowser = dataBrowser;
            this.domId = s.f('sys.uuid');

            const v = await s.f('sys.ui.view');
            this.v = new v({ id: this.domId, class: ['node'] });
            this.isOpened = false;
            this.isRoot = isRoot;

            if (!this.isRoot) await this.createDataFields(dataNode);

            this.subNodesV = new v({ class: ['subNodes', 'shift'] });
            e('>', [this.subNodesV, this.v]);
        }
        getId() { return this.domId; }

        async createDataFields(dataNode) {
            const data = dataNode.getData();
            let dType = dataNode.getDataType();
            let dTypeLabel = { boolean: 'bool', function: 'f', number: 'num', object: '' }[dType] ?? dType;
            if (data === null) dTypeLabel = 'null';
            else if (data === undefined) dTypeLabel = 'undefined';

            const v = await s.f('sys.ui.view');
            const container = new v({ class: ['nodeContainer', 'flex'] }); e('>', [container, this.v]);

            this.openClose = new v({ class: 'openClose' });
            this.openClose.setAttr('outliner_node_id', this.domId);
            e('>', [this.openClose, container]);

            const openCloseArrow = new v({ class: 'openCloseArrow' });
            openCloseArrow.setAttr('outliner_node_id', this.domId);
            e('>', [openCloseArrow, this.openClose]);
            if (!this.hasSomethingToOpen()) this.openCloseBtnHide();

            this.keyV = new v({ class: 'dataKey', txt: dataNode.getKey() });
            this.keyV.setAttr('outliner_node_id', this.domId);
            this.keyV.toggleEdit();
            e('>', [this.keyV, container]);

            if (!s.f('sys.isObject', data) && !Array.isArray(data)) {
                e('>', [new v({ class: 'sep', txt: ':', style: { marginRight: '5px' } }), container]);
            }

            let slicedStrInfo;
            let opsBtn;
            const createValueV = (txt, className, color) => {
                if (txt === false) txt = 'false';

                return new v({ txt, class: className, style: { color: color, whiteSpace: 'nowrap' } });
            }

            let valueV;

            if (dType === 'boolean') {
                valueV = createValueV(data, 'dataValue', 'blue');
                valueV.iEditMod();
            } else if (dType === 'number') {
                valueV = createValueV(data, 'dataValue', '#221199');
                valueV.iEditMod();
            } else if (dType === 'string') {

                const limit = 500;
                let isSliced = false;
                let str = data;
                if (str.length > limit) {
                    str = str.slice(0, limit).trim() + '...';
                    str = str.replaceAll('\n', '');
                    isSliced = true;
                }
                valueV = createValueV(str, ['dataValue', 'string'], '#AA1011');
                if (isSliced) {
                    slicedStrInfo = new v({ txt: 'and more ' + (data.length - limit) + ' chars', style: { marginLeft: '5px', 'white-space': 'nowrap' } });
                } else {
                    valueV.iEditMod();
                }

            } else {
                valueV = createValueV(dTypeLabel, 'dataType', 'gray')
            }
            valueV.setAttr('outliner_node_id', this.domId);
            valueV.on('keyup', async () => this.netUpdate());


            if (dType === 'string') e('>', [new v({ class: 'quote', txt: "'" }), container]);
            e('>', [valueV, container]);
            if (dType === 'string') e('>', [new v({ class: 'quote', txt: "'" }), container]);

            if (slicedStrInfo) e('>', [slicedStrInfo, container]);
            if (opsBtn) e('>', [opsBtn, container]);

            this.valueV = valueV;
        }

        async netUpdate() {
            const v = this.valueV.getTxt();
            if (!v) {
                if (confirm('Delete prop?')) {
                    s.e('state.del', { outlinerNode: this });
                }
                return;
            }
            if (v === this.getDataNode().getData()) return;

            s.e('state.update', { outlinerNode: this, data: v });
        }
        getDomId() { return this.domId }

        async requestData() {
            const http = new (await s.f('sys.httpClient'));
            const { data } = await http.post('/state', { path: this.getPath() });
            if (data) {
                this.dataNode.setData(data);
                const parentNode = s.find(this.getPath().slice(0, -1));
                if (parentNode) {
                    parentNode[this.getPath().at(-1)] = data;
                }
            } else {
                this.dataNode.getData()[s.sys.SYMBOL_IS_EMPTY_NODE] = true;
            }
        }

        async open(openedPaths = {}) {

            const dType = this.dataNode.getDataType();
            let v = this.dataNode.getData();
            if (dType !== 'object' || v === null) return;

            if (s.f('sys.isEmptyObject', v) || (Array.isArray(v) && v.length === 0)) {

                if (!v[s.sys.SYMBOL_IS_EMPTY_NODE]) await this.requestData();
                //todo add global method, getParentNode
            }

            v = this.dataNode.getData();

            const NodeClass = await s.f('sys.apps.GUI.dataNode');
            const OutlinerNodeClass = await s.f('sys.apps.GUI.outlinerNode');

            const renderNode = async (k, node) => {
                const dataNode = new NodeClass(node);
                dataNode.setKey(k);

                const outlinerNode = new OutlinerNodeClass;
                await outlinerNode.init(dataNode, false, this.dataBrowser);
                e('>', [outlinerNode.getV(), this.getNodesV()]);
                this.dataBrowser.addNode(outlinerNode);

                if (openedPaths[k] && outlinerNode.hasSomethingToOpen()) {
                    await outlinerNode.open(openedPaths[k]);
                }
            }

            if (Array.isArray(v)) {
                for (let i = 0; i < v.length; i++) await renderNode(i, v[i]);
            } else {
                const nameNode = {};
                for (let k in v) {
                    const kLower = k.toLowerCase();
                    if (!nameNode[kLower]) nameNode[kLower] = [];
                    nameNode[kLower].push({ k, node: v[k] });
                }
                const sortedKeys = Object.keys(nameNode).sort();

                for (let i = 0; i < sortedKeys.length; i++) {

                    const nodes = nameNode[sortedKeys[i]];
                    for (let j = 0; j < nodes.length; j++) {
                        await renderNode(nodes[j].k, nodes[j].node);
                    }
                }
            }
            this.isOpened = true;
            if (this.openClose) this.openClose.addClass('opened');
        }
        async close() {
            const nodesV = this.getNodesV();
            const children = nodesV.getChildren();
            //todo should be recursive
            for (let i = 0; i < children.length; i++) {
                const id = children[i].id;
                if (!id) throw Error('no outliner_node_id on ' + children[i]);
                this.dataBrowser.removeNode(id);
            }
            nodesV.clear();
            this.isOpened = false;
            if (!this.isRoot) {
                this.openClose.removeClass('opened');
            }
        }

        reopen() {
            //todo close all items recursive and open again
            if (this.isOpened) this.close();
            this.open();
        }

        hasSomethingToOpen() {
            const data = this.getDataNode().getData();
            const dType = this.getDataNode().getDataType();

            if (dType !== 'object' || data === null) return false;

            return true;
            //if (Array.isArray(data)) return data.length > 0;
            //return !s.f('sys.isEmptyObject', data);
        }

        async showOutlinerOpsPopup(opsBtn) {
            s.popup.clear();

            const v = await s.f('sys.ui.view');

            const createBtn = txt => new v({ txt, class: 'btn' });

            let oBtn = createBtn('Add');
            oBtn.on('click', async () => {
                this.getDataNode().set('newProp', 'value');
                this.openClose.visibilityShow();
                await this.close();
                await this.open();
                s.popup.clear();
            });
            e('>', [oBtn, s.popup]);

            // oBtn = createBtn('delete'); oBtn.on('click', e => {
            //     if (confirm('Delete prop?')) {
            //         s.e('state.del', {outlinerNode: this});
            //     }
            //     s.popup.clear();
            // });
            // e('>', [oBtn, s.popup]);

            // oBtn = createBtn('console.log'); oBtn.on('click', e => {
            //     console.log(this.getDataNode());
            //     s.popup.clear();
            // });
            e('>', [oBtn, s.popup]);

            s.popup.putRightTo(opsBtn);
        }
        openCloseBtnShow() { this.openClose.visibilityShow(); }
        openCloseBtnHide() { this.openClose.visibilityHide(); }

        //isEmpty() { return !this.dataNodesV.getDOM().children.length }
        isInRoot() { return this.getParent().isRoot }
        getParent() {
            const node = this.dataBrowser.nodes.get(this.v.parentDOM().parentNode.id);
            if (!node) {
                // s.l(id, this.outliner.nodes);
            }
            return node;
        }
        getPath() {
            let path = [];
            let lastNode = this;
            while (!lastNode.isRoot) {
                path.push(lastNode.getDataNode().getKey());
                lastNode = lastNode.getParent();
            }
            return path.reverse();
        }

        // next() {
        //     const next = this.v.getDOM().nextSibling;
        //     return next ? s.outlinerPool.get(next.id) : null;
        // }
        // prev() {
        //     const previous = this.v.getDOM().previousSibling;
        //     return previous ? s.outlinerPool.get(previous.id) : null;
        // }
        getDataNode() { return this.dataNode }

        getV() { return this.v }
        getKeyValue() { return this.keyV.getTxt(); }

        getNodesV() { return this.subNodesV }
        removeSubNodesShift() { this.subNodesV.removeClass('shift'); }
        focus() { this.keyV.focus(); }
        remove() { this.getV().removeFromDom(); }
    }
}