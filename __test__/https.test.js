const https = require('../customStubs/https/https');

describe('N/https module', () => {
    beforeEach(() => {
        https._clearResponses();
    });

    describe('_setResponse / _getResponse', () => {
        test('should store and retrieve a response keyed by method and url', () => {
            https._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok', headers: { 'content-type': 'application/json' } } });
            expect(https._getResponse({ method: 'GET', url: 'https://api.example.com/orders' })).toEqual({ code: 200, body: 'ok', headers: { 'content-type': 'application/json' } });
        });

        test('_clearResponses should empty the store', () => {
            https._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } });
            https._clearResponses();
            expect(https._getResponse({ method: 'GET', url: 'https://api.example.com/orders' })).toBeUndefined();
        });
    });

    describe('get / post / put / delete', () => {
        test('get should return the configured response', () => {
            https._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: '{"id":1}', headers: { 'content-type': 'application/json' } } });
            const res = https.get({ url: 'https://api.example.com/orders' });
            expect(res).toEqual({ code: 200, body: '{"id":1}', headers: { 'content-type': 'application/json' } });
        });

        test('post should return the configured response', () => {
            https._setResponse({ method: 'POST', url: 'https://api.example.com/orders', response: { code: 201, body: 'created' } });
            const res = https.post({ url: 'https://api.example.com/orders', body: { id: 1 } });
            expect(res.code).toBe(201);
            expect(res.body).toBe('created');
        });

        test('put should return the configured response', () => {
            https._setResponse({ method: 'PUT', url: 'https://api.example.com/orders/1', response: { code: 200, body: 'updated' } });
            const res = https.put({ url: 'https://api.example.com/orders/1', body: { id: 1 } });
            expect(res.body).toBe('updated');
        });

        test('delete should return the configured response', () => {
            https._setResponse({ method: 'DELETE', url: 'https://api.example.com/orders/1', response: { code: 204, body: '' } });
            const res = https.delete({ url: 'https://api.example.com/orders/1' });
            expect(res.code).toBe(204);
        });
    });

    describe('request', () => {
        test('should route by options.method', () => {
            https._setResponse({ method: 'POST', url: 'https://api.example.com/orders', response: { code: 201, body: 'created' } });
            const res = https.request({ method: https.Method.POST, url: 'https://api.example.com/orders', body: { id: 1 } });
            expect(res.code).toBe(201);
            expect(res.body).toBe('created');
        });
    });

    describe('queue behavior', () => {
        test('should return responses in FIFO order across repeated calls', () => {
            https._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 500, body: 'retry' } });
            https._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } });

            expect(https.get({ url: 'https://api.example.com/orders' }).code).toBe(500);
            expect(https.get({ url: 'https://api.example.com/orders' }).code).toBe(200);
        });

        test('should accept an array of configs in a single call', () => {
            https._setResponse([
                { method: 'GET', url: 'https://api.example.com/orders', response: { code: 500, body: 'retry' } },
                { method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } }
            ]);

            expect(https.get({ url: 'https://api.example.com/orders' }).body).toBe('retry');
            expect(https.get({ url: 'https://api.example.com/orders' }).body).toBe('ok');
        });

        test('should throw when the queue is exhausted', () => {
            https._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } });

            https.get({ url: 'https://api.example.com/orders' });
            expect(() => https.get({ url: 'https://api.example.com/orders' })).toThrow('No response configured for GET https://api.example.com/orders');
        });
    });

    describe('createSecretKey', () => {
        test('should return a secret key with guid and encoding', () => {
            const key = https.createSecretKey({ guid: 'abc123', encoding: https.Encoding.BASE_64 });
            expect(key.guid).toBe('abc123');
            expect(key.encoding).toBe('BASE_64');
        });
    });

    describe('createSecureString', () => {
        test('should return a secure string with input and default encoding', () => {
            const str = https.createSecureString({ input: 'hello' });
            expect(str.input).toBe('hello');
            expect(str.encoding).toBe('UTF_8');
        });

        test('should honor inputEncoding', () => {
            const str = https.createSecureString({ input: 'hello', inputEncoding: https.Encoding.BASE_64 });
            expect(str.encoding).toBe('BASE_64');
        });
    });

    describe('error handling', () => {
        test('should throw when no response is configured for the url', () => {
            expect(() => https.get({ url: 'https://api.example.com/unknown' })).toThrow('No response configured for GET https://api.example.com/unknown');
        });

        test('should throw SSS_MISSING_REQD_ARGUMENT when url is missing', () => {
            expect(() => https.get({})).toThrow('SSS_MISSING_REQD_ARGUMENT: url');
        });
    });

    describe('enums', () => {
        test('should expose Method enum', () => {
            expect(https.Method.GET).toBe('GET');
            expect(https.Method.POST).toBe('POST');
            expect(https.Method.PUT).toBe('PUT');
            expect(https.Method.DELETE).toBe('DELETE');
            expect(https.Method.HEAD).toBe('HEAD');
        });

        test('should expose Encoding, HashAlg, CacheDuration, RedirectType enums', () => {
            expect(https.Encoding.UTF_8).toBe('UTF_8');
            expect(https.Encoding.BASE_64).toBe('BASE_64');
            expect(https.HashAlg.SHA256).toBe('SHA256');
            expect(https.CacheDuration.UNIQUE).toBe('UNIQUE');
            expect(https.RedirectType.RESTLET).toBe('RESTLET');
        });
    });
});
