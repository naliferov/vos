() => {
    return class AppsManager {

        async init(uiContainer) {

            this.uiContainer = uiContainer;
            this.appsFrames = new Map;
            this.appsOpened = {};

            const appsOpened = s.e('localState.get', 'appsOpened');
            if (appsOpened) this.appsOpened = JSON.parse(appsOpened);

            for (let appPath in this.appsOpened) {
                const { dataPath, position, size } = this.appsOpened[appPath];

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
                if (position) appFrame.setPosition(position.x, position.y);
                if (size) appFrame.setSize(size.width, size.height);
                appFrame.recalcDimensions();
            }
        }
        async inputEvent(t, e) {
            if (this.focusedAppFrame) {
                if (t === 'click') {
                    this.focusedAppFrame.getApp().handleClick(e);
                }
            }
            // input.onKeyDown(async (e) => await outliner.handleKeyDown(e));
            // input.onKeyUp(async (e) => await outliner.handleKeyUp(e));
            // input.onClick(async (e) => await outliner.handleClick(e));
            // input.onDblClick(async (e) => await outliner.handleDblClick(e));
            // input.onContextMenu(e => outliner.handleContextMenu(e));
        }

        async appFrameChangePosition(appFrame, x, y) {

            const appFrameData = this.appsOpened[appFrame.getAppPath()];
            if (!appFrameData) return;

            appFrameData.position ??= {};
            if (x) appFrameData.position.x = x;
            if (y) appFrameData.position.y = y;
            this.saveAppsOpened();
        }
        async appFrameChangeSize(appFrame, width, height) {

            const appFrameData = this.appsOpened[appFrame.getAppPath()];
            if (!appFrameData) return;

            appFrameData.size ??= {};
            if (width) appFrameData.size.width = width;
            if (height) appFrameData.size.height = height;
            this.saveAppsOpened();
        }

        async openApp(appPath, dataNode, addToLocalState) {

            const v = await s.f('sys.ui.view');
            //this can be cached with subscription on change, change protos in real time
            const appFrame = Object.create(s.f('sys.apps.GUI.appFrame'));
            await appFrame.init(appPath, dataNode, v);
            e('>', [appFrame.getView(), this.uiContainer]);

            appFrame.getView().on('click', (e) => {
                this.focusAppFrame(appFrame);
            });
            this.appsFrames.set(appFrame.getId(), appFrame);

            if (addToLocalState) {
                this.appsOpened[appPath] = { dataPath: dataNode ? dataNode.getPath() : null };
                this.saveAppsOpened();
            }
            appFrame.recalcDimensions();

            return appFrame;
        }
        saveAppsOpened() {
            s.e('localState.set', ['appsOpened', JSON.stringify(this.appsOpened)]);
        }
        resize() {
            //if (!this.focusedApp) return;
            //const {width, height} = e('getDimensionsForAppContainer');
            //this.focusedApp.setWidth(width);
            //this.focusedApp.setHeight(height);
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
        closeApp() {
            //this.appsContainers.delete(appContainer.getId());
            //appFrame.close();
            //removeFrom local storage

            //this.openedApps.splice(tabIndex, 1);
            //todo switch to closest opened tab
        }
        getFocusedApp() { return this.focusedApp; }
        getV() { return this.v }
    }
}