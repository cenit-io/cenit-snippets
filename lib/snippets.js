let axios = require('axios'),
    program = require('commander'),
    fs = require('fs'),
    util = require('util'),
    watch = require('node-watch'),
    color = require('./colors'),
    dateFormat = require('dateformat');

program.version('1.0.0')
    .option('-u, --url,   [url]', 'Set CenitIO base URL')
    .option('-k, --key,   [key]', 'Set CenitIO tenant key')
    .option('-t, --token, [token]', 'Set CenitIO tenant token')
    .option('-p, --tenant, [tenant]', 'Set CenitIO tenant name')
    .option('-n, --namespace, [namespace]', 'Set CenitIO namespace')
    .option('-o, --out,   [out]', 'Set output path')
    .option('-s, --origins,   [origin]', 'Set data origins')
    .parse(process.argv);

let base_url = program.url || 'http://127.0.0.1:3000',
    service_path = '/api/v2/setup/snippet',
    host = base_url.replace(/https?:\/\/([^:\/]+).*/, '$1'),
    key = program.key || 'A796759297',
    token = program.token || 'uQyCjFkLYiVzc47coLpi',
    tenant = program.tenant || false,
    namespace = program.namespace || 'Basic',
    origins = (program.origins || 'default,owner').replace(/\s/g, '').split(','),
    out_path = program.out || util.format('tmp/%s/TENANT-%s/snippets', host, tenant || key),
    headers = {
        'Content-Type': 'application/json',
        'X-Tenant-Access-Key': key,
        'X-Tenant-Access-Token': token
    };

module.exports = {

    all: function (page, lastUpdatedDate, done) {
        let params = {
            page: page,
            namespace: JSON.stringify({'$regex': namespace.replace(/,/g, '|'), '$options': ''}),
            origin: JSON.stringify({"$in": origins})
        };

        if (lastUpdatedDate) params.updated_at = JSON.stringify({'$gt': lastUpdatedDate});

        axios({
            url: service_path,
            method: 'GET',
            baseURL: base_url,
            headers: headers,
            params: params
        }).then(function (response) {
            done(response.data);
        }).catch(function (error) {
            throw error;
        });
    },

    update: function (filename) {
        console.info(util.format("UPLOADING UPDATE OF FILE: %s", filename).warn);

        let code = fs.readFileSync(filename).toString(),
            paths = filename.split('/');

        axios({
            url: service_path,
            method: 'POST',
            baseURL: base_url,
            headers: headers,
            data: JSON.stringify({
                code: code,
                namespace: paths[paths.length - 3],
                name: paths[paths.length - 1],
                _primary: ['namespace', 'name']
            })
        }).then(function (response) {
            console.info(util.format("UPDATED THE FILE: %s", filename));
        }).catch(function (error) {
            console.error(error);
        });
    },

    download: function (page, lastUpdatedDate, done) {
        let path = '';
        out_path.split('/').forEach(function (p) {
            path = util.format('%s/%s', path, p).replace(/^\//, '');
            if (!fs.existsSync(path)) fs.mkdirSync(path);
        });

        let vThis = this,

            process = function (data) {
                data.snippets.forEach(function (snippet) {
                    let dir1 = util.format('%s/%s', out_path, snippet.namespace),
                        dir2 = util.format('%s/%s', dir1, snippet.type),
                        file = util.format('%s/%s', dir2, snippet.name);

                    if (!fs.existsSync(dir1)) fs.mkdirSync(dir1);
                    if (!fs.existsSync(dir2)) fs.mkdirSync(dir2);

                    console.info(util.format("DOWNLOAD SNIPPET FILE: %s.", file));
                    fs.writeFileSync(file, snippet.code);
                });

                if (data.total_pages > page) {
                    vThis.download(page + 1, lastUpdatedDate, done);
                } else {
                    done();
                }
            };

        page = page || 1;
        this.all(page, lastUpdatedDate, process);
    },

    getLastUpdated: function () {
        let lastUpdatedDate,
            file = util.format('%s/%s', out_path, 'LAST-UPDATED-DATE');

        lastUpdatedDate = fs.existsSync(file) ? fs.readFileSync(file).toString() : false;

        return lastUpdatedDate
    },

    setLastUpdated: function (lastUpdatedDate) {
        let file = util.format('%s/%s', out_path, 'LAST-UPDATED-DATE');

        fs.writeFileSync(file, lastUpdatedDate)
    },

    startWatch: function () {
        let vThis = this,
            lastUpdatedDate = this.getLastUpdated();

        vThis.download(1, lastUpdatedDate, function () {
            console.info('------------------- WATCHING SNIPPETS FILES -------------------');

            vThis.setLastUpdated(dateFormat(new Date(), "isoDateTime"));

            watch(out_path, {recursive: true}, function (eventType, filename) {
                const exclude = /^\.|^LAST-UPDATED-DATE$|(___jb_tmp___|~|\.bak|\.bck)$/;
                if (eventType == 'update' && !filename.match(exclude)) {
                    vThis.update(filename);
                }
            });
        });
    }
};
