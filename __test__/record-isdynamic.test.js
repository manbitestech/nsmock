const { Record } = require('../customStubs/record/RecordInstance');
const record = require('../customStubs/record/record');

describe('Record.isDynamic', () => {
    beforeEach(() => {
        record._init();
    });

    test('should default to false', () => {
        const rec = new Record({ objData: { type: 'salesorder' } });
        expect(rec.isDynamic).toBe(false);
    });

    test('should reflect _setDynamic state', () => {
        const rec = new Record({ objData: { type: 'salesorder' } });
        rec._setDynamic(true); // Not a SuiteScript function; only invoked within nsMock.
        expect(rec.isDynamic).toBe(true);
        rec._setDynamic(false);
        expect(rec.isDynamic).toBe(false);
    });

    test('should be true when created with isDynamic option', () => {
        const rec = new Record({ objData: { _id: 1, type: 'salesorder' } });
        record._precreate({ salesorder: [rec] });
        const created = record.create({ type: 'salesorder', isDynamic: true });
        expect(created.isDynamic).toBe(true);
    });

    test('should be false when created without isDynamic option', () => {
        const rec = new Record({ objData: { _id: 1, type: 'salesorder' } });
        record._precreate({ salesorder: [rec] });
        const created = record.create({ type: 'salesorder' });
        expect(created.isDynamic).toBe(false);
    });

    test('should be true when transformed with isDynamic option', () => {
        const estimate = new Record({ objData: { id: 100, type: 'estimate', fields: {} } });
        record._preload([estimate]);
        const salesOrder = record.transform({
            fromType: 'estimate',
            fromId: 100,
            toType: 'salesorder',
            isDynamic: true
        });
        expect(salesOrder.isDynamic).toBe(true);
    });

    test('should be read-only', () => {
        const rec = new Record({ objData: { type: 'salesorder' } });
        expect(() => {
            rec.isDynamic = true;
        }).toThrow();
        expect(rec.isDynamic).toBe(false);
    });
});
