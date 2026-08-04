const Record = require('../customStubs/record/RecordInstance');
const record = require('../customStubs/record/record');

describe('record.transform', () => {
    beforeEach(() => {
        record._clearDb();
    });

    describe('happy path', () => {
        test('should transform a record to a new type, copying fields and sublists', () => {
            const estimate = new Record({
                objData: {
                    id: 100,
                    type: 'estimate',
                    fields: {
                        entity: { value: 1234, text: 'Acme Inc' },
                        memo: { value: 'Convert this estimate' }
                    },
                    sublists: {
                        item: [
                            { item: { value: 101, text: 'Widget A' }, quantity: { value: 2 }, rate: { value: 10 }, amount: { value: 20 } },
                            { item: { value: 102, text: 'Widget B' }, quantity: { value: 5 }, rate: { value: 7.5 }, amount: { value: 37.5 } }
                        ]
                    }
                }
            });
            record._preload([estimate]);

            const salesOrder = record.transform({
                fromType: 'estimate',
                fromId: 100,
                toType: 'salesorder'
            });

            expect(salesOrder).toBeInstanceOf(Record);
            expect(salesOrder.type).toBe('salesorder');
            expect(salesOrder.getValue({ fieldId: 'entity' })).toBe(1234);
            expect(salesOrder.getText({ fieldId: 'entity' })).toBe('Acme Inc');
            expect(salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'item', line: 0 })).toBe(101);
            expect(salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 0 })).toBe(2);
            expect(salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: 0 })).toBe(10);
            expect(salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: 0 })).toBe(20);
            expect(salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: 1 })).toBe(37.5);
            expect(salesOrder.getLineCount({ sublistId: 'item' })).toBe(2);
        });

        test('should return an unsaved record that gets a new id on save', () => {
            const estimate = new Record({
                objData: { id: 100, type: 'estimate', fields: { memo: { value: 'x' } } }
            });
            record._preload([estimate]);

            const salesOrder = record.transform({ fromType: 'estimate', fromId: 100, toType: 'salesorder' });

            expect(salesOrder.id).toBeUndefined();
            const newId = salesOrder.save();
            expect(newId).toBeDefined();
            expect(newId).not.toBe(100);
            expect(salesOrder.id).toBe(newId);
        });

        test('should not mutate the source record when the transformed record is modified', () => {
            const estimate = new Record({
                objData: { id: 100, type: 'estimate', fields: { memo: { value: 'original' } } }
            });
            record._preload([estimate]);

            const salesOrder = record.transform({ fromType: 'estimate', fromId: 100, toType: 'salesorder' });
            salesOrder.setValue({ fieldId: 'memo', value: 'changed' });

            const source = record.load({ type: 'estimate', id: 100 });
            expect(source.getValue({ fieldId: 'memo' })).toBe('original');
        });

        test('should set dynamic mode when isDynamic is true', () => {
            const estimate = new Record({
                objData: { id: 100, type: 'estimate', fields: {}, sublists: { item: [] } }
            });
            record._preload([estimate]);

            const salesOrder = record.transform({
                fromType: 'estimate',
                fromId: 100,
                toType: 'salesorder',
                isDynamic: true
            });

            expect(salesOrder.isDynamic).toBe(true);
            expect(() => {
                salesOrder.selectNewLine({ sublistId: 'item' });
            }).not.toThrow();
        });

        test('should apply defaultValues to the transformed record', () => {
            const estimate = new Record({
                objData: { id: 100, type: 'estimate', fields: { memo: { value: 'x' } } }
            });
            record._preload([estimate]);

            const salesOrder = record.transform({
                fromType: 'estimate',
                fromId: 100,
                toType: 'salesorder',
                defaultValues: { location: 11, memo: 'default memo' }
            });

            expect(salesOrder.getValue({ fieldId: 'location' })).toBe(11);
            expect(salesOrder.getValue({ fieldId: 'memo' })).toBe('default memo');
        });
    });

    describe('reversal transforms', () => {
        test('should negate quantities and amounts when transforming a sales order into an RMA', () => {
            const salesOrder = new Record({
                objData: {
                    id: 300,
                    type: 'salesorder',
                    fields: { entity: { value: 1234 } },
                    sublists: {
                        item: [
                            { item: { value: 101, text: 'Widget A' }, quantity: { value: 5 }, rate: { value: 10 }, amount: { value: 50 } },
                            { item: { value: 102, text: 'Widget B' }, quantity: { value: 2 }, rate: { value: 20 }, amount: { value: 40 } }
                        ]
                    }
                }
            });
            record._preload([salesOrder]);

            const rma = record.transform({
                fromType: 'salesorder',
                fromId: 300,
                toType: 'returnauthorization'
            });

            expect(rma.type).toBe('returnauthorization');
            expect(rma.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 0 })).toBe(-5);
            expect(rma.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: 0 })).toBe(-50);
            expect(rma.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: 0 })).toBe(10);
            expect(rma.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 1 })).toBe(-2);
            expect(rma.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: 1 })).toBe(-40);
        });

        test('should not mutate the source sales order when reversing into an RMA', () => {
            const salesOrder = new Record({
                objData: {
                    id: 300,
                    type: 'salesorder',
                    fields: {},
                    sublists: {
                        item: [
                            { item: { value: 101 }, quantity: { value: 5 }, amount: { value: 50 } }
                        ]
                    }
                }
            });
            record._preload([salesOrder]);

            record.transform({ fromType: 'salesorder', fromId: 300, toType: 'returnauthorization' });

            const source = record.load({ type: 'salesorder', id: 300 });
            expect(source.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 0 })).toBe(5);
            expect(source.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: 0 })).toBe(50);
        });

        test('should negate quantities and amounts for invoice to credit memo', () => {
            const invoice = new Record({
                objData: {
                    id: 400,
                    type: 'invoice',
                    fields: {},
                    sublists: {
                        item: [
                            { item: { value: 101 }, quantity: { value: 3 }, amount: { value: 30 } }
                        ]
                    }
                }
            });
            record._preload([invoice]);

            const creditMemo = record.transform({ fromType: 'invoice', fromId: 400, toType: 'creditmemo' });

            expect(creditMemo.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 0 })).toBe(-3);
            expect(creditMemo.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: 0 })).toBe(-30);
        });
    });

    describe('error handling', () => {
        test('should throw when fromType is missing', () => {
            expect(() => {
                record.transform({ fromId: 100, toType: 'salesorder' });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: fromType/);
        });

        test('should throw when fromId is missing', () => {
            expect(() => {
                record.transform({ fromType: 'estimate', toType: 'salesorder' });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: fromId/);
        });

        test('should throw when toType is missing', () => {
            expect(() => {
                record.transform({ fromType: 'estimate', fromId: 100 });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: toType/);
        });

        test('should throw when the source record is not found', () => {
            expect(() => {
                record.transform({ fromType: 'estimate', fromId: 999, toType: 'salesorder' });
            }).toThrow(/Record Not Found/);
        });
    });
});
