var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    choose: 'blue',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

["info", "warn", "error", "debug"].forEach(function (method) {
    var oldMethod = (console[method] ? console[method] : console.log).bind(console);
    console[method] = function () {
        oldMethod.apply(console,
            Array.prototype.slice.call(arguments).map(function (a) {
                if (typeof a == 'object' || typeof a == 'array') {
                    a = JSON.stringify(a);
                }
                var type = '[' + method.toUpperCase() + ']'
                return colors[method](type, a)
            }));
    };
});

module.exports = colors;