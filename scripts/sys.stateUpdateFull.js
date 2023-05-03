async state => {
        for (let k in s) if (!state[k]) delete s[k];
        s.merge(s, state);
        s.l('setUpdate', 'setForUpdate: ', Object.keys(state).length);
    }