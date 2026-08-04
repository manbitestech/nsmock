const { Record } = require('../customStubs/record/RecordInstance');
const record = require('../customStubs/record/record');

describe('record._nextId auto-assignment', () => {
    beforeEach(() => {
        record._init();
    });

    describe('Record.initType', () => {
        test('should create a record with a type but no id', () => {
            const rec = Record.initType('salesorder');
            expect(rec).toBeInstanceOf(Record);
            expect(rec.type).toBe('salesorder');
            expect(rec.id).toBeUndefined();
            expect(rec._id).toBeUndefined();
        });

        test('should accept record.Type enums', () => {
            const rec = Record.initType(record.Type.SALES_ORDER);
            expect(rec.type).toBe('salesorder');
        });
    });

    describe('_preload', () => {
        test('should assign sequential ids in push order for a single record', () => {
            const rec = Record.initType('salesorder');
            record._preload(rec);
            expect(rec.id).toBe(1);
            expect(record.load({ type: 'salesorder', id: 1 })).toBe(rec);
        });

        test('should assign sequential ids in push order for an array', () => {
            const a = Record.initType('salesorder');
            const b = Record.initType('salesorder');
            record._preload([a, b]);
            expect(a.id).toBe(1);
            expect(b.id).toBe(2);
        });

        test('should require type', () => {
            expect(() => {
                record._preload(new Record({ objData: {} }));
            }).toThrow(/Record must have type/);
        });

        test('should honor an explicit id', () => {
            const rec = new Record({ objData: { id: 11211, type: 'salesorder' } });
            record._preload(rec);
            expect(rec.id).toBe(11211);
            expect(record.load({ type: 'salesorder', id: 11211 })).toBe(rec);
        });
    });

    describe('_precreate', () => {
        test('should assign a hidden _id revealed on save for a single record', () => {
            const rec = Record.initType('salesorder');
            record._precreate(rec);
            const created = record.create({ type: 'salesorder' });
            expect(created._id).toBe(1);
            expect(created.id).toBeUndefined();
            expect(created.save()).toBe(1);
        });

        test('should assign sequential hidden ids in push order for an array', () => {
            const a = Record.initType('salesorder');
            const b = Record.initType('salesorder');
            record._precreate([a, b]);
            expect(record.create({ type: 'salesorder' }).save()).toBe(1);
            expect(record.create({ type: 'salesorder' }).save()).toBe(2);
        });

        test('should require type', () => {
            expect(() => {
                record._precreate(new Record({ objData: {} }));
            }).toThrow(/Record must have type/);
        });

        test('should honor an explicit _id', () => {
            const rec = new Record({ objData: { _id: 99898, type: 'salesorder' } });
            record._precreate(rec);
            expect(record.create({ type: 'salesorder' }).save()).toBe(99898);
        });
    });

    describe('record._startId', () => {
        test('should control the starting id for _preload', () => {
            record._startId(9000);
            const a = Record.initType('salesorder');
            const b = Record.initType('salesorder');
            record._preload([a, b]);
            expect(a.id).toBe(9000);
            expect(b.id).toBe(9001);
        });

        test('should control the starting hidden id for _precreate', () => {
            record._startId(99898);
            const rec = Record.initType(record.Type.SALES_ORDER);
            record._precreate(rec);
            expect(record.create({ type: record.Type.SALES_ORDER }).save()).toBe(99898);
        });
    });

    describe('_init reset', () => {
        test('should reset the counter to 1', () => {
            record._startId(9000);
            record._init();
            const rec = Record.initType('salesorder');
            record._preload(rec);
            expect(rec.id).toBe(1);
        });
    });

    describe('transform integration', () => {
        test('should use the counter for transformed record ids', () => {
            record._startId(9000);
            const estimate = new Record({ objData: { id: 100, type: 'estimate', fields: {} } });
            record._preload(estimate);
            const salesOrder = record.transform({ fromType: 'estimate', fromId: 100, toType: 'salesorder' });
            expect(salesOrder.save()).toBe(9000);
        });
    });
});
