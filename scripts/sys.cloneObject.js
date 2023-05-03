obj => {

    if (Array.isArray(obj)) {
        let array = [];
        for (let i = 0; i < obj.length; i++) {

            const v = obj[i];
            const t = typeof v;

            if (t === 'function') continue;
            if (t === 'object' && v !== null) {
                array.push(cloneObject(v));
            } else {
                array.push(v);
            }
        }
        return array;
    }

    let clone = {};
    for (let k in obj) {
        const v = obj[k];
        const t = typeof v;
        if (t === 'function') continue;
        clone[k] = (t === 'object' && v !== null) ? cloneObject(v) : v;
    }
    return clone
}