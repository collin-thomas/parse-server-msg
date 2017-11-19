var util = require('../lib/util.js'),
    msg = require('../lib/msg.js');

Parse.Cloud.define('icontains', function (req, res) {
    var value = msg.sanitize(req.params.value);
    var answer = '';
    var list = ['a', 'b', 'c'];
    if (util.icontains(list, value)) {
        answer = 'does contain';
    } else {
        answer = 'does not contain';
    }
    res.success('list ' + answer + ' ' + value);
});

Parse.Cloud.define('objecthaskey', function (req, res) {
    var key = msg.sanitize(req.params.key);
    var answer = '';
    var obj = {"make": "porsche", "model": "cayman"};
    if (util.objectHasKey(obj, key)) {
        answer = 'has key';
    } else {
        answer = 'does not have key';
    }
    res.success('object ' + answer + ' ' + key);
});
