/*  
    could change this to regular underscore 
    if we decide to make this avail to both node and browser
*/
var _ = require('underscore-node'),
    util = require('./util.js');

/**
 * Strips string of ` ~ @ # $ % ^ * + { } \ | ; " ' < > 
 * https://regex101.com/r/d4HdaM/3
 * @param {*} val string or array of strings
 * @returns {*} string or array of strings without those chars
 */
exports.sanitize = function(val) {
    function sanitizer(text) {
        return text.trim().toLowerCase().replace(/[^\,\-\_\!\?\&\:\(\)=\[\]\/\.a-zA-Z\d\s]/g, '').trim();
    }
    var newVal = [];
    if (_.isArray(val)) {
        _.each(val, function (str) {
            newVal.push(sanitizer(str));
        });
    } else {
        // string
        newVal = sanitizer(val);
    }
    return newVal;
};

/**
 * Replaces the placeholder string in str with the strings inside of items
 * @param {string} str the string to search through
 * @param {array} items the string(s) to replace the placeholder with
 * @param {string} placeholder default to %s can be set for custom placeholder string
 * @returns {string} the string with the replaced string(s)
 */
exports.replaceStringPlaceholder = function(str, items, placeholder) {
    if (!_.isString(str)) {
        throw "first arg must be a string";
    }
    if (!_.isArray(items)) {
        throw "second arg must be an array";
    }
    if (_.isUndefined(placeholder)) {
        placeholder = '%s';
    }
    _.each(items, function (item) {
        str = str.replace(placeholder, item);
    });
    return str;
};

/**
 * Gets a message template by name
 * @param {String} templateName the name of user template to get
 * @param {Array} systemDefaultMessages is a message template that is defined by the sytem that is inejcted to all user templates
 * @param {Array} globalMessages is a message template that is user defined that is injected to all user templates
 * @param {*} userTemplates all user templates 
 * @returns {Array} message template to use for all the other futions 
 */
exports.importMessageTemplate = function(templateName, systemDefaultMessages, globalMessages, userTemplates) {
    var arr = [];
    _.each(_.pick(userTemplates, templateName), function (messages) {
        _.each(messages.concat(systemDefaultMessages, globalMessages), function (obj) {
            if (obj.response != undefined) {
                obj.response = sanitize(obj.response);
            }
            if (obj.accept != undefined) {
                obj.accept = sanitize(obj.accept);
            }
            obj.template = templateName;
            arr.push(obj);
        });
    });
    return arr;
};

/**
 * Find the message in the template with the start key
 * @param {object} template 
 * @returns {object} start message
 */
exports.findStart = function (template) {
    return _.find(template, function (message) {
        return _.has(message, "start");
    });
};

/**
 * finds the message in the template that has the key word Cancel
 * @param {object} template 
 * @returns {object} cancel message
 */
exports.findCancel = function (template) {
    return _.find(template, function (message) {
        return message.keyword == "Cancel";
    });
};

/**
 * Checks if the value is populated
 * @param {string} lastSentKeyword 
 * @returns {boolean} true if populated 
 */
exports.isFirstMessage = function (lastSentKeyword) {
    if (_.isUndefined(lastSentKeyword) || s.isBlank(lastSentKeyword)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Get the message from the template that has the specified keyword
 * @param {object} template 
 * @param {string} lastSentKeyword 
 * @returns {object} the message
 */
exports.getLastSentMesasge = function (template, lastSentKeyword) {
    return _.find(template, function (message) {
        return message.keyword == lastSentKeyword;
    });
};

/**
 * Checks if the message has the end key set
 * @param {object} lastSentMessage 
 * @returns {boolean} true if message has end key
 */
exports.isLastSentMessageTheEnd = function (lastSentMessage) {
    if (_.has(lastSentMessage, "end")) {
        return true;
    } else {
        return false;
    }
};

/**
 * Returns the keyword of the message
 * @param {object} messageToSend the message from template to send
 * @returns {string} the message's keyword
 */
exports.getLastSentKeyword = function (messageToSend) {
    return messageToSend.keyword;
};

/**
 * Did the user send string that is in the cancel message's accept array
 * @param {object} cancel 
 * @param {string} messageFromUser the string the user sent
 * @returns {boolean} true cancel accept array contains message from user
 */
exports.isLastSentMessageCancel = function (cancel, messageFromUser) {
    if (util.icontains(cancel.accept, messageFromUser)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Does the message have the accept key defined
 * @param {object} lastSentMessage 
 * @returns {boolean} true if accept key exists for message
 */
exports.doesLastSentMessageHaveAcceptRule = function (lastSentMessage) {
    if (_.has(lastSentMessage, "accept")) {
        return true;
    } else {
        return false;
    }
};

/**
 * Does the message accept array contain the string
 * @param {string} messageFromUser the string the user sent
 * @param {object} lastSentMessage 
 * @returns {boolean} true if string is found in accept array
 */
exports.doesMessageFromUserConformToLastSentMessageAcceptRule = function (messageFromUser, lastSentMessage) {
    if (util.icontains(lastSentMessage.accept, messageFromUser)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Finds the message that has the parent of lastSentMessage 
 * and that message's reponse array contains messageFromUser
 * @param {object} template 
 * @param {object} lastSentMessage 
 * @param {string} messageFromUser the string the user sent
 * @returns {object} message
 */
exports.getChildOfLastSentMessageWhereMessageFromUserMatchesResponse = function (template, lastSentMessage, messageFromUser) {
    return _.find(template, function (message) {
        return ((_.contains(message.parent, lastSentMessage.keyword)) &&
            (util.icontains(message.response, messageFromUser)));
    });
};

/**
 * Finds the message that has the parent of lastSentMessage 
 * without checking the reponse array
 * @param {object} template 
 * @param {object} lastSentMessage message
 * @returns {object} message
 */
exports.getChildOfLastSentMessage = function (template, lastSentMessage) {
    return _.find(template, function (message) {
        return _.contains(message.parent, lastSentMessage.keyword);
    });
};

/**
 * Gets the message to send to the user based on a bunch of diffent factors
 * @param {object} template 
 * @param {object} cancel message 
 * @param {object} start message
 * @param {string} lastSentKeyword 
 * @param {string} messageFromUser the string the user sent
 * @returns {object} message 
 */
exports.getMessageToSend = function (template, cancel, start, lastSentKeyword, messageFromUser) {
    if (!_.isUndefined(messageFromUser)) {
        messageFromUser = sanitize(messageFromUser);
    }
    
    // find the last sent message based on the last sentKeyboard
    var lastSentMessage = getLastSentMesasge(template, lastSentKeyword);

    // if this is the first message
    if (isFirstMessage(lastSentKeyword)) {
        return start;
    }

    // does the last message we sent have a the end keyword?
    if (isLastSentMessageTheEnd(lastSentMessage)) {
        return start;
    }

    // Did they send us a cancel/stop?
    if (isLastSentMessageCancel(cancel, messageFromUser)) {
        return cancel;
    }

    // Does lastSentMessage has an accept rule? 
    if (doesLastSentMessageHaveAcceptRule(lastSentMessage)) {
        // Did message from user conform to our accept rule?
        if (doesMessageFromUserConformToLastSentMessageAcceptRule(messageFromUser, lastSentMessage)) {
            var nextMessageToSend = getChildOfLastSentMessageWhereMessageFromUserMatchesResponse(template, lastSentMessage, messageFromUser);
            // There is the chance that the accept rule was met but the template
            // is not setup corretly and by that i mean there is not a child message
            // defined with a response that matches the users input that was in the accept rule.
            if (_.isUndefined(nextMessageToSend)) {
                return lastSentMessage;
            } else {
                return nextMessageToSend;
            }
        } else {
            // The users input did not conform to the accept rule
            // resend the last sent message
            return lastSentMessage;
        }
        // No accept rule on lastSentMessage
    } else {
        // Does lastSentMessage have a child message? If so get it.
        var childOfLastSentMessage = getChildOfLastSentMessage(template, lastSentMessage);
        if (_.isUndefined(childOfLastSentMessage)) {
            // we couldn't find a child
            // resend the last message
            // I don't know a situation where we would get here.
            // because if we are accepting any input from the user,
            // but can't find the next message to send,
            // then they won't ever escape from this message.
            // Basically you could visulize it as a node in a flow chart with no lines coming off it
            // and in that case, that message should really have the "end" key set on it.
            return lastSentMessage;
        } else {
            return childOfLastSentMessage;
        }
    }
};

/**
 * Function for modifying the message's body
 * @param {object} messageToSend the message from template to send
 * @param {string} messageFromUser the string the user sent
 * @returns {*} object
 */
exports.processMessageToSend = function (messageToSend, messageFromUser) {
    // new step, first one in a some time =]
    // do string placeholder replacement
    // has special role for inserting messageFromUser
    // does messageToSend body contains %s
    if (util.objectHasKey(messageToSend, 'options.stringReplacements')) {
        //if (s.include(messageToSend.body, "%s")) {
        messageToSend.options.stringReplacements[messageToSend.options.stringReplacements.indexOf('%messageFromUser')] = messageFromUser;
        messageToSend.body = replaceStringPlaceholder(messageToSend.body, messageToSend.options.stringReplacements);
    }
    return messageToSend;
};