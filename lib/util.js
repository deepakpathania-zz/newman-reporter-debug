let _ = require('lodash'),
    filesize = require('filesize'),
    prettyms = require('pretty-ms'),

    SEP = ' / ',

    util = {
        /**
         * Resolves the fully qualified name for the provided item
         *
         * @param {PostmanItem|PostmanItemGroup} item The item for which to resolve the full name
         * @returns {String} The full name of the provided item, including prepended parent item names
         * @private
         */
        getFullName: function (item) {
            if (_.isEmpty(item) || !_.isFunction(item.parent) || !_.isFunction(item.forEachParent)) { return; }

            var chain = [];
            item.forEachParent(function (parent) { chain.unshift(parent.name || parent.id); });

            item.parent() && chain.push(item.name || item.id); // Add the current item only if it is not the collection
            return chain.join(SEP);
        },

        /**
         * A utility helper method to prettify byte counts into human readable strings.
         *
         * @param {Number} bytes - The raw byte count, usually from computed response sizes.
         * @returns {String} - The prettified size, suffixed with scaled units, depending on the actual value provided.
         */
        filesize: function (bytes) {
            return filesize(bytes || 0, { spacer: '' });
        },

        /**
         * A utility helper method that prettifies and returns raw millisecond counts.
         *
         * @param {Number} ms - The raw millisecond count, usually from response times.
         * @returns {String} - The prettified time, scaled to units of time, depending on the input value.
         */
        prettyms: function (ms) {
            return (ms < 1998) ? `${parseInt(ms, 10)}ms` : prettyms(ms || 0);
        },
    };

module.exports = util;
