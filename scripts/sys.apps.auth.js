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

            const userName = (await http.get('/sign/user'))?.data?.user?.userName;
            if (userName) {
                const sign = new v({ tagName: 'span', txt: `Logged in as: [${userName}]`, });
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
                const tokenInput = new v({ tagName: 'input', txt: 'clear', class: ['tokenInput'] });
                tokenInput.setAttr('placeholder', 'user token');
                tokenInput.setAttr('type', 'password');
                tokenInput.on('pointerdown', e => {
                    e.stopPropagation();
                });
                e('>', [tokenInput, authPanel]);

                const signIn = new v({ txt: 'Sign In', class: ['btn', 'inlineBlock', 'cursorPointer'] });
                signIn.on('click', async e => {
                    e.stopPropagation();
                    const token = tokenInput.getVal().trim();
                    if (!token) return;
                    const r = await http.post('/sign/in', { token });
                    await this.init();
                });
                signIn.on('contextmenu', e => e.stopPropagation());
                e('>', [signIn, authPanel]);
            }
        }
    }
}