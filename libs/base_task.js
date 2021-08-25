const axios = require('axios'),
  https = require('https'),
  util = require('util'),
  path = require('path'),
  fs = require('fs'),
  extend = require('extend');

const agent = new https.Agent({
  rejectUnauthorized: false
});

module.exports = (options) => {
  return {
    getBaseHeaders: function () {
      return {
        'Content-Type': 'application/json',
        'X-Tenant-Access-Key': options.key,
        'X-Tenant-Access-Token': options.token
      }
    },

    getBaseParams: function () {
      return {
        namespace: JSON.stringify({ '$regex': options.namespace.replace(/,/g, '|') }),
        origin: JSON.stringify({ "$in": options.origins.replace(/\s/g, '').split(',') }),
        updated_at: JSON.stringify({ '$gt': this.getLastUpdated() })
      }
    },

    readdirSync: function (filePath) {
      return fs.readdirSync(filePath)
    },

    existsSync: function (filePath) {
      return fs.existsSync(filePath)
    },

    readFileSync: function (filePath) {
      return fs.readFileSync(filePath, 'utf-8')
    },

    writeFileSync: function (filePath, content) {
      fs.writeFileSync(filePath, content, 'utf-8')
    },

    mkdirSync: function (dirPath) {
      if (fs.existsSync(dirPath)) return;
      this.mkdirSync(path.join(dirPath, ".."));
      fs.mkdirSync(dirPath);
    },

    getLastUpdated: function () {
      let file = util.format(path.join(options.outPath, 'LAST-UPDATED-DATE'));

      return this.existsSync(file) ? this.readFileSync(file).toString() : '1900-01-01T00:00:00-0000';
    },

    setLastUpdated: function (lastUpdatedDate) {
      let file = util.format(path.join(options.outPath, 'LAST-UPDATED-DATE'));

      this.writeFileSync(file, lastUpdatedDate)
    },

    getItems: function (servicePath, params, headers, order, itemsAttrName, done) {
      params = extend({}, this.getBaseParams(), params);
      headers = extend({ 'X-Query-Selector': JSON.stringify({ order: order }) }, this.getBaseHeaders(), headers);

      let items = [],
        request = (page) => {
          params.page = page;

          axios({
            url: servicePath,
            method: 'GET',
            baseURL: options.baseUrl + '/api/v2/',
            headers: headers,
            params: params,
            httpsAgent: agent
          }).then((response) => {
            if (response.data.total_pages === 0) return done(items);

            console.log(util.format('LOADED [ %d / %d ] PAGES.', page, response.data.total_pages));
            items = items.concat(response.data[itemsAttrName]);

            if (response.data.total_pages > page) return request(page + 1);

            done(items);
          }).catch(this.renderError);
        };

      request(1);
    },

    sendItem: function (servicePath, data, filename) {
      console.info(util.format("INIT UPLOAD UPDATED FILE: %s", filename).warn);

      let paths = filename.split('/');
      let headers = extend({}, this.getBaseHeaders(), {
        'X-Parser-Options': JSON.stringify({ primary_fields: ['namespace', 'name'] })
      });

      data = extend({
        namespace: paths[paths.length - 3], name: paths[paths.length - 1],
      }, data)

      axios({
        url: servicePath,
        method: 'POST',
        baseURL: options.baseUrl + '/api/v2/',
        headers: headers,
        data: JSON.stringify(data),
        httpsAgent: agent
      }).then(function (response) {
        console.info(util.format("DONE UPLOAD UPDATED FILE: %s", filename));
      }).catch(this.renderError);
    },

    getAlgorithms: function (done) {
      let headers = { 'X-Render-Options': JSON.stringify({ embedding: 'snippet' }) };

      this.getItems('setup/algorithm', {}, headers, 'name', 'algorithms', done)
    },

    getDataTypes: function (done) {
      let headers = { 'X-Render-Options': JSON.stringify({ embedding: 'snippet' }) };

      this.getItems('setup/json_data_type', {}, headers, 'name', 'json_data_types', done)
    },

    getTranslators: function (done) {
      let headers = { 'X-Render-Options': JSON.stringify({ embedding: 'snippet' }) };

      this.getItems('setup/translator', {}, headers, 'name', 'translators', done)
    },

    getSnippets: function (done) {
      this.getItems('setup/snippet', {}, {}, 'name', 'snippets', done)
    },

    sendSnippet: function (filename) {
      let code = fs.readFileSync(filename).toString();

      this.sendItem('setup/snippet', { code: code }, filename);
    },

    renderError: function(error) {
      if (error.response && error.response.data) {
        console.error(error.response.data.summary || error.response.data);
      } else {
        throw error;
      }
    }
  }
}
