let program = require('commander'),
  util = require('util'),
  path = require('path'),
  extend = require('extend'),
  watch = require('node-watch'),
  dateFormat = require('dateformat'),
  baseTask = require('../libs/base_task');

program.version('1.1.0')
  .requiredOption('-u, --base-url,    [baseUrl]', 'Set CenitIO base URL', 'https://cenit.io')
  .requiredOption('-k, --key,         [key]', 'Set CenitIO tenant key', process.env.X_TENANT_ACCESS_KEY)
  .requiredOption('-t, --token,       [token]', 'Set CenitIO tenant token', process.env.X_TENANT_ACCESS_TOKEN)
  .requiredOption('-n, --namespace,   [namespace]', 'Set CenitIO namespace', 'Basic')
  .option('-p, --tenant,      [tenant]', 'Set CenitIO tenant name')
  .option('-o, --out-path,    [outPath]', 'Set output path')
  .option('-s, --origins,     [origin]', 'Set data origins', 'default,owner')
  .action((options) => {

    let host = options.baseUrl.replace(/https?:\/\/([^:\/]+).*/, '$1'),
      tenant = program.tenant || false;

    options.outPath = options.outPath || util.format('tmp/%s/TENANT-%s/snippets', host, tenant || options.key);

    extend(baseTask(options), {
      start: function () {
        let startTime = new Date();

        this.getSnippets((items) => {

          if (!this.existsSync(options.outPath)) this.mkdirSync(options.outPath);

          items.forEach((snippet) => {
            let outPath = path.join(options.outPath, snippet.namespace, snippet.type),
              file = path.join(outPath, snippet.name);

            if (!this.existsSync(outPath)) this.mkdirSync(outPath);

            console.info(util.format("DOWNLOAD SNIPPET FILE: %s.", file));
            this.writeFileSync(file, snippet.code);
          });

          this.setLastUpdated(dateFormat(startTime, "isoDateTime"));

          console.info('------------------- WATCHING SNIPPETS FILES -------------------');
          watch(options.outPath, { recursive: true }, (eventType, filename) => {
            const exclude = /^(\.|LAST-UPDATED-DATE)|(___jb_tmp___|~|\.bak|\.bck)$/;
            if (eventType === 'update' && !filename.match(exclude)) this.sendSnippet(filename)
          });
        });
      }
    }).start()
  });
