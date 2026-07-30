const { SuiteScriptError } = require('./SuiteScriptError');

/**
 * SuiteScript error module
 * @module N/error
 */

function create(options) {
    if (!options || typeof options !== 'object') {
        throw new SuiteScriptError({
            name: 'SSS_MISSING_REQD_ARGUMENT',
            message: 'create: Missing required argument: options'
        });
    }
    if (!options.name) {
        throw new SuiteScriptError({
            name: 'SSS_MISSING_REQD_ARGUMENT',
            message: 'create: Missing required argument: name'
        });
    }
    if (!options.message) {
        throw new SuiteScriptError({
            name: 'SSS_MISSING_REQD_ARGUMENT',
            message: 'create: Missing required argument: message'
        });
    }

    return new SuiteScriptError({
        name: options.name,
        message: options.message,
        notifyOff: options.notifyOff || false
    });
}

module.exports = {
    create,
    SuiteScriptError
};
