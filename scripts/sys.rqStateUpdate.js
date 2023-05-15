async (rq, rs) => {
    let { token } = s.sys.rqGetCookies(rq);
    if (!token) {
        rs.writeHead(403).end('Access denied. userToken not found.'); return;
    }
    if (!s.sys.token) {
        rs.writeHead(500).end('sys.token is not defined.'); return;
    }

    const loadFromDisk = async path => {
        const isUserSpaceUpdate = path[0] === 'users' && path[1] && path[1].length > 0;
        let username = path[1];

        if (isUserSpaceUpdate && !s.users[username]) {

            const dir = `state/users`;
            await s.fs.mkDirIfNotExists(dir);
            const userFile = `${dir}/${username}.json`;
            if (await s.fsAccess(userFile)) {
                const user = await s.nodeFS.readFile(userFile, 'utf8');
                s.users[username] = JSON.parse(user);
            }
        }
    }
    const loadUserByUsername = async userName => {

        if (!s.users[userName]) {
            const dir = `state/users`;

            await s.fs.mkDirIfNotExists(dir);
            const userFile = `${dir}/${userName}.json`;
            if (await s.fsAccess(userFile)) {
                const user = await s.nodeFS.readFile(userFile, 'utf8');
                s.users[userName] = JSON.parse(user);
            } else {
                s.users[userName] = {};
            }
        }
    }
    //todo load path from disc and put to s
    const saveToDisk = async path => {
        const isUserSpaceUpdate = path[0] === 'users' && path[1] && path[1].length > 0;
        let username = path[1];
        const usersDir = `state/users`;

        if (isUserSpaceUpdate) {
            //todo username can be to long or contain invalid symbols as filename
            const path = `${usersDir}/${username}.json`;
            s.l('dump: ' + path);
            await s.nodeFS.writeFile(path, JSON.stringify(s.users[username]));
        }
    }
    //todo instead of this use s.findParentAndK
    const getParentNodeAndKey = path => {
        let node, k;
        if (path.length === 1) {
            node = s;
            k = path[0];
        } else {
            node = s.find(path.slice(0, -1));
            k = path.at(-1);
        }
        if (!node || !k) { //todo return error instead of using rs
            rs.s(`node not found or path is invalid [${path}]`); return {};
        }
        return { node, k };
    }
    const updateNode = (path, v) => {
        const { node, k } = getParentNodeAndKey(path);
        if (!node || !k) return;

        //todo check operation for Array
        if (k === 'js') {
            eval(v); //use parser or lister for check syntax
            delete node[s.sys.SYMBOL_FN];
        }
        node[k] = v;
    }
    const cp = (oldPath, newPath) => {
        const { node, k } = getParentNodeAndKey(oldPath);
        if (!node || !k) {
            s.l(`No node or k. oldPath [${oldPath}]`)
            return;
        }
        let parentNodeAndKey = getParentNodeAndKey(newPath);
        let node2 = parentNodeAndKey.node;
        let k2 = parentNodeAndKey.k;
        if (!node2 || !k2) {
            s.l(`No node2 or k2. newPath [${newPath}]`)
            return;
        }
        node2[k2] = node[k];
        return { node, k };
    }
    const rm = path => {
        const { node, k } = getParentNodeAndKey(path);
        if (!node || !k) return;
        delete node[k];
        if (k === 'js') delete node[s.sys.SYMBOL_FN];
    }
    const checkSpaceLimit = (path, v, op) => {

        if (op === 'cp') {
            //todo pass here oldPath, newPath
            //todo cp can make circular references, so need processing of circular references
        } else if (op === 'up') {
            const { node, k } = getParentNodeAndKey(path);
            if (!node || !k) return;

            const nodeClone = structuredClone(node);
            nodeClone[k] = v;
            const bytes = Buffer.byteLength(JSON.stringify(nodeClone));
            const oneMB = 1 * 1024 * 1024;
            if (bytes > oneMB) return false;
        }
        return true;
    }

    const isSysToken = s.sys.token === token;
    const { users } = await s.sys.getSecrets();
    let userName = users[token];

    if (userName) await loadUserByUsername(userName);

    if (!isSysToken && !userName) {
        rs.writeHead(403).end('Sys token or user not found.');
        return;
    }

    const { cmds, updateId } = await s.sys.rqParseBody(rq);

    if (updateId && s.sys.netUpdateIds.get(updateId)) {
        s.l(`Update already received before. [${updateId}]`);
        return;
    }
    if (!cmds || !Array.isArray(cmds)) {
        rs.s(`cmds is not valid ${cmds}`);
        return;
    }

    const user = s.users[userName];

    const processCmd = async (update) => {
        if (!s.f('sys.isObject', update)) {
            rs.s(`cmd is not valid ${update}.`);
            return;
        }
        const { path, oldPath, newPath, v, op } = update;

        //validate pathes, or oldPath, newPath

        let result = isSysToken;
        if (!result) {
            if (oldPath && newPath) {
                const checkA = await s.f('sys.checkUpdatePermission', oldPath, userName, user);
                const checkB = await s.f('sys.checkUpdatePermission', newPath, userName, user);
                if (checkA !== true || checkB !== true) {
                    rs.writeHead(403).end(`Access denied. ${checkA}`);
                    return;
                }
                result = true;
            } else {
                result = await s.f('sys.checkUpdatePermission', path, userName, user);
            }
        }
        if (result !== true) {
            rs.writeHead(403).end(`Access denied. ${result}`);
            return;
        }

        //todo get path from disc if exists. check size of memory
        if (path) {
            //await loadFromDisk(path);
        } else if (newPath && oldPath) {
            await loadFromDisk(oldPath);
            await loadFromDisk(newPath);
        }
        if (!checkSpaceLimit(path, v, op)) {
            rs.writeHead(403).end(`Space limit reached.`);
            return;
        }
        //todo case with long arrays can be really slow, so need to make limits
        //todo case if it MAP or SET
        if (op === 'rm') {
            rm(path);
        } else if (op === 'cp') {
            //todo cp can make circular references, so need processing of circular references
            //cp(oldPath, newPath);
        } else if (op === 'mv') {
            //todo prevent mv of array keys
            const { node, k } = cp(oldPath, newPath);
            delete node[k];
        } else if (op === 'set' || op === 'up') {
            updateNode(path, v);
        }

        if (path) {
            await saveToDisk(path);
        } else if (newPath && oldPath) {
            //await saveToDisk(oldPath); //todo if second and third is different it's transfer from different users or spaces
            await saveToDisk(newPath);
        }
        return true;
    }

    for (let i = 0; i < cmds.length; i++) {
        const result = await processCmd(cmds[i]);
        if (result !== true) return;
    }
    rs.s('ok');
    await s.f('sys.netUpdate', { cmds, updateId }, token, true);
}