class SuiteScriptError {
    constructor(options) {
        this.name = options.name;
        this.id = options.id || _generateId();
        this.message = options.message || '';
        this.stack = options.stack || _captureStack();
        this.cause = options.cause || undefined;
        this.notifyOff = options.notifyOff || false;
        this.type = 'error.SuiteScriptError';
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    toJSON() {
        return {
            type: this.type,
            id: this.id,
            name: this.name,
            message: this.message,
            stack: this.stack,
            cause: this.cause,
            notifyOff: this.notifyOff
        };
    }
}

function _generateId() {
    return 'custscript_' + Math.random().toString(36).substring(2, 10);
}

function _captureStack() {
    const err = new Error();
    const stack = err.stack || '';
    const lines = stack.split('\n');
    // Remove the first two frames (Error constructor + _captureStack)
    return lines.slice(2).map(line => line.trim());
}

module.exports = { SuiteScriptError };
