() => {
    return class auth {

        getDefaultSize() {
            return { width: 350, height: 136 }
        }
        getV() { return this.v }
        getTitle() { return 'Auth'; }
        async init() {

            if (this.v) this.v.clear();

            const v = await s.f('sys.ui.view');
            const http = new (await s.f('sys.httpClient'));

            let authPanel = new v({ class: ['authApp'] });
            if (this.v) authPanel = this.v;
            else {
                this.v = authPanel;
            }

            const container = new v;
            e('>', [container, authPanel]);

            const username = (await http.get('/sign/user'))?.data?.user?.username;

            if (username) {
                const sign = new v({ tagName: 'span', txt: `Logged in as: [${username}]`, });
                e('>', [sign, authPanel]);

                const signOut = new v({ txt: 'Sign Out', class: ['btn', 'inlineBlock', 'cursorPointer'] });
                signOut.on('click', async (e) => {
                    e.stopPropagation();
                    await http.post('/sign/out');
                    await this.init();
                });
                signOut.on('contextmenu', e => e.stopPropagation());
                e('>', [signOut, authPanel]);
            } else {

                const usernameInput = new v({ tagName: 'input' });
                usernameInput.setAttr('placeholder', 'username');
                usernameInput.on('pointerdown', e => {
                    e.stopPropagation();
                });
                e('>', [usernameInput, container]);

                e('>', [new v({ tagName: 'br' }), container]);

                const passwordInput = new v({ tagName: 'input' });
                passwordInput.setAttr('placeholder', 'password');
                passwordInput.setAttr('type', 'password');
                passwordInput.on('pointerdown', e => {
                    e.stopPropagation();
                });
                e('>', [passwordInput, container]);

                e('>', [new v({ tagName: 'br' }), container]);
                e('>', [new v({ tagName: 'br' }), container]);

                const signIn = new v({ txt: 'Sign In', class: ['btn', 'inlineBlock', 'cursorPointer'] });
                signIn.on('click', async e => {
                    e.stopPropagation();

                    const username = usernameInput.getVal().trim(); if (!username) return;
                    const password = passwordInput.getVal().trim(); if (!password) return;

                    const { data } = await http.post('/sign/in', { username, password });
                    if (data === 'ok') {
                        await this.init();
                    }
                });
                signIn.on('contextmenu', e => e.stopPropagation());
                e('>', [signIn, container]);
            }
        }
    }
}