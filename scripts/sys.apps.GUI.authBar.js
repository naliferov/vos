() => {

    return class AuthBar {

        init(v, http) {
            const authPanel = new v({class: ['flex', 'authPanel']});

            const tokenInput = new v({tagName: 'input', txt: 'clear', class: ['tokenInput']});
            tokenInput.setAttr('placeholder', 'token');
            tokenInput.setAttr('type', 'password');
            e('>', [tokenInput, authPanel]);
            tokenInput.on('pointerdown', e => {
                e.stopPropagation();
            });
            const signIn = new v({txt: 'Sign In', class: ['btn', 'cursorPointer']});
            signIn.on('click', async e => {
                e.stopPropagation();
                const token = tokenInput.getVal().trim();
                if (!token) return;
                const r = await http.post('/sign/in', {token: token});
                s.l(r);
            });
            signIn.on('contextmenu', e => e.stopPropagation());
            e('>', [signIn, authPanel]);

            const signOut = new v({txt: 'Sign Out', class: ['btn', 'cursorPointer']});
            signOut.on('click', e => {
                e.stopPropagation();
                http.post('/sign/out');
            });
            signOut.on('contextmenu', e => e.stopPropagation());
            e('>', [signOut, authPanel]);

            this.v = authPanel;
        }
        
        getV() { return this.v }
        getKeyValue() { return this.keyV.getTxt(); }
        getHeight() { return this.v.getSizes().height; }


        getNodesV() { return this.subNodesV }
        removeSubNodesShift() { this.subNodesV.removeClass('shift'); }
        focus() { this.keyV.focus(); }
        remove() { this.getV().removeFromDom(); }
    }
}