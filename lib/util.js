var _ = require('underscore-node'),
    s = require('underscore.string');

/**
 * Case insensitive version of _.contains
 * @param {array} list array to search
 * @param {string} value item to search for
 * @returns {boolean} true if list contains value
 */
exports.icontains = function(list, value) {
    if (_.isUndefined(value) || s.isBlank(value)) {
        return false;
    }
    return !_.isEmpty(_.filter(list, function(item) {
        //var regex = new RegExp('^' + value + '$', "i");
        //return !_.isNull(item.match(regex));
        return item.toLowerCase() == value.toLowerCase();
    }));
};

/**
 * Like _.has but can search deep into object
 * https://stackoverflow.com/a/23809123/1469690
 * @param {object} obj object to search
 * @param {string} key key name in obj to search for
 * @returns {boolean} true if obj has key
 */
exports.objectHasKey = function(obj, key) {
    return key.split(".").every(function (x) {
        if (typeof obj != "object" || obj === null || !(x in obj))
            return false;
        obj = obj[x];
        return true;
    });
};
