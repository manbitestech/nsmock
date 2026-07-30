const { Record } = require('../customStubs/record/RecordInstance');

describe('setText — body field text setter', () => {
    test('should set text on a body field', () => {
        const rec = new Record({
            objData: {
                id: 1,
                type: 'salesorder',
                fields: {
                    entity: { value: 101, text: 'Old Name' }
                }
            }
        });

        rec.setText({ fieldId: 'entity', text: 'Acme Inc' });

        expect(rec.getText({ fieldId: 'entity' })).toBe('Acme Inc');
    });

});
