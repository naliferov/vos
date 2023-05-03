async state => {

        const t = s.sys.token;
        for (let k in s) if (!state[k]) delete s[k];
        for (let k in state) s[k] = state[k];
        s.sys.token = t;

        s.def('loadStateDone', 1);
        s.l('setUpdate', 'setForUpdate: ', Object.keys(state).length, 'set: ', Object.keys(s).length);
    }