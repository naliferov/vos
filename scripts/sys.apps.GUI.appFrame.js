() => {
    const appFrameProto = {

        getApp() { return this.app; },
        getAppPath() { return this.appPath; },
        getDataPath() { return this.dataPath; },
        getView() { return this.view; },

        setIndex(index) { this.index = index; },
        getIndex() { return this.index; },

        async init(appPath, dataNode, v) {

            this.view = new v({ class: 'appFrame' });
            this.view.setSize(500, 500);
            this.app = new (await s.f(appPath));
            this.appPath = appPath;

            const topBar = new v({ class: ['appTopBar'] });
            this.topBar = topBar;
            e('>', [topBar, this.view]);
            topBar.on('pointerdown', (e) => this.topBarDragAndDrop(e));

            const closeBtn = new v({ class: 'tabCloseBtn' });
            e('>', [closeBtn, topBar]);
            closeBtn.on('click', () => {
                this.view.remove();
                if (this.app.close) {
                    this.app.close();
                }
                s.e('appFrame.close', { appFrame: this });
            });

            //todo if not get title, use last part of appPath
            const title = new v({ txt: this.app.getTitle(), class: 'appTitle' });
            e('>', [title, topBar]);

            const content = new v({ class: 'appContent' });
            this.content = content;
            e('>', [content, this.view]);

            await this.app.init();
            e('>', [this.app.getV(), content]);

            const resizeTop = new v({ class: ['resizer', 'resizeTop'] });
            e('>', [resizeTop, this.view]);
            resizeTop.on('pointerdown', (e) => this.resizeTop(e, resizeTop));

            const nsResizeBottom = new v({ class: ['resizer', 'resizeBottom'] });
            e('>', [nsResizeBottom, this.view]);
            nsResizeBottom.on('pointerdown', (e) => this.resizeBottom(e));

            const nsResizeLeft = new v({ class: ['resizer', 'resizeLeft'] });
            e('>', [nsResizeLeft, this.view]);
            nsResizeLeft.on('pointerdown', (e) => this.resizeLeft(e));

            const resizeRight = new v({ class: ['resizer', 'resizeRight'] });
            e('>', [resizeRight, this.view]);
            resizeRight.on('pointerdown', (e) => this.resizeRight(e));

            const resizeTopLeft = new v({ class: ['resizer', 'resizeTopLeft'] });
            e('>', [resizeTopLeft, this.view]);
            resizeTopLeft.on('pointerdown', (e) => this.resizeTopLeft(e));

            const resizeTopRight = new v({ class: ['resizer', 'resizeTopRight'] });
            e('>', [resizeTopRight, this.view]);
            resizeTopRight.on('pointerdown', (e) => this.resizeTopRight(e));

            const resizeBottomLeft = new v({ class: ['resizer', 'resizeBottomLeft'] });
            e('>', [resizeBottomLeft, this.view]);
            resizeBottomLeft.on('pointerdown', (e) => this.resizeBottomLeft(e));

            const resizeBottomRight = new v({ class: ['resizer', 'resizeBottomRight'] });
            e('>', [resizeBottomRight, this.view]);
            resizeBottomRight.on('pointerdown', (e) => this.resizeBottomRight(e));
        },
        recalcDimensions() {
            const height = this.view.getSizes().height - this.topBar.getSizes().height;
            this.content.setSize(null, height);
        },
        setPosition(x, y) { this.view.setPosition(x, y); },
        setSize(width, height) { this.view.setSize(width, height); },
        getSizes() { return this.view.getSize(); },

        topBarDragAndDrop(e) {
            const viewSizes = this.view.getSizes();
            const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const x = e.clientX - shift.x;
                    const y = e.clientY - shift.y;
                    this.view.setPosition(x, y);
                    s.e('appFrame.changePosition', { appFrame: this, x, y });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeTop(e) {

            const sizes = this.view.getSizes();

            const maxY = sizes.y + sizes.height;
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const height = maxY - (e.clientY);
                    this.view.setSize(null, height);
                    this.view.setPosition(null, e.clientY);

                    this.recalcDimensions();
                    s.e('appFrame.changeSize', { appFrame: this, height });
                    s.e('appFrame.changePosition', { appFrame: this, y: e.clientY });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeBottom(e) {
            const sizes = this.view.getSizes();
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const height = e.clientY - sizes.y;
                    this.view.setSize(null, height);
                    this.recalcDimensions();
                    s.e('appFrame.changeSize', { appFrame: this, height });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeLeft(e) {
            const sizes = this.view.getSizes();
            const maxW = sizes.x + sizes.width;
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const width = maxW - e.clientX;
                    this.view.setSize(width);
                    this.view.setPosition(e.clientX);
                    this.recalcDimensions();
                    s.e('appFrame.changeSize', { appFrame: this, width });
                    s.e('appFrame.changePosition', { appFrame: this, x: e.clientX });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeRight(e) {
            const sizes = this.view.getSizes();
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const width = e.clientX - sizes.x;
                    this.view.setSize(width);
                    this.recalcDimensions();
                    s.e('appFrame.changeSize', { appFrame: this, width });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeTopLeft(e) {
            const sizes = this.view.getSizes();
            const maxW = sizes.x + sizes.width;
            const maxН = sizes.y + sizes.height;
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const height = maxН - e.clientY;
                    const width = maxW - e.clientX;
                    this.view.setSize(width, height);
                    this.view.setPosition(e.clientX, e.clientY);
                    this.recalcDimensions();

                    s.e('appFrame.changeSize', { appFrame: this, width, height });
                    s.e('appFrame.changePosition', { appFrame: this, x: e.clientX, y: e.clientY });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeTopRight(e) {
            const sizes = this.view.getSizes();
            const maxН = sizes.y + sizes.height;
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const height = maxН - e.clientY;
                    const width = e.clientX - sizes.x;
                    this.view.setSize(width, height);
                    this.view.setPosition(null, e.clientY);
                    this.recalcDimensions();

                    s.e('appFrame.changeSize', { appFrame: this, width, height });
                    s.e('appFrame.changePosition', { appFrame: this, y: e.clientY });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeBottomLeft(e) {
            const sizes = this.view.getSizes();
            const maxW = sizes.x + sizes.width;
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const width = maxW - e.clientX;
                    const height = e.clientY - sizes.y;

                    this.view.setSize(width, height);
                    this.view.setPosition(e.clientX);
                    this.recalcDimensions();
                    s.e('appFrame.changeSize', { appFrame: this, width, height });
                    s.e('appFrame.changePosition', { appFrame: this, x: e.clientX });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
        resizeBottomRight(e) {
            //const viewSizes = this.view.getSizes(); //sizes of nsBarTop
            //const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };

            const sizes = this.view.getSizes();
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const width = e.clientX - sizes.x;
                    const height = e.clientY - sizes.y;
                    this.view.setSize(width, height);
                    this.recalcDimensions();
                    s.e('appFrame.changeSize', { appFrame: this, width, height });
                },
                up: (e) => {
                    s.e('input.pointer.setHandlers', { move: null, up: null });
                    this.view.removeClass('drag');
                }
            });
        },
    }

    return appFrameProto;
}