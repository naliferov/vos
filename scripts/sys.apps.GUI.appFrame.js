() => {
    const appFrameProto = {

        getApp() { return this.app; },
        getAppPath() { return this.appPath; },
        getView() { return this.view; },
        getId() { return this.id; },

        async init(appPath, dataNode, v) {

            this.id = await s.f('sys.uuid');

            this.view = new v({ class: 'appFrame' });
            this.view.setSize(500, 500);
            this.app = new (s.f(appPath));
            this.appPath = appPath;

            const topBar = new v({ class: ['appTopBar'] });
            this.topBar = topBar;
            e('>', [topBar, this.view]);
            topBar.on('pointerdown', (e) => this.topBarDragAndDrop(e));

            const closeBtn = new v({ class: 'tabCloseBtn' });
            e('>', [closeBtn, topBar]);
            closeBtn.on('click', () => {
                this.app.close();
                this.view.remove();
            });

            const title = new v({ txt: this.app.getTitle(), class: 'appTitle' });
            e('>', [title, topBar]);

            const content = new v({ class: 'appContent' });
            this.content = content;
            e('>', [content, this.view]);

            await this.app.init();
            e('>', [this.app.getV(), content]);

            const resizeTop = new v({ class: 'resizeTop' });
            e('>', [resizeTop, this.view]);
            resizeTop.on('pointerdown', (e) => this.resizeTop(e));

            const nsResizeBottom = new v({ class: 'resizeBottom' });
            e('>', [nsResizeBottom, this.view]);
            nsResizeBottom.on('pointerdown', (e) => this.resizeBottom(e));

            const nsResizeLeft = new v({ class: 'resizeLeft' });
            e('>', [nsResizeLeft, this.view]);
            nsResizeLeft.on('pointerdown', (e) => this.resizeLeft(e));

            const resizeRight = new v({ class: 'resizeRight' });
            e('>', [resizeRight, this.view]);
            resizeRight.on('pointerdown', (e) => this.resizeRight(e));


            //const resizeLeftTop = new v({ class: 'resizeRight' });
            //e('>', [resizeRight, this.view]);
            //resizeRight.on('pointerdown', (e) => this.resizeRight(e));

            //open iframe, if need run app in iframe or separate proc
        },
        recalcDimensions() {
            const height = this.view.size().height - this.topBar.size().height;
            this.content.setSize(null, height);
        },
        setPosition(x, y) { this.view.setPosition(x, y); },
        setSize(width, height) { this.view.setSize(width, height); },

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
            //const viewSizes = this.view.getSizes(); //sizes of nsBarTop
            //const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };

            const sizes = this.view.getSizes();
            const maxY = sizes.y + sizes.height;
            this.view.addClass('drag');

            s.e('input.pointer.setHandlers', {
                move: e => {
                    const height = maxY - e.clientY;
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
            //const viewSizes = this.view.getSizes(); //sizes of nsBarTop
            //const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };

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
            //const viewSizes = this.view.getSizes(); //sizes of nsBarTop
            //const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };

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
            //const viewSizes = this.view.getSizes(); //sizes of nsBarTop
            //const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };

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
    }

    return appFrameProto;
}