const nsHttpsDefault = require('@oracle/suitecloud-unit-testing/stubs/https/https');

class nsMockHttps {
    constructor() {
        this._responses = {};

        this._setResponse = (method, url, response) => {
            const key = `${method}:${url}`;
            if (!this._responses[key]) {
                this._responses[key] = [];
            }
            this._responses[key].push(response);
        };

        this._getResponse = (method, url) => {
            const queue = this._responses[`${method}:${url}`];
            return queue ? queue.shift() : undefined;
        };

        this._clearResponses = () => {
            this._responses = {};
        };

        this.get = jest.fn((options) => this._respond('GET', options));
        this.post = jest.fn((options) => this._respond('POST', options));
        this.put = jest.fn((options) => this._respond('PUT', options));
        this.delete = jest.fn((options) => this._respond('DELETE', options));
        this.request = jest.fn((options) => this._respond(options.method, options));

        this.createSecretKey = jest.fn((options) => ({
            guid: options.guid,
            encoding: options.encoding,
        }));

        this.createSecureString = jest.fn((options) => ({
            input: options.input,
            encoding: options.inputEncoding || 'UTF_8',
            convertEncoding: jest.fn(),
            appendString: jest.fn(),
            appendSecureString: jest.fn(),
            hash: jest.fn(),
            hmac: jest.fn(),
        }));

        this.Method = nsHttpsDefault.Method;
        this.CacheDuration = nsHttpsDefault.CacheDuration;
        this.Encoding = nsHttpsDefault.Encoding;
        this.HashAlg = nsHttpsDefault.HashAlg;
        this.RedirectType = nsHttpsDefault.RedirectType;
    }

    _respond(method, options) {
        if (!options || !options.url) {
            throw new Error('SSS_MISSING_REQD_ARGUMENT: url');
        }
        const response = this._getResponse(method, options.url);
        if (!response) {
            throw new Error(`No response configured for ${method} ${options.url}`);
        }
        return { code: response.code, body: response.body, headers: response.headers };
    }
}

module.exports = new nsMockHttps();
