async update => {

    const sys = s.sys;
    if (!sys) return;

    const updateIds = sys.netUpdateIds;
    const del = id => setTimeout(() => updateIds.delete(id), 20000);

    let updateId = update.updateId;
    if (updateId) {
        updateIds.set(updateId, 1);
        s.l(`Update received. [${updateId}]`);
        del(updateId);
    } else {
        const newUpdateId = s.f('sys.uuid');
        updateIds.set(newUpdateId, 1);
        update.updateId = newUpdateId;
        del(newUpdateId);
    }

    const secretsNetNodes = (await sys.getSecrets()).netNodes;

    for (let nodeName in s.net) {

        const node = s.net[nodeName];
        if (!node.isActive || nodeName === sys.netId) {
            s.l(`netNode skip [${nodeName}]`); continue;
        }
        try {
            const url = node.host ? 'https://' + node.host : 'http://' + node.ip;
            const http = new (await s.f('sys.httpClient'));
            const token = secretsNetNodes[nodeName];

            const r = await http.post(url + '/stateUpdate', update, { cookie: `netToken=${token}` });
            s.l(`netNode update [${nodeName}]`, 'resp:', r.data);
        } catch (e) {
            s.l(`error making update of node`,);
        }
    }
}