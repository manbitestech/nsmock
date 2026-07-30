const error = require('../customStubs/error/error');
const { SuiteScriptError } = require('../customStubs/error/SuiteScriptError');
const { UserEventError } = require('../customStubs/error/UserEventError');

describe('N/error module', () => {
    describe('error.create()', () => {
        test('should create a SuiteScriptError with name and message', () => {
            const err = error.create({
                name: 'MY_CUSTOM_ERROR',
                message: 'Something went wrong'
            });

            expect(err).toBeInstanceOf(SuiteScriptError);
            expect(err.name).toBe('MY_CUSTOM_ERROR');
            expect(err.message).toBe('Something went wrong');
            expect(err.type).toBe('error.SuiteScriptError');
            expect(err.notifyOff).toBe(false);
        });

        test('should set notifyOff when provided', () => {
            const err = error.create({
                name: 'SILENT_ERROR',
                message: 'No email please',
                notifyOff: true
            });

            expect(err.notifyOff).toBe(true);
        });

        test('should throw when name is missing', () => {
            expect(() => {
                error.create({ message: 'No name' });
            }).toThrow();
        });

        test('should throw when message is missing', () => {
            expect(() => {
                error.create({ name: 'NO_MESSAGE' });
            }).toThrow();
        });

        test('should throw when options is not an object', () => {
            expect(() => {
                error.create(null);
            }).toThrow();
        });
    });

    describe('SuiteScriptError', () => {
        test('should have an auto-generated id', () => {
            const err = error.create({
                name: 'TEST',
                message: 'test'
            });

            expect(err.id).toBeDefined();
            expect(typeof err.id).toBe('string');
        });

        test('toString() should return JSON string', () => {
            const err = error.create({
                name: 'TEST',
                message: 'test message'
            });

            const str = err.toString();
            const parsed = JSON.parse(str);

            expect(parsed.name).toBe('TEST');
            expect(parsed.message).toBe('test message');
        });

        test('toJSON() should include all properties', () => {
            const err = error.create({
                name: 'TEST',
                message: 'test'
            });

            const json = err.toJSON();

            expect(json.type).toBe('error.SuiteScriptError');
            expect(json.name).toBe('TEST');
            expect(json.message).toBe('test');
            expect(json.id).toBeDefined();
            expect(json.notifyOff).toBe(false);
            expect(Array.isArray(json.stack)).toBe(true);
        });
    });

    describe('UserEventError', () => {
        test('should extend SuiteScriptError', () => {
            const err = new UserEventError({
                name: 'UE_TEST',
                message: 'user event error'
            });

            expect(err).toBeInstanceOf(SuiteScriptError);
            expect(err).toBeInstanceOf(UserEventError);
            expect(err.type).toBe('error.UserEventError');
        });

        test('should have recordId and eventType', () => {
            const err = new UserEventError({
                name: 'UE_TEST',
                message: 'user event error',
                recordId: '12345',
                eventType: 'create'
            });

            expect(err.recordId).toBe('12345');
            expect(err.eventType).toBe('create');
        });

        test('toJSON() should include recordId and eventType', () => {
            const err = new UserEventError({
                name: 'UE_TEST',
                message: 'user event error',
                recordId: '12345',
                eventType: 'edit'
            });

            const json = err.toJSON();

            expect(json.recordId).toBe('12345');
            expect(json.eventType).toBe('edit');
            expect(json.name).toBe('UE_TEST');
        });
    });
});
