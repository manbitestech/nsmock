const { SuiteScriptError } = require('./SuiteScriptError');

class UserEventError extends SuiteScriptError {
    constructor(options) {
        super(options);
        this.type = 'error.UserEventError';
        this.recordId = options.recordId || undefined;
        this.eventType = options.eventType || undefined;
    }

    toJSON() {
        const json = super.toJSON();
        json.recordId = this.recordId;
        json.eventType = this.eventType;
        return json;
    }
}

module.exports = { UserEventError };
