() => {
    return class AppsManager {

        async init(uiContainer) {

            this.uiContainer = uiContainer;
            this.openedApps = [];

            let lsOpenedApps = s.e('localState.get', 'openedApps'); //localStateOpenedApps
            if (!lsOpenedApps) return;
            lsOpenedApps = JSON.parse(lsOpenedApps);

            for (let i = 0; i < lsOpenedApps.length; i++) {

                const { appPath, dataPath, dimensions } = lsOpenedApps[i];

                let dataNode;
                if (dataPath) {
                    const node = s.find(dataPath);
                    if (node) {
                        //todo delete from localState
                        //this.localState.setOpenedApps(this.openedApps);
                        //const dataNode = new DataNode(node);
                        //dataNode.setPath(dataPath);
                    } else {
                        //deleteFromLocal storage
                    }
                }
                const appFrame = await this.openApp(appPath, dataNode, false);
                appFrame.setPosition(dimensions.x, dimensions.y);
                appFrame.setSize(dimensions.width, dimensions.height);
                appFrame.recalcDimensions();
            }
        }
        async inputEvent(t, e) {
            if (!this.focusedAppFrame) return;

            const app = this.focusedAppFrame.getApp();

            if (t === 'click' && app.handleClick) app.handleClick(e);
            else if (t === 'contextmenu' && app.handleContextmenu) app.handleContextmenu(e);
            else if (t === 'keydown' && app.handleKeydown) app.handleKeydown(e);
            else if (t === 'keyup' && app.handleKeyup) app.handleKeyup(e);
            else if (t === 'blclick' && app.handleDblclick) app.handleDblclick(e);
        }
        async appFrameChangePosition(appFrame, x, y) {
            this.saveOpenedApps();
        }
        async appFrameChangeSize(appFrame, width, height) {
            this.saveOpenedApps();
        }

        async openApp(appPath, dataNode, addToLocalState) {

            const v = await s.f('sys.ui.view');
            //this can be cached with subscription on change, change protos in real time

            const appFrame = Object.create(s.f('sys.apps.GUI.appFrame'));
            await appFrame.init(appPath, dataNode, v);
            appFrame.setIndex(this.openedApps.length);

            e('>', [appFrame.getView(), this.uiContainer]);

            appFrame.getView().on('click', (e) => this.focusAppFrame(appFrame));
            appFrame.getView().on('contextmenu', (e) => this.focusAppFrame(appFrame));
            this.openedApps.push(appFrame);

            if (addToLocalState) {
                //use this methods manually. after this skip and remove flag "addToLocalState"
                appFrame.setDefaultSize();
                this.saveOpenedApps();
            }
            appFrame.recalcDimensions();

            this.focusedAppFrame = appFrame;

            return appFrame;
        }
        saveOpenedApps() {

            const arr = [];

            this.openedApps.forEach(appFrame => {

                const sizes = appFrame.getSizes();
                arr.push({
                    appPath: appFrame.getAppPath(),
                    dataPath: appFrame.getDataPath(),
                    dimensions: {
                        x: sizes.x,
                        y: sizes.y,
                        width: sizes.width,
                        height: sizes.height
                    },
                });
            });
            s.e('localState.set', ['openedApps', JSON.stringify(arr)]);
        }
        focusAppFrame(appFrame) {
            if (this.focusedAppFrame) {
                // if (this.activeTab.getContextNodeId() === tab.getContextNodeId()) {
                //     return;
                // }
                //this.focusedApp.deactivate();
            }
            this.focusedAppFrame = appFrame;
            //appFrame.activate();
            //this.localState.s(appContainer.getId());
        }
        closeAppFrame(appFrame) {
            this.openedApps.splice(appFrame.getIndex(), 1);
            this.saveOpenedApps();
        }
        getFocusedApp() { return this.focusedApp; }
        getV() { return this.v }
    }
}