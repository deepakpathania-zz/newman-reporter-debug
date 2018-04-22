var colors = require('colors/safe'),

    util = require('./util'),

    LF = '\n',
    rootSymbol = '→',
    subSymbol = '↳',
    folderSymbol = '❏',

    PostmanDEBUGReporter;

/**
 * DEBUG reporter
 *
 * @param {Object} newman - The collection run object, with event hooks for reporting run details.
 * @param {Object} reporterOptions - CLI reporter options object.
 * @param {Object} options - A set of generic collection run options.
 * @returns {*}
 */
PostmanDEBUGReporter = function (newman, reporterOptions, options) {
    let currentGroup = options.collection;
    newman.on('start', function () {
        console.log(LF + colors.bold('Newman debug reporter') + LF);
        console.log(LF + colors.yellow('start') +
        ` event triggered for ${colors.green(currentGroup.name)}. Called when the run begins.` + LF);
    });

    newman.on('beforeIteration', function (err, o) {
        if (err || o.cursor.cycles <= 1) {
            return; // do not log iteration banner if it is a single iteration run
        }
        console.log(LF + colors.yellow('beforeIteration') +
        ' event triggered. Called before starting a new iteration.' + LF);
        console.log(LF + colors.gray.underline('Iteration %d/%d'), o.cursor.iteration + 1, o.cursor.cycles);
    });

    newman.on('beforeItem', function (err, o) {
        if (err) { return; }

        let itemGroup = o.item.parent(),
            root = !itemGroup || (itemGroup === options.collection);

        console.log(LF + colors.yellow('beforeItem') + ' event triggered. Called before running a new item.' + LF);

        // in case this item belongs to a separate folder, log that folder name
        if (itemGroup && (currentGroup !== itemGroup)) {
            !root && console.log('\n%s %s', folderSymbol, colors.green(util.getFullName(itemGroup)));

            // set the flag that keeps track of the currently running group
            currentGroup = itemGroup;
        }

        // we log the item name. the symbol prefix denotes if the item is in root or under folder.
        o.item && console.log('\n%s %s', (root ?
            rootSymbol : subSymbol), colors.green(o.item.name || ''));
    });

    newman.on('beforePrerequest', function (err, o) {
        if (err) { return; }

        if (o.events.length > 0) {
            o.events.forEach(function (event) {
                event.listen === 'prerequest' &&
                console.log(LF + colors.yellow('beforePreRequest') +
                ' event triggered. Called before running pre-request scripts.' + LF);
            });
        }
    });

    newman.on('prerequest', function (err, o) {
        if (err) { return; }
        if (o.executions.length > 0) {
            o.executions.forEach(function (execution) {
                execution.event.listen === 'prerequest' &&
                console.log(LF + colors.yellow('prerequest') +
                ' event triggered. Called after running pre-request scripts.' + LF);
            });
        }
    });

    newman.on('beforeRequest', function (err, o) {
        if (err || !o.request) { return; }
        console.log(LF + colors.yellow('beforeRequest') + ' event triggered. Called before sending a request' + LF);
        console.log(LF + colors.gray(o.request.method), colors.gray(o.request.url) + LF);
    });

    newman.on('request', function (err, o) {
        if (err) { return; }
        var size = o.response && o.response.size();
        size = size && (size.header || 0) + (size.body || 0) || 0;

        console.log(LF + colors.yellow('request') + ' event triggered. Called after sending a request' + LF);

        err ? console.log.lf(colors.red('[errored]')) :
            console.log(LF + colors.gray('[%d %s, %s, %s]'), o.response.code, o.response.reason(),
                util.filesize(size), util.prettyms(o.response.responseTime));
    });

    newman.on('beforeTest', function (err, o) {
        if (err) { return; }

        if (o.events.length > 0) {
            o.events.forEach(function (event) {
                event.listen === 'test' &&
                console.log(LF + colors.yellow('beforeTest') +
                ' event triggered. Called before running test scripts.' + LF);
            });
        }
    });

    newman.on('assertion', function () {
        console.log(LF + colors.yellow('assertion') + ' event triggered. Called before an assertion. ');
        if (this.summary.run.failures.length > 0) {
            console.log(colors.red.bold('✖'));
        }
        else {
            console.log(colors.green.bold('✓'));
        }
    });

    newman.on('test', function (err, o) {
        if (err) { return; }
        if (o.executions.length > 0) {
            o.executions.forEach(function (execution) {
                execution.event.listen === 'test' &&
                console.log(LF + colors.yellow('test') +
                ' event triggered. Called on completion of test script.' + LF);
            });
        }
    });

    newman.on('item', function () {
        console.log(LF + colors.yellow('item') + ' event triggered. Called on completion of an item.' + LF);
    });

    newman.on('iteration', function (err, o) {
        if (err || o.cursor.cycles <= 1) {
            return; // do not log iteration banner if it is a single iteration run
        }
        console.log(LF + colors.yellow('iteration') + ' event triggered. Called when an iteration is completed.' + LF);
    });

    newman.on('beforeDone', function () {
        console.log(LF + colors.yellow('beforeDone') + ' event triggered. Called before the end of the run.' + LF);
    });

    newman.on('done', function () {
        let run = this.summary.run;

        console.log(LF + colors.yellow('done') + ' event triggered. Called at the end of the run.' + LF);
        run.failures && run.failures.length > 0 ?
            console.log(LF + colors.red.bold('Run - not okay') + LF) :
            console.log(LF + colors.green.bold('Run - ok') + LF);
    });

    newman.on('exception', function () {
        console.log(LF + colors.red('exception') + ' event triggered. Called when an exception occurs. ' +
        colors.red.bold('✖') + LF);
    });

    newman.on('console', function (err, o) {
        if (err) { return; }
        // o.messages has all the messages in case you need to use them.
        console.log(LF + colors.yellow('console') +
        ' event triggered. Called any time a console.* function is called in scripts' + LF);
    });

};

module.exports = PostmanDEBUGReporter;
