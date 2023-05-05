async () => {
    return class LocalState {

        constructor() {
            const openedAppsJSON = localStorage.getItem('openedApps');
            this.openedApps = openedAppsJSON ? JSON.parse(openedAppsJSON) : {};
        }
        setOpenedApps(openedApps) {
            localStorage.setItem('openedApps', JSON.stringify(openedApps));
        }
        getOpenedApps() {
            const str = localStorage.getItem('openedApps');
            if (str) return JSON.parse(str);
            return [];
        }

        setActiveTabId(tabId) { localStorage.setItem('activeTabId', tabId); }
        getActiveTabId() { return localStorage.getItem('activeTabId'); }

        setOutlinerWidth(v) { localStorage.setItem('outlinerWidth', v); }
        getOutlinerWidth() { return localStorage.getItem('outlinerWidth'); }

        getLogPanelHeight() { return localStorage.getItem('logPanelHeight'); }
        setLogPanelHeight(v) { localStorage.setItem('logPanelHeight', v); }

        get(k) { return localStorage.getItem(k); }
        set(k, v) { localStorage.setItem(k, v); }
        del(k) { localStorage.removeItem(k); }
    }

}