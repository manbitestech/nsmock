const { Record } = require('../customStubs/record/RecordInstance');
const record = require('../customStubs/record/record');

describe('Record Subrecord Methods', () => {
    beforeEach(() => {
        record._clearDb();
    });

    describe('getSublistSubrecord - reading existing subrecords', () => {
        test('should retrieve address subrecord from addressbook sublist', () => {
            const customerData = {
                id: 123456,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: [
                        {
                            addressid: { value: 1111 },
                            addressbookaddress: {
                                value: 77778,
                                subrecord: {
                                    fields: {
                                        addr1: { value: '4521 Maple Ridge Ave' },
                                        addr2: { value: 'Suite 100' },
                                        city: { value: 'Denver' },
                                        state: { value: 'CO' },
                                        zip: { value: '80203' }
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            const customer = new Record({ objData: customerData });
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123456, type: 'customer' });
            const addressSubrecord = loadedCustomer.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: 0
            });

            expect(addressSubrecord).toBeDefined();
            expect(addressSubrecord.getValue({ fieldId: 'addr1' })).toBe('4521 Maple Ridge Ave');
            expect(addressSubrecord.getValue({ fieldId: 'city' })).toBe('Denver');
            expect(addressSubrecord.getValue({ fieldId: 'state' })).toBe('CO');
        });

        test('should throw error when subrecord JSON is not set up', () => {
            const customerData = {
                id: 123457,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: [
                        {
                            addressid: { value: 1111 }
                            // No addressbookaddress field
                        }
                    ]
                }
            };

            const customer = new Record({ objData: customerData });
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123457, type: 'customer' });
            expect(() => {
                loadedCustomer.getSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress',
                    line: 0
                });
            }).toThrow(/subrecord JSON not correctly set up/);
        });

        test('should throw error when line does not exist', () => {
            const customerData = {
                id: 123458,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: []
                }
            };

            const customer = new Record({ objData: customerData });
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123458, type: 'customer' });
            expect(() => {
                loadedCustomer.getSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress',
                    line: 0
                });
            }).toThrow(/subrecord JSON not correctly set up/);
        });
    });

    describe('getCurrentSublistSubrecord - dynamic mode reading', () => {
        test('should retrieve subrecord for current line in dynamic mode', () => {
            const customerData = {
                id: 123459,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: [
                        {
                            addressid: { value: 1111 },
                            addressbookaddress: {
                                value: 77778,
                                subrecord: {
                                    fields: {
                                        addr1: { value: '100 Main St' },
                                        city: { value: 'Boston' }
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            const customer = new Record({ objData: customerData });
            customer._setDynamic(true);
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123459, type: 'customer' });
            loadedCustomer.selectLine({ sublistId: 'addressbook', line: 0 });

            const addressSubrecord = loadedCustomer.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
            });

            expect(addressSubrecord).toBeDefined();
            expect(addressSubrecord.getValue({ fieldId: 'addr1' })).toBe('100 Main St');
        });

        test('should throw error when not in dynamic mode', () => {
            const customerData = {
                id: 123460,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: []
                }
            };

            const customer = new Record({ objData: customerData });
            // Not setting dynamic mode
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123460, type: 'customer' });
            expect(() => {
                loadedCustomer.getCurrentSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress'
                });
            }).toThrow(/only supported in dynamic mode/);
        });
    });

    describe('createCurrentSublistSubrecord - dynamic mode creation', () => {
        test('should create new subrecord on current line', () => {
            const customerData = {
                id: 123461,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: []
                }
            };

            const customer = new Record({ objData: customerData });
            customer._setDynamic(true);
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123461, type: 'customer' });
            loadedCustomer.selectNewLine({ sublistId: 'addressbook' });

            const newAddress = loadedCustomer.createCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
            });

            // Set values on the subrecord
            newAddress.setValue({ fieldId: 'addr1', value: '500 New Address Ln' });
            newAddress.setValue({ fieldId: 'city', value: 'Austin' });
            newAddress.setValue({ fieldId: 'state', value: 'TX' });

            // Commit the line
            loadedCustomer.commitLine({ sublistId: 'addressbook' });

            // Verify the subrecord was saved
            expect(loadedCustomer.getLineCount({ sublistId: 'addressbook' })).toBe(1);
            const savedSubrecord = loadedCustomer.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: 0
            });
            expect(savedSubrecord.getValue({ fieldId: 'addr1' })).toBe('500 New Address Ln');
            expect(savedSubrecord.getValue({ fieldId: 'city' })).toBe('Austin');
        });

        test('should throw error when not in dynamic mode', () => {
            const customerData = {
                id: 123462,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: []
                }
            };

            const customer = new Record({ objData: customerData });
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123462, type: 'customer' });
            expect(() => {
                loadedCustomer.createCurrentSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress'
                });
            }).toThrow(/only supported in dynamic mode/);
        });
    });

    describe('Subrecord value setting and getting', () => {
        test('should set and get values on subrecord', () => {
            const customerData = {
                id: 123463,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: [
                        {
                            addressid: { value: 1111 },
                            addressbookaddress: {
                                value: 77778,
                                subrecord: {
                                    fields: {
                                        addr1: { value: 'Original Address' }
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            const customer = new Record({ objData: customerData });
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123463, type: 'customer' });
            const addressSubrecord = loadedCustomer.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: 0
            });

            // Verify original value
            expect(addressSubrecord.getValue({ fieldId: 'addr1' })).toBe('Original Address');

            // Set new value
            addressSubrecord.setValue({ fieldId: 'addr1', value: 'Modified Address' });
            expect(addressSubrecord.getValue({ fieldId: 'addr1' })).toBe('Modified Address');
        });

        test('should not allow saving subrecord directly', () => {
            const customerData = {
                id: 123464,
                type: 'customer',
                fields: {},
                sublists: {
                    addressbook: [
                        {
                            addressid: { value: 1111 },
                            addressbookaddress: {
                                value: 77778,
                                subrecord: {
                                    fields: {}
                                }
                            }
                        }
                    ]
                }
            };

            const customer = new Record({ objData: customerData });
            record._preload([customer]);

            const loadedCustomer = record.load({ id: 123464, type: 'customer' });
            const addressSubrecord = loadedCustomer.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: 0
            });

            expect(() => {
                addressSubrecord.save();
            }).toThrow(/Unable to save subrecord/);
        });
    });
});
