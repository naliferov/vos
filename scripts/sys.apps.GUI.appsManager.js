async () => {
    return class AppsManager {

        async init(localState) {
            const v = await s.f('sys.ui.view');
            this.v = new v({class: 'appsManager'});

            this.tabs = new v({class: 'tabs'});
            e('>', [this.tabs, this.v]);

            this.tabsContentBlock = new v({class: 'tabsContent'});
            e('>', [this.tabsContentBlock, this.v]);

            this.appsContainers = new Map;
            this.localState = localState;


            const DataNode = await s.f('sys.apps.GUI.dataNode');

            this.openedApps = this.localState.getOpenedApps();
            for (let i = 0; i < this.openedApps.length; i++) {
                const [appPath, dataPath] = this.openedApps[i];

                const node = s.find(dataPath);
                if (!node) {
                    //todo delete from localState
                    continue;
                }
                const dataNode = new DataNode(node);
                dataNode.setPath(dataPath);

                await this.openApp(appPath, dataNode, false);
            }
        }
        getTabsHeight() { return this.tabs.getSizes().height; }

        //getTabByContextNode(node) { return this.tabs.get(node.get('id')); }
        async openApp(appPath, dataNode, addToLocalState = true) {

            if (this.focusedApp) {
                this.focusedApp.deactivate();
            }

            const v = await s.f('sys.ui.view');
            const tabClass = await s.f('sys.apps.GUI.tab');

            //todo check if app is available right now
            const app = new (await s.f(appPath))(dataNode, v);
            const appContainerClass = await s.f('sys.apps.GUI.appContainer');
            const appContainer = new appContainerClass(app, appPath, dataNode, tabClass, v);
            this.focusedApp = appContainer;

            appContainer.onClick(e => {
                this.focusApp(appContainer);
                this.updateFocusedAppContainerDimensions();
            });
            appContainer.onClickClose((e, tabIndex) => {
                e.stopPropagation();
                this.closeApp(appContainer, tabIndex);
            });
            e('>', [appContainer.getTab().getV(), this.tabs]);
            e('>', [appContainer.getV(), this.tabsContentBlock]);
            appContainer.activate();

            this.appsContainers.set(appContainer.getId(), appContainer);

            //todo escape dot symbols or just use path as array
            if (addToLocalState) {
                this.openedApps.push([ appPath, dataNode.getPath() ]);
                this.localState.setOpenedApps(this.openedApps);
            }
        }

        updateFocusedAppContainerDimensions() {
            if (!this.focusedApp) return;
            const {width, height} = e('getDimensionsForAppContainer');
            this.focusedApp.setWidth(width);
            this.focusedApp.setHeight(height);
        }

        focusApp(appContainer) {

            //const nodeId = node.get('id');
            //const app = this.apps.get(appId);
            //if (!appId) { console.log('tabId not found', nodeId); return; }

            if (this.focusedApp) {
                //todo
                // if (this.activeTab.getContextNodeId() === tab.getContextNodeId()) {
                //     return;
                // }
                this.focusedApp.deactivate();
            }
            this.focusedApp = appContainer;
            appContainer.activate();

            //this.localState.s(appContainer.getId());
        }

        closeApp(appContainer, tabIndex) {

            //const isActiveTab = this.activeTab && this.activeTab.getContextNodeId() === contextUnitId;
            // if (isActiveTab) {
            //     for (let [_, tab] of this.tabs) {
            //         if (tab.getContextNodeId() === contextUnitId) continue;
            //         this.focusTab(tab.getContextNode());
            //         break;
            //     }
            // }
            this.appsContainers.delete(appContainer.getId());
            appContainer.close();

            if (tabIndex !== undefined) {
                this.openedApps.splice(tabIndex, 1);
                this.localState.setOpenedApps(this.openedApps);
            }
            //todo switch to closest opened tab
        }

        async onKeyDown(e) {
            // if (this.activeTab && this.activeTab.getApp().onKeyDown) {
            //     this.activeTab.getEditor().onKeyDown(e);
            // }
        }
        async onClick(e) {
            // if (this.activeTab && this.activeTab.getEditor().onClick) {
            //     this.activeTab.getEditor().onClick(e);
            // }
        }
        getFocusedApp() { return this.focusedApp; }
        getV() { return this.v }
        setHeight(height) {
            const tabsHeight = this.tabs.getSizes().height;
            if (this.focusedApp) {
                this.focusedApp.setHeight(height - tabsHeight);
            }
        }
        setWidth(width) {
            //this.getV().setStyles({height: height + 'px'});
            if (this.focusedApp) this.focusedApp.setWidth(width);
        }
    }
}