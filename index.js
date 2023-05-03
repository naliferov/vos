(async () => {
    globalThis.s ??= {};

    if (!s.net) s.net = {};
    if (!s.space) s.space = {};
    if (!s.sys) s.sys = {};
    if (!s.users) s.users = {};
    const sys = s.sys;

    if (!s.sys.SYMBOL_FN) s.sys.SYMBOL_FN = Symbol('fn');
    if (!s.sys.SYMBOL_IS_EMPTY_NODE) s.sys.SYMBOL_IS_EMPTY_NODE = Symbol('isEmptyNode');

    Object.defineProperty(s, 'def', {
        writable: true, configurable: true, enumerable: false,
        value: (k, v) => {
            Object.defineProperty(s, k, {writable: true, configurable: true, enumerable: false, value: v});
        }
    });
    Object.defineProperty(s, 'defObjectProp', {
        writable: true, configurable: true, enumerable: false,
        value: (o, k, v) => {
            Object.defineProperty(o, k, {writable: true, configurable: true, enumerable: false, value: v});
        }
    });
    s.def('l', console.log);
    s.def('find', id => s.findByArray(Array.isArray(id) ? id : id.split('.')));
    s.def('findFN', id => {
        const node = s.findByArray(Array.isArray(id) ? id : id.split('.'));
        if (!node) return;
        //if (typeof node === 'object') {
            //return node[s.sys.SYMBOL_FN];
        //}
    });
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
    s.def('f', (id, ...args) => {
        try {
            let node = s.find(id);
            if (!node || !node.js) {
                console.log(`js not found by id [${id}]`);
                return;
            }
            if (!node[s.sys.SYMBOL_FN]) {
                node[s.sys.SYMBOL_FN] = eval(node.js);
                //todo experimental support
                //const name = Array.isArray(id) ? id.join('.') : id;
                //node[s.sys.SYMBOL_FN] = (await import(`http://127.0.0.1:8080/module.js?id=${name}&t=${Date.now()}`)).default;
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({path: ['sys']}),
        })).json();
        s.merge(s.sys, sysState);

        s.l(s.sys.apps);

        s.sys.proxyS = {};
        globalThis.s = new Proxy(s, s.sys.proxyS);

        (new (await s.f('sys.apps.GUI'))).start();
        return;
    }

    //s.sys.apps.dataBrowser.node = s.sys.apps.GUI.outlinerNode;
    //s.l(s.sys.apps.dataBrowser.node);

    s.def('process', (await import('node:process')).default);
    s.def('processStop', () => { s.l('stop process ', s.process.pid); s.process.exit(0); });
    //todo process restart
    //s.def('processRestart', () => { s.l('stop process ', s.process.pid); s.process.exit(0); });
    s.def('nodeFS', (await import('node:fs')).promises);
    s.def('fsAccess', async path => {
        try { await s.nodeFS.access(path); return true; }
        catch { return false; }
    });
    s.sys.getSecrets = async () => JSON.parse(await s.nodeFS.readFile('state/secrets.json', 'utf8'));
    //intervals, promises, connections

    if (!sys.netUpdateIds) s.defObjectProp(sys, 'netUpdateIds', new Map);
    if (!s.loop) {
        s.def('loop', {
            file: 'index.js',
            delay: 2000,
            isWorking: false,
            start: async function() {
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
            stop: function() {
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

    s.def('createObjectDump', (object, path = '') => {
        const dump = {};
        for (let k in object) {
            if (k === 'undefined') continue;

            const v = object[k];
            const t = typeof v;

            if (t === 'function') {
                dump[k] = {js: v.toString()};
            } else if (t === 'boolean' || t === 'string' || t === 'number') {
                dump[k] = v;
            } else if (t === 'object') {
                if (v === null || Array.isArray(v)) {
                    dump[k] = v;
                } else {
                    dump[k] = s.createObjectDump(v, path + '.' + k);
                }
            }
            else if (t === 'symbol' || t === 'undefined') {}
            else {
                s.l('unknown object type', path, t, v);
            }
        }
        return dump;
    });
    s.def('createPathDump', path => {
        const object = s.find(path);
        if (!object) return;
        return s.createObjectDump(object);
    });
    s.def('dumpStateToDisc', () => {
        if (s.dumping) return;
        s.def('dumping', setTimeout(async () => {
            s.l('<< memory dump', new Date);

            const dump = async path => {
                const dump = s.createPathDump(path);
                if (Object.keys(dump).length < 1) return;
                await s.nodeFS.writeFile(`state/${path}.json`, JSON.stringify(dump));
            }
            const paths = ['net', 'sys'];
            for (let i = 0; i < paths.length; i++) await dump(paths[i]);
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
    s.sys.stateUpdateFull = async state => {
        for (let k in s) if (!state[k]) delete s[k];
        s.merge(s, state);
        s.l('setUpdate', 'setForUpdate: ', Object.keys(state).length);
    }
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
                    resolve({err: `limit reached [${limitMb}mb]`});
                    return;
                }
                b.push(chunk);
            });
            rq.on('error', err => reject(err));
            rq.on('end', () => {
                b = Buffer.concat(b);

                if (rq.headers['content-type'] === 'application/json') {
                    try { b = JSON.parse(b.toString()); }
                    catch (e) { b = {err: 'json parse error'}; }
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
            const m = {html: 'text/html', js: 'text/javascript', css: 'text/css', map: 'application/json', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf'};
            if (m[extension]) rs.setHeader('Content-Type', m[extension]);

            //rs.setHeader('Access-Control-Allow-Origin', '*');
            rs.end(file);
            return true;
        } catch (e) {
            if (s.log) s.log.info(e.toString(), {path: e.path, syscall: e.syscall});
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
        let {token} = s.sys.rqGetCookies(rq);
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
        if (rq.url.toLowerCase().includes('secrets.json')) {
            rs.writeHead(403).end('denied secrets.json'); return;
        }
        rs.s = (v, contentType) => {
            const s = (value, type) => rs.writeHead(200, {'Content-Type': type}).end(value);

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
                const {cmd} = await s.sys.rqParseBody(rq);
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
                rs.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache'});

                rq.on('close', () => {
                    s.connectedSSERequests.delete(rqId);
                    s.log.info('SSE closed');
                });
                rq.isLongRequest = true;
            },
            'GET:/module.js': async () => {
                const {id} = sys.rqParseQuery(rq);
                if (!id) {
                    rs.writeHead(400).end('id is invalid.'); return;
                }
                const obj = s.find(id);
                if (obj && obj.js) {
                    rs.setHeader('Content-Type', 'text/javascript');
                    rs.end('export default ' + obj.js);
                }
            },
            'POST:/state': async () => {
                const {path} = await s.sys.rqParseBody(rq);
                if (!Array.isArray(path)) {
                    rs.writeHead(403).end('Path is invalid.'); return;
                }
                if (path[0] === 'sys') {
                    if (path[1] === 'secrets' || path[1] === 'token') {
                        rs.writeHead(403).end('Access denied.'); return;
                    }
                }

                let node = s.find(path);
                const pathStr = 'state/' + path.join('/');

                //todo get path info will be better
                if (typeof node === 'object' && !Array.isArray(node) && Object.keys(node).length < 1) {

                    if (await s.fsAccess(pathStr)) {
                        const list = await s.nodeFS.readdir(pathStr);
                        for (let i = 0; i < list.length; i++) {
                            const item = list[i];
                            if (!item.endsWith('.json')) continue;
                            const id = item.slice(0, -5);
                            if (!node[id]) node[id] = {};
                        }

                    } else if (await s.fsAccess(pathStr + '.json')) {
                        const {parent, k} = s.findParentAndK(path);
                        node = JSON.parse(await s.nodeFS.readFile(pathStr + '.json', 'utf8'));
                        if (parent && k) parent[k] = node;
                    }
                }
                //todo level of depth of object or array
                rs.s(node);
            },
            'POST:/stateUpdate': async () => {
                if (!s.sys.rqStateUpdate) {
                    rs.s('Server state is not ready.'); return;
                }
                await s.f('sys.rqStateUpdate', rq, rs);
            },
            'POST:/sysUpdate': async () => {
                if (!s.sys.rqAuthenticate(rq)) {
                    rs.writeHead(403).end('denied');
                    return;
                }
                const {sys} = await s.sys.rqParseBody(rq);
                s.merge(s.sys, sys);
                rs.s('ok');
            },
            'POST:/sign/in': async () => {
                //todo add rate limit
                const {token} = await s.sys.rqParseBody(rq);
                if (!token || typeof token !== 'string') {
                    rs.writeHead(400).end('Token is invalid.');
                    return;
                }
                const {users} = await s.sys.getSecrets();
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
            // 'GET:/authorizedUser': async () => {
            //     const cookies = s.sys.rqGetCookies(rq);
            //     if (!cookies.token) {
            //         rs.s({userName: null});
            //         return;
            //     }
            //     const users = (await s.sys.getSecrets()).users;
            //     let userName = users[cookies.token];
            //     rs.s({userName});
            // },
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

    if (!s.logSlicerProc && s.sys.logger) {

        const logger = new (await s.f('sys.logger'));
        logger.mute();
        logger.onMessage(msg => {
            const json = JSON.stringify({logMsg: msg});
            for (let [k, v] of s.connectedSSERequests) {
                v.write(`data: ${json}\n\n`);
            }
        });
        const os = new s.os(logger);
        s.def('logSlicerProc', os);
        os.run('tail -f index.log', false, false, proc => {
            s.def('logSlicerProc', os);
        });
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

                    s.dumpStateToDisc();
                } catch (e) { s.log.error(e.toString(), e.stack); }
            }
        }
        if (s.server) s.server.listen(8080, () => console.log(`httpServer start port: 8080`));
    }
    s.def('trigger', async () => await trigger());
    if (s.once(1)) await trigger();
    //s.processStop();

    if (sys.netNodesCheck && !sys.netNodesCheckIsActive) {
        //todo setTimeout for dispose connections and set sys.netNodesCheckIsActive to zero

        const netNodesCheck = await s.f('sys.netNodesCheck');
        s.defObjectProp(s.sys, 'netNodesCheckIsActive', 1);

        try { await netNodesCheck(s.sys.netId); }
        catch (e) { s.l(e); }
        sys.netNodesCheckIsActive = 0;

        //dispose connections after timeout
    }
})();