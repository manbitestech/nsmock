const Record = require('../customStubs/record/RecordInstance');
const record = require('../customStubs/record/record');

describe('Phase 1 — Dynamic Mode & Sublist Methods', () => {
    beforeEach(() => {
        record._clearDb();
    });

    // ------------------------------------------------------------------
    // getCurrentSublistValue
    // ------------------------------------------------------------------
    describe('getCurrentSublistValue', () => {
        test('should get value from currently selected line', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: {
                        item: [
                            { item: { value: 101, text: 'Widget A' } },
                            { item: { value: 102, text: 'Widget B' } }
                        ]
                    }
                }
            });
            rec._setDynamic(true);
            record._preload([rec]);

            const loaded = record.load({ id: 1, type: 'salesorder' });
            loaded.selectLine({ sublistId: 'item', line: 1 });

            const val = loaded.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });
            expect(val).toBe(102);
        });

        test('should throw when sublistId is missing', () => {
            const rec = new Record({ objData: { id: 1, type: 'salesorder', sublists: {} } });
            rec._setDynamic(true);
            expect(() => {
                rec.getCurrentSublistValue({ fieldId: 'item' });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: sublistId/);
        });

        test('should throw when fieldId is missing', () => {
            const rec = new Record({ objData: { id: 1, type: 'salesorder', sublists: {} } });
            rec._setDynamic(true);
            expect(() => {
                rec.getCurrentSublistValue({ sublistId: 'item' });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: fieldId/);
        });

        test('should throw when no line is selected', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: { item: [{ item: { value: 101 } }] }
                }
            });
            rec._setDynamic(true);
            expect(() => {
                rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });
            }).toThrow(/No line selected for sublist: item/);
        });

        test('should return undefined when field does not exist on current line', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: { item: [{ item: { value: 101 } }] }
                }
            });
            rec._setDynamic(true);
            rec.selectLine({ sublistId: 'item', line: 0 });
            const val = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'nonexistent' });
            expect(val).toBeUndefined();
        });
    });

    // ------------------------------------------------------------------
    // getCurrentSublistText
    // ------------------------------------------------------------------
    describe('getCurrentSublistText', () => {
        test('should get text from currently selected line', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: {
                        item: [
                            { item: { value: 101, text: 'Widget A' } },
                            { item: { value: 102, text: 'Widget B' } }
                        ]
                    }
                }
            });
            rec._setDynamic(true);
            record._preload([rec]);

            const loaded = record.load({ id: 1, type: 'salesorder' });
            loaded.selectLine({ sublistId: 'item', line: 0 });

            const text = loaded.getCurrentSublistText({ sublistId: 'item', fieldId: 'item' });
            expect(text).toBe('Widget A');
        });

        test('should throw when no line is selected', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: { item: [{ item: { value: 101, text: 'Widget A' } }] }
                }
            });
            rec._setDynamic(true);
            expect(() => {
                rec.getCurrentSublistText({ sublistId: 'item', fieldId: 'item' });
            }).toThrow(/No line selected for sublist: item/);
        });
    });

    // ------------------------------------------------------------------
    // setCurrentSublistText
    // ------------------------------------------------------------------
    describe('setCurrentSublistText', () => {
        test('should set text on the current pending line and commit', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: { item: [] }
                }
            });
            rec._setDynamic(true);

            rec.selectNewLine({ sublistId: 'item' });
            rec.setCurrentSublistText({ sublistId: 'item', fieldId: 'item', text: 'Widget A' });
            rec.commitLine({ sublistId: 'item' });

            expect(rec.getLineCount({ sublistId: 'item' })).toBe(1);
            const text = rec.getSublistText({ sublistId: 'item', fieldId: 'item', line: 0 });
            expect(text).toBe('Widget A');
        });

        test('should throw when sublistId is missing', () => {
            const rec = new Record({ objData: { id: 1, type: 'salesorder', sublists: {} } });
            rec._setDynamic(true);
            expect(() => {
                rec.setCurrentSublistText({ fieldId: 'item', text: 'X' });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: sublistId/);
        });

        test('should throw when fieldId is missing', () => {
            const rec = new Record({ objData: { id: 1, type: 'salesorder', sublists: {} } });
            rec._setDynamic(true);
            expect(() => {
                rec.setCurrentSublistText({ sublistId: 'item', text: 'X' });
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: fieldId/);
        });
    });

    // ------------------------------------------------------------------
    // cancelLine
    // ------------------------------------------------------------------
    describe('cancelLine', () => {
        test('should discard pending line and current line marker', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: { item: [] }
                }
            });
            rec._setDynamic(true);

            rec.selectNewLine({ sublistId: 'item' });
            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: 999 });
            expect(rec._pendingLine['item']).toBeTruthy();

            rec.cancelLine({ sublistId: 'item' });

            expect(rec._pendingLine['item']).toBeNull();
            expect(rec._currentLineMarker['item']).toBeUndefined();
        });

        test('should return the record for chaining', () => {
            const rec = new Record({
                objData: { id: 1, type: 'salesorder', sublists: { item: [] } }
            });
            rec._setDynamic(true);
            rec.selectNewLine({ sublistId: 'item' });

            const result = rec.cancelLine({ sublistId: 'item' });
            expect(result).toBe(rec);
        });

        test('should throw when not in dynamic mode', () => {
            const rec = new Record({
                objData: { id: 1, type: 'salesorder', sublists: { item: [] } }
            });
            expect(() => {
                rec.cancelLine({ sublistId: 'item' });
            }).toThrow(/only supported in dynamic mode/);
        });

        test('should throw when sublistId is missing', () => {
            const rec = new Record({ objData: { id: 1, type: 'salesorder', sublists: {} } });
            rec._setDynamic(true);
            expect(() => {
                rec.cancelLine({});
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: sublistId/);
        });
    });

    // ------------------------------------------------------------------
    // hasSublist
    // ------------------------------------------------------------------
    describe('hasSublist', () => {
        test('should return true when sublist exists', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: { item: [] }
                }
            });
            expect(rec.hasSublist({ sublistId: 'item' })).toBe(true);
        });

        test('should return false when sublist does not exist', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder',
                    sublists: {}
                }
            });
            expect(rec.hasSublist({ sublistId: 'item' })).toBe(false);
        });

        test('should return false when sublists property itself is absent', () => {
            const rec = new Record({
                objData: {
                    id: 1,
                    type: 'salesorder'
                }
            });
            expect(rec.hasSublist({ sublistId: 'item' })).toBe(false);
        });

        test('should throw when sublistId is missing', () => {
            const rec = new Record({ objData: { id: 1, type: 'salesorder', sublists: {} } });
            expect(() => {
                rec.hasSublist({});
            }).toThrow(/SSS_MISSING_REQD_ARGUMENT: sublistId/);
        });
    });
});
