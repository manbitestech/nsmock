const http = require('../customStubs/http/http');

describe('N/http module', () => {
    beforeEach(() => {
        http._clearResponses();
    });

    describe('_setResponse / _getResponse', () => {
        test('should store and retrieve a response keyed by method and url', () => {
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok', headers: { 'content-type': 'application/json' } } });
            expect(http._getResponse({ method: 'GET', url: 'https://api.example.com/orders' })).toEqual({ code: 200, body: 'ok', headers: { 'content-type': 'application/json' } });
        });

        test('should distinguish responses by method for the same url', () => {
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'get' } });
            http._setResponse({ method: 'POST', url: 'https://api.example.com/orders', response: { code: 201, body: 'post' } });
            expect(http._getResponse({ method: 'GET', url: 'https://api.example.com/orders' }).body).toBe('get');
            expect(http._getResponse({ method: 'POST', url: 'https://api.example.com/orders' }).body).toBe('post');
        });

        test('_clearResponses should empty the store', () => {
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } });
            http._clearResponses();
            expect(http._getResponse({ method: 'GET', url: 'https://api.example.com/orders' })).toBeUndefined();
        });
    });

    describe('get / post / put / delete', () => {
        test('get should return the configured response', () => {
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: '{"id":1}', headers: { 'content-type': 'application/json' } } });
            const res = http.get({ url: 'https://api.example.com/orders' });
            expect(res).toEqual({ code: 200, body: '{"id":1}', headers: { 'content-type': 'application/json' } });
        });

        test('post should return the configured response', () => {
            http._setResponse({ method: 'POST', url: 'https://api.example.com/orders', response: { code: 201, body: 'created' } });
            const res = http.post({ url: 'https://api.example.com/orders', body: { id: 1 } });
            expect(res.code).toBe(201);
            expect(res.body).toBe('created');
        });

        test('put should return the configured response', () => {
            http._setResponse({ method: 'PUT', url: 'https://api.example.com/orders/1', response: { code: 200, body: 'updated' } });
            const res = http.put({ url: 'https://api.example.com/orders/1', body: { id: 1 } });
            expect(res.body).toBe('updated');
        });

        test('delete should return the configured response', () => {
            http._setResponse({ method: 'DELETE', url: 'https://api.example.com/orders/1', response: { code: 204, body: '' } });
            const res = http.delete({ url: 'https://api.example.com/orders/1' });
            expect(res.code).toBe(204);
        });
    });

    describe('request', () => {
        test('should route by options.method', () => {
            http._setResponse({ method: 'POST', url: 'https://api.example.com/orders', response: { code: 201, body: 'created' } });
            const res = http.request({ method: http.Method.POST, url: 'https://api.example.com/orders', body: { id: 1 } });
            expect(res.code).toBe(201);
            expect(res.body).toBe('created');
        });
    });

    describe('queue behavior', () => {
        test('should return responses in FIFO order across repeated calls', () => {
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 500, body: 'retry' } });
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } });

            expect(http.get({ url: 'https://api.example.com/orders' }).code).toBe(500);
            expect(http.get({ url: 'https://api.example.com/orders' }).code).toBe(200);
        });

        test('should accept an array of configs in a single call', () => {
            http._setResponse([
                { method: 'GET', url: 'https://api.example.com/orders', response: { code: 500, body: 'retry' } },
                { method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } }
            ]);

            expect(http.get({ url: 'https://api.example.com/orders' }).body).toBe('retry');
            expect(http.get({ url: 'https://api.example.com/orders' }).body).toBe('ok');
        });

        test('should throw when the queue is exhausted', () => {
            http._setResponse({ method: 'GET', url: 'https://api.example.com/orders', response: { code: 200, body: 'ok' } });

            http.get({ url: 'https://api.example.com/orders' });
            expect(() => http.get({ url: 'https://api.example.com/orders' })).toThrow('No response configured for GET https://api.example.com/orders');
        });
    });

    describe('error handling', () => {
        test('should throw when no response is configured for the url', () => {
            expect(() => http.get({ url: 'https://api.example.com/unknown' })).toThrow('No response configured for GET https://api.example.com/unknown');
        });

        test('should throw SSS_MISSING_REQD_ARGUMENT when url is missing', () => {
            expect(() => http.get({})).toThrow('SSS_MISSING_REQD_ARGUMENT: url');
        });
    });

    describe('enums', () => {
        test('should expose Method enum', () => {
            expect(http.Method.GET).toBe('GET');
            expect(http.Method.POST).toBe('POST');
            expect(http.Method.PUT).toBe('PUT');
            expect(http.Method.DELETE).toBe('DELETE');
            expect(http.Method.HEAD).toBe('HEAD');
        });

        test('should expose CacheDuration and RedirectType enums', () => {
            expect(http.CacheDuration.UNIQUE).toBe('UNIQUE');
            expect(http.RedirectType.RESTLET).toBe('RESTLET');
        });
    });
});
