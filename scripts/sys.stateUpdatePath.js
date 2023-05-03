(path, state) => {
        const currentState = s.find(path);
        for (let k in currentState) {
            if (!state[k]) delete currentState[k];
        }
        //delete what not exists in state
        s.merge(currentState, state);
        s.l('setUpdate', path, Object.keys(state).length);
    }