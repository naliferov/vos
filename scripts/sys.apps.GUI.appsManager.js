() => {
    return class AppsManager {

        async init(uiContainer) {

            this.uiContainer = uiContainer;
            this.openedApps = [];

            let openedApps = s.e('localState.get', 'openedApps');
            if (!openedApps) return;
            openedApps = JSON.parse(openedApps);

            if (!Array.isArray(openedApps)) {
                openedApps = [];
            }

            for (let i = 0; i < openedApps.length; i++) {

                const { appPath, dataPath, dimensions } = openedApps[i];

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

            if (t === 'click') app.handleClick(e);
            if (t === 'contextmenu') app.handleContextMenu(e);
            if (t === 'keydown' && app.handleKeydown) app.handleKeydown(e);
            if (t === 'keyup' && app.handleKeyup) app.handleKeyup(e);

            // input.onKeyDown(async (e) => await outliner.handleKeyDown(e));
            // input.onKeyUp(async (e) => await outliner.handleKeyUp(e));
            // input.onClick(async (e) => await outliner.handleClick(e));
            // input.onDblClick(async (e) => await outliner.handleDblClick(e));
            // input.onContextMenu(e => outliner.handleContextMenu(e));
        }

        async appFrameChangePosition(appFrame, x, y) {

            // const appFrameData = this.openedApps[appFrame.getIndex()];

            // if (x) appFrameData.dimensions.x = x;
            // if (y) appFrameData.dimensions.y = y;
            this.saveOpenedApps();
        }
        async appFrameChangeSize(appFrame, width, height) {

            // const appFrameData = this.openedApps[appFrame.getIndex()];

            // if (width) appFrameData.dimensions.width = width;
            // if (height) appFrameData.dimensions.height = height;
            this.saveOpenedApps();
        }

        async openApp(appPath, dataNode, addToLocalState) {

            const v = await s.f('sys.ui.view');
            //this can be cached with subscription on change, change protos in real time

            const appFrame = Object.create(s.f('sys.apps.GUI.appFrame'));
            await appFrame.init(appPath, dataNode, v);
            appFrame.setIndex(this.openedApps.length);

            e('>', [appFrame.getView(), this.uiContainer]);

            appFrame.getView().on('click', (e) => {
                this.focusAppFrame(appFrame);
            });
            this.openedApps.push(appFrame);

            if (addToLocalState) this.saveOpenedApps();
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