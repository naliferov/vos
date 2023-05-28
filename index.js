(async () => {
    globalThis.s ??= {};
    s.net ??= {}; s.space ??= {}; s.sys ??= {}; s.users ??= {};
    const sys = s.sys;

    sys.SYMBOL_FN ??= Symbol('fn');
    sys.SYMBOL_IS_EMPTY_NODE ??= Symbol('isEmptyNode');

    Object.defineProperty(s, 'def', {
        writable: true, configurable: true, enumerable: false,
        value: (k, v) => Object.defineProperty(s, k, { writable: true, configurable: true, enumerable: false, value: v })
    });
    Object.defineProperty(s, 'defObjectProp', {
        writable: true, configurable: true, enumerable: false,
        value: (o, k, v) => Object.defineProperty(o, k, { writable: true, configurable: true, enumerable: false, value: v })
    });
    s.def('l', console.log);
    s.def('find', id => s.findByArray(Array.isArray(id) ? id : id.split('.')));
    s.def('findByArray', id => {
        let node = s;
        for (let i = 0; i < id.length; i++) {
            if (typeof node !== 'object' || node === null) {
                console.log(`node not found by id [${id}]`);
                return;
            }
            node = node[id[i]];
        }
        return node;
    });
    s.def('findParentAndK', id => {
        return {
            parent: id.length === 1 ? s : s.find(id.slice(0, -1)),
            k: id.at(-1)
        };
    });
    s.def('makePath', id => {
        const path = Array.isArray(id) ? id : id.split('.');
        let node = s;

        for (let i = 0; i < path.length; i++) {
            const k = path[i];
            if (typeof node[k] !== 'object' || node[k] === null) {
                node[k] = {};
            }
            node = node[k];
        }
        return node;
    });
    s.def('f', (id, ...args) => {
        try {
            let node = s.find(id);
            if (!node || !node.js) {
                console.log(`js not found by id [${id}]`);
                return;
            }
            if (!node[s.sys.SYMBOL_FN]) {
                node[s.sys.SYMBOL_FN] = eval(node.js);
            }
            return node[s.sys.SYMBOL_FN](...args);
        } catch (e) {
            console.error(id, e);
        }
    });
    s.def('merge', (o1, o2) => {

        for (let k in o2) {
            const v1 = o1[k];
            const v2 = o2[k];

            if (typeof v1 === 'object' && typeof v2 === 'object') {

                if (Array.isArray(v1) && Array.isArray(v2)) {
                    o1[k] = o2[k];
                    continue;
                }
                if (v1 === null || v2 === null) {
                    o1[k] = o2[k];
                    continue;
                }
                s.merge(v1, v2);
                continue;
            }
            o1[k] = o2[k];
        }
    });

    if (typeof window !== 'undefined') {

        const sysState = await (await fetch('/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: ['sys'] }),
        })).json();
        s.merge(s.sys, sysState);

        s.sys.proxyS = {};
        globalThis.s = new Proxy(s, s.sys.proxyS);

        (new (await s.f('sys.apps.GUI'))).start();
        return;
    }

    s.def('process', (await import('node:process')).default);
    s.def('processStop', () => { s.l('stop process ', s.process.pid); s.process.exit(0); });
    //s.def('processRestart', () => { s.l('stop process ', s.process.pid); s.process.exit(0); });
    s.def('nodeFS', (await import('node:fs')).promises);
    s.def('fsAccess', async path => {
        try { await s.nodeFS.access(path); return true; }
        catch { return false; }
    });

    //todo need to behave with state/secrets as regular namespace. and for update state/secrets use name mechnism as for other namespace
    //but with incresed level of security
    const secretsFName = 'state/secrets.json';
    if (!await s.fsAccess(secretsFName)) {
        await s.nodeFS.writeFile(secretsFName, JSON.stringify({ netNodes: {}, users: {} }));
    }
    s.sys.getSecrets = async () => JSON.parse(await s.nodeFS.readFile(secretsFName, 'utf8'));
    if (!s.secrets) s.def('secrets', await s.sys.getSecrets());

    const netIdFName = 'state/netId.txt';
    if (!sys.netId && await s.fsAccess(netIdFName)) { //watcher, controll of watchers

        const netId = (await s.nodeFS.readFile(netIdFName, 'utf8')).trim();
        s.defObjectProp(sys, 'netId', netId);

        const netNodesSecrets = s.secrets.netNodes;
        if (sys.netId) {
            s.defObjectProp(s.sys, 'token', netNodesSecrets[sys.netId]);
        }
    }

    if (!sys.netUpdateIds) s.defObjectProp(sys, 'netUpdateIds', new Map);
    if (!s.loop) {
        s.def('loop', {
            file: 'index.js',
            delay: 2000,
            isWorking: false,
            start: async function () { //connect this to UI btn and API call
                this.isWorking = true;
                while (1) {
                    await new Promise(r => setTimeout(r, this.delay));
                    try {
                        if (!this.isWorking) break;
                        const js = await s.nodeFS.readFile(this.file, 'utf8');
                        eval(js);
                        s.def('js', js);
                    }
                    catch (e) { console.log(e); }
                }
            },
            stop: function () { //connect this to UI btn and API call
                this.isWorking = false;
            },
        });
        s.process.on('uncaughtException', e => console.log('[[uncaughtException]]', e.stack));
    }
    if (!s.loop.isWorking) s.loop.start();

    if (s.sys.logger) {
        s.def('http', new (await s.f('sys.httpClient')));
        s.def('log', new (await s.f('sys.logger')));
        s.def('fs', new (await s.f('sys.fs'))(s.log));
        s.def('os', await s.f('sys.os'));
    }

    if (s.onceDB === undefined) s.def('onceDB', 0);
    s.def('once', id => {
        if (s.onceDB !== id) {
            s.onceDB = id;
            return true;
        }
        return false;
    });

    //todo add this to sys
    s.def('serialize', (object, path = '') => {
        const dump = {};
        for (let k in object) {
            if (k === 'undefined') continue;

            const v = object[k];
            const t = typeof v;

            if (t === 'function') {
                dump[k] = { js: v.toString() };
            } else if (t === 'boolean' || t === 'string' || t === 'number') {
                dump[k] = v;
            } else if (t === 'object') {
                if (v === null || Array.isArray(v)) {
                    dump[k] = v;
                } else {
                    dump[k] = s.createObjectDump(v, path + '.' + k);
                }
            }
            else if (t === 'symbol' || t === 'undefined') { }
            else {
                s.l('unknown object type', path, t, v);
            }
        }
        return dump;
    });
    s.def('copyToDisc', async (path, v = null) => {

        let pathArr = path;
        if (!Array.isArray(pathArr)) {
            pathArr = pathArr.split('.');
        }
        const dir = `state/${pathArr.slice(0, -1).join('/')}`;
        const file = `${dir}/${pathArr.at(-1)}.json`;

        if (await s.fsAccess(dir)) {
            if (!v) v = s.find(pathArr);
            await s.nodeFS.writeFile(file, JSON.stringify(v));
        }
    });
    s.def('copyStateToDisc', () => {
        if (s.dumping) return;
        s.def('dumping', setTimeout(async () => {
            s.l('<< memory dump', new Date);

            const paths = ['sys']; //'net',
            for (let i = 0; i < paths.length; i++) await s.copyToDisc(paths[i]);
            //secrets.json
            s.l('>> dump created');
            s.dumping = 0;
        }, 1000));
    });
    s.def('syncJsScripts', async (node, path) => {

        const isScriptsDirExists = await s.fsAccess('scripts');
        if (!isScriptsDirExists) return;

        const iterate = async (obj, kPath = '') => {

            if (Array.isArray(obj)) return;
            for (let k in obj) {

                const v = obj[k]; const vType = typeof v;
                if (vType === 'object') {
                    await iterate(v, kPath ? (kPath + '.' + k) : k);

                } else if (vType === 'string' && k === 'js' && v) {

                    if (kPath) await s.nodeFS.writeFile(`scripts/${kPath}.js`, v);
                }
            }
        }
        await iterate(node, path);

        const list = await s.nodeFS.readdir('scripts');
        for (let i = 0; i < list.length; i++) {
            const file = list[i];
            const id = file.slice(0, -3);
            const node = s.find(id);
            if (!node) {
                s.l('delete', id);
                //await s.nodeFS.unlink();
            }
        }
    });
    s.sys.stateUpdatePath = (path, state) => {
        const currentState = s.find(path);
        for (let k in currentState) {
            if (!state[k]) delete currentState[k];
        }
        //delete what not exists in state
        s.merge(currentState, state);
        s.l('setUpdate', path, Object.keys(state).length);
    }
    if (!s.connectedSSERequests) s.def('connectedSSERequests', new Map);

    s.sys.rqParseBody = async (rq, limitMb = 12) => {

        let limit = limitMb * 1024 * 1024;
        return new Promise((resolve, reject) => {
            let b = [];
            let len = 0;

            rq.on('data', chunk => {
                len += chunk.length;
                if (len > limit) {
                    rq.destroy();
                    resolve({ err: `limit reached [${limitMb}mb]` });
                    return;
                }
                b.push(chunk);
            });
            rq.on('error', err => reject(err));
            rq.on('end', () => {
                b = Buffer.concat(b);

                if (rq.headers['content-type'] === 'application/json') {
                    try { b = JSON.parse(b.toString()); }
                    catch (e) { b = { err: 'json parse error' }; }
                }
                resolve(b);
            });
        });
    }
    s.sys.rqParseQuery = (rq) => {
        const query = {};
        const url = new URL('http://t.c' + rq.url);
        url.searchParams.forEach((v, k) => {
            query[k] = v
        });
        return query;
    }
    s.sys.rqResolveStatic = async (rq, rs) => {

        const lastPart = rq.pathname.split('/').pop();
        const split = lastPart.split('.');
        if (split.length < 2) return false;

        const extension = split[split.length - 1]; if (!extension) return;
        try {
            const file = await s.nodeFS.readFile('.' + rq.pathname);
            const m = { html: 'text/html', js: 'text/javascript', css: 'text/css', map: 'application/json', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf' };
            if (m[extension]) rs.setHeader('Content-Type', m[extension]);

            rs.end(file);
            return true;
        } catch (e) {
            if (s.log) s.log.info(e.toString(), { path: e.path, syscall: e.syscall });
            else console.log(e);
            return false;
        }
    }
    s.sys.rqGetCookies = rq => {

        const header = rq.headers.cookie;
        if (!header || header.length < 1) {
            return {};
        }

        const cookies = header.split('; ');
        const result = {};
        for (let i in cookies) {

            const cookie = cookies[i].trim();
            const index = cookie.indexOf('=');
            if (index === -1) continue;

            const k = cookie.slice(0, index);
            const v = cookie.slice(index + 1);

            if (!k || !v) continue;

            result[k.trim()] = v.trim();
        }
        return result;
    }
    s.sys.rqAuthenticate = (rq) => {
        let { token } = s.sys.rqGetCookies(rq);
        return token && s.sys.token && token === s.sys.token;
    }

    s.sys.httpRqHandler = async (rq, rs) => {
        const ip = rq.socket.remoteAddress;
        const isLocal = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
        rq.isLocal = isLocal;

        const url = new URL('http://t.c' + rq.url);
        rq.pathname = url.pathname;
        rq.mp = `${rq.method}:${url.pathname}`;
        s.l(ip, rq.mp);

        if (rq.pathname.includes('..')) {
            rs.writeHead(403).end('Path include ".." denied.'); return;
        }
        if (rq.pathname.toLowerCase().includes('secrets.json')) {
            rs.writeHead(403).end('denied secrets.json'); return;
        }
        rs.s = (v, contentType) => {
            const s = (value, type) => rs.writeHead(200, { 'Content-Type': type }).end(value);

            if (!v) s('empty val', 'text/plain; charset=utf-8');
            else if (v instanceof Buffer) s(v, '');
            else if (typeof v === 'object') s(JSON.stringify(v), 'application/json');
            else if (typeof v === 'string' || typeof v === 'number') s(v, contentType ?? 'text/plain; charset=utf-8');
            else s('', 'text/plain');
        }

        const m = {
            'POST:/cmd': async () => {
                if (!isLocal || !s.sys.rqAuthenticate(rq)) {
                    rs.writeHead(403).end('denied');
                    return;
                }
                const { cmd } = await s.sys.rqParseBody(rq);
                if (cmd) {
                    try { eval(cmd); }
                    catch (e) { console.log(e); }
                }
            },
            'GET:/trigger': async () => {
                if (!isLocal) return;
                if (s.trigger) s.trigger();
            },
            'GET:/': async () => rs.s(await s.f('sys.apps.GUI.html'), 'text/html'),
            'GET:/stream': async () => {
                const rqId = await s.f('sys.uuid');

                s.log.info('SSE connected');
                s.connectedSSERequests.set(rqId, rs);
                rs.writeHead(200, { 'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache' });

                rq.on('close', () => {
                    s.connectedSSERequests.delete(rqId);
                    s.log.info('SSE closed');
                });
                rq.isLongRequest = true;
            },
            // 'GET:/module.js': async () => {
            //     const { id } = sys.rqParseQuery(rq);
            //     if (!id) {
            //         rs.writeHead(400).end('id is invalid.'); return;
            //     }
            //     const obj = s.find(id);
            //     if (obj && obj.js) {
            //         rs.setHeader('Content-Type', 'text/javascript');
            //         rs.end('export default ' + obj.js);
            //     }
            // },
            'POST:/state': async () => {
                const { path } = await s.sys.rqParseBody(rq);
                if (!Array.isArray(path)) {
                    rs.writeHead(403).end('Path is invalid.'); return;
                }
                if (path[0] === 'sys') {
                    if (path[1] === 'secrets' || path[1] === 'token') {
                        rs.writeHead(403).end('Access denied.'); return;
                    }
                }
                let node = s.find(path);

                if (typeof node === 'object' && !Array.isArray(node) && Object.keys(node).length < 1) {

                    const pathStr = 'state/' + path.join('/');
                    if (await s.fsAccess(pathStr)) {
                        const list = await s.nodeFS.readdir(pathStr);
                        for (let i = 0; i < list.length; i++) {
                            const item = list[i];
                            if (!item.endsWith('.json')) continue;
                            const id = item.slice(0, -5);
                            if (!node[id]) node[id] = {};
                        }

                    } else if (await s.fsAccess(pathStr + '.json')) {
                        const { parent, k } = s.findParentAndK(path);
                        node = JSON.parse(await s.nodeFS.readFile(pathStr + '.json', 'utf8'));
                        if (parent && k) parent[k] = node;
                    }
                }
                //todo get path info will be better for performance
                //todo level of depth of object or array
                rs.s(node);
            },
            'POST:/stateUpdate': async () => {
                if (!s.sys.rqStateUpdate) {
                    rs.s('Server state is not ready.'); return;
                }
                await s.f('sys.rqStateUpdate', rq, rs);
                //send updates to frontend
            },
            'POST:/merge': async () => {
                if (!s.sys.rqAuthenticate(rq)) {
                    rs.writeHead(403).end('denied');
                    return;
                }
                const { path, v } = await s.sys.rqParseBody(rq);
                let node = s.find(path);
                if (!node) node = s.makePath(path);

                if (typeof v !== 'object' || v === null) {
                    rs.writeHead(400).end('v is not object');
                    return;
                }
                //todo ability to merge even distributed data
                s.merge(node, v);
                await s.copyToDisc(path, node);
                rs.s('ok');
            },
            'POST:/sign/in': async () => {
                //todo add rate limit
                const { token } = await s.sys.rqParseBody(rq);
                if (!token || typeof token !== 'string') {
                    rs.writeHead(400).end('Token is invalid.');
                    return;
                }
                const { users } = await s.sys.getSecrets();
                if (!users[token]) {
                    rs.writeHead(404).end('User not found.');
                    return;
                }
                rs.writeHead(200, {
                    'Set-Cookie': `token=${token}; Path=/; Max-Age=2580000; SameSite=Strict; Secure; HttpOnly`,
                    'Content-Type': 'text/plain'
                }).end('ok');
            },
            'POST:/sign/out': async () => {
                rs.writeHead(200, {
                    'Set-Cookie': `token=str; Path=/; Max-Age=-1; SameSite=Strict; Secure; HttpOnly`,
                    'Content-Type': 'text/plain'
                }).end('ok');
            },
            'GET:/sign/user': async () => {
                let { token } = s.sys.rqGetCookies(rq);
                if (!token) {
                    rs.s({ user: null }); return;
                }
                const { users } = await s.sys.getSecrets();
                if (!users[token]) {
                    rs.s({ user: null }); return;
                }
                rs.s({ user: { userName: users[token] } });
            },
            'POST:/uploadFile': async () => {
                if (!rq.isLocal) { rs.writeHead(403).end('denied'); return; }

                const b = await s.sys.rqParseBody(rq);
                if (b.err) return;
                if (b) await s.nodeFS.writeFile('testFIL', b);
                rs.s('ok');
            },
        }

        if (!rq.mp.startsWith('GET:/module.js')) {
            if (s.sys.rqResolveStatic && await s.sys.rqResolveStatic(rq, rs)) return;
        }
        if (m[rq.mp]) {
            try { await m[rq.mp](); }
            catch (e) {
                s.log ? s.log.error(e) : console.log(e);
                rs.writeHead(500).end('Internal server error.');
            }
        }
        if (!rq.isLongRequest && !rs.writableEnded) {
            rs.s('Default response.');
        }
    };

    if (!s.server) {
        s.def('nodeHttp', await import('node:http'));
        s.def('server', s.nodeHttp.createServer((rq, rs) => {
            if (!s.sys.httpRqHandler || typeof s.sys.httpRqHandler !== 'function') {
                rs.writeHead(500).end('Server not ready.');
                return;
            }
            s.sys.httpRqHandler(rq, rs)
        }));
        s.def('serverStop', () => {
            s.server.closeAllConnections();
            s.server.close(() => s.server.closeAllConnections());
            s.l('server stop');
        });
        s.def('serverRestart', port => {
            s.server.closeAllConnections();
            s.server.close(() => {
                s.l('server stop');
                s.server.closeAllConnections();
                s.server.listen(port, () => s.l(`server start ${port}`));
            });
        });
    }

    if (!s.logListenerProc && s.sys.logger) {

        const logger = new (await s.f('sys.logger'));
        logger.mute();
        logger.onMessage(msg => {
            const json = JSON.stringify({ logMsg: msg });
            for (let [k, v] of s.connectedSSERequests) {
                v.write(`data: ${json}\n\n`);
            }
        });
        s.def('logListenerProc', new s.os(logger));
        s.logListenerProc.run('tail -f index.log', false, false);
    }

    const trigger = async () => {
        console.log('ONCE', new Date);

        if (await s.fsAccess('state/netId.txt')) {
            const netId = await s.nodeFS.readFile('state/netId.txt', 'utf8');
            s.defObjectProp(s.sys, 'netId', netId.trim());

            const secrets = await s.sys.getSecrets();
            if (s.sys.netId) s.defObjectProp(s.sys, 'token', secrets.netNodes[s.sys.netId]);
            s.defObjectProp(s.sys, 'secrets', secrets);
        }

        let paths = ['net', 'sys'];
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            const fName = `state/${path}.json`;

            if (await s.fsAccess(fName)) {
                const state = JSON.parse(await s.nodeFS.readFile(fName, 'utf8'));
                s.sys.stateUpdatePath(path, state);
            }
        }

        //controll of watchers from declarativeUI
        const scriptsDirExists = await s.fsAccess('scripts');
        if (scriptsDirExists && !s.scriptsWatcher && s.sys.fsChangesSlicer) {
            s.def('scriptsWatcher', await s.f('sys.fsChangesSlicer', 'scripts'));
            s.scriptsWatcher.start();
        }
        if (scriptsDirExists && s.scriptsWatcher) {
            await s.syncJsScripts(s.sys, 'sys');

            s.scriptsWatcher.slicer = async (e) => {
                if (e.eventType !== 'change') return;
                const id = e.filename.slice(0, -3);
                const node = s.find(id);
                if (!node) return;

                const tNode = typeof node;
                console.log('updateFromFS', e.filename);
                const js = await s.nodeFS.readFile('scripts/' + e.filename, 'utf8');
                if (js === node.js) {
                    console.log('js already updated');
                    return;
                }
                try {
                    eval(js);
                    if (tNode === 'object') node.js = js;
                    delete node[s.sys.SYMBOL_FN];

                    s.copyStateToDisc();
                } catch (e) { s.log.error(e.toString(), e.stack); }
            }
        }
        if (s.server) s.server.listen(8080, () => console.log(`httpServer start port: 8080`));
    }
    s.def('trigger', async () => await trigger());
    if (s.once(2)) await trigger();
    //s.processStop();


    sys.promiseCreate = async (f, timeoutSeconds = 7) => {

        return new Promise((res, rej) => {

            (async () => {
                let timeout = setTimeout(() => {
                    rej({ err: 'promise timeout', f: f.toString() });
                }, timeoutSeconds * 1000);
                await f();
                clearTimeout(timeout);
                res();
            })();
        });
    }

    if (sys.netId && !s.net[sys.netId]) s.net[sys.netId] = {};

    const netCmds = s.net[sys.netId].cmds;
    if (!netCmds) return;

    for (let i in netCmds) {

        const conf = netCmds[i];
        if (conf.cmd && conf.isEnabled) {
            const f = eval(`async () => { ${conf.cmd} }`);

            if (!conf.promise) {
                try {
                    conf.promise = sys.promiseCreate(f);
                    await conf.promise;
                } catch (e) {
                    s.l(e);
                } finally {
                    delete conf.promise;
                }
            }

        }
    }

})();
