async () => {
    return class AppContainer {

        constructor(app, appPath, dataNode, TabClass, viewClass) {
            this.id = s.f('sys.uuid');
            this.app = app;
            this.appPath = appPath;
            this.dataNode = dataNode;

            this.v = new viewClass({id: this.id, class: ['appContainer']});
            e('>', [app.getV(), this.v]);

            let tabName = this.dataNode.getPath().split('.').slice(-2);
            this.tab = new TabClass(this.id, tabName.join('.'));
        }

        getId() { return this.id; }
        getV() { return this.v; }

        // getApp() { return this.app; }
        // getAppPath() { return this.appPath; }
        getDataNode() { return this.dataNode; }
        getTab() { return this.tab; }

        hightLightErr() { this.tab.hightLightErr(); }
        unHightlightErr() { this.tab.unHightlightErr(); }

        activate() {
            this.v.show();
            this.tab.activate();
            this.app.activate();
        }
        deactivate() {
            this.v.hide();
            this.tab.deactivate();
            this.app.deactivate();
        }

        setWidth(width) { this.v.setStyles({width: width + 'px'}); }
        setHeight(height) { this.v.setStyles({height: height + 'px'}); }

        onClick(fn) { this.tab.onTabClick(fn); }
        onClickClose(fn) { this.tab.onTabCloseClick(fn); }
        close() {
            this.tab.close();
            this.app.close();
        }
    }
}