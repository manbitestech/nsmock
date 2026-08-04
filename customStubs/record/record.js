
const nsRecordDefault = require('@oracle/suitecloud-unit-testing/stubs/record/record')
const Record = require('./RecordInstance')

class nsMockRecord {
    constructor (options) {
        this.Type = nsRecordDefault.Type
        this._database = []
        this._cancreate = {}
        this._nextId = 1
        this._reversalTransforms = {
            'salesorder': ['returnauthorization'],
            'invoice': ['creditmemo'],
            'purchaseorder': ['vendorreturnauthorization'],
            'vendorbill': ['vendorcredit']
        }
        this.load = jest.fn(this.load.bind(this))
        this.create = jest.fn(this.create.bind(this))
        this.transform = jest.fn(this.transform.bind(this))
    }

    _startId(value) {
        this._nextId = value
    }

    _clearDb() {
        this._database = []
        this._nextId = 1
    }

    _init() {
        this._database = []
        this._cancreate = {}
        this._nextId = 1
    }

    _preload(recordOrArray) {
        const records = Array.isArray(recordOrArray) ? recordOrArray : [recordOrArray]
        records.forEach(rec => {
            if (rec.type === undefined) {
                throw new Error("Record must have type");
            }
            if (rec.id === undefined) {
                rec.id = this._nextId++
            }
            this._database.push(rec)
        })
    }


    _precreate(recordOrArray) {
        const records = Array.isArray(recordOrArray) ? recordOrArray : [recordOrArray]
        records.forEach(rec => {
            if (rec.type === undefined) {
                throw new Error("Record must have type");
            }
            if (rec._id === undefined) {
                rec._id = this._nextId++
            }
            if (this._cancreate[rec.type] === undefined) {
                this._cancreate[rec.type] = []
            }
            this._cancreate[rec.type].push(rec)
        })
    }

    

    load(opt) {
        for (let j = 0; j < this._database.length; j++) {
            const rec = this._database[j]
            if (rec.type === opt.type && rec.id == opt.id){ // ID may be passed in as a string.
                return rec
            }
        }
        throw ({"message":"Record Not Found"})
    }

    create(opt) {
        if (opt.type === undefined) {
            throw new Error("Type is required to create a record");
        }

        const canCreateWithinType = this._cancreate[opt.type]
        if (!canCreateWithinType || canCreateWithinType.length === 0) {
            throw new Error({message: "Record must be initialized with _precreate to create"})
        }
        const outputRec = this._cancreate[opt.type].shift()
        if (opt.isDynamic === true){
            outputRec._setDynamic(true)
        }
        if (opt.defaultValues) {
            Object.keys(opt.defaultValues).forEach(fieldId => {
            outputRec._fields[fieldId] = { value: opt.defaultValues[fieldId] }
            })
        }

        return outputRec
    }

    transform(opt) {
        const { fromType, fromId, toType, isDynamic, defaultValues } = opt;
        if (fromType === undefined) throw new Error('SSS_MISSING_REQD_ARGUMENT: fromType');
        if (fromId === undefined) throw new Error('SSS_MISSING_REQD_ARGUMENT: fromId');
        if (toType === undefined) throw new Error('SSS_MISSING_REQD_ARGUMENT: toType');

        const source = this.load({ type: fromType, id: fromId });

        const outputRec = new Record({
            objData: {
                type: toType,
                _id: this._nextId++,
                fields: Record._clone(source._fields),
                sublists: Record._clone(source._sublists)
            }
        });

        // Reversal transforms (e.g. Sales Order -> RMA) negate line quantities and amounts.
        const isReversal = (this._reversalTransforms[fromType.toLowerCase()] || []).includes(toType.toLowerCase());
        if (isReversal) {
            Object.keys(outputRec._sublists).forEach(sublistId => {
                outputRec._sublists[sublistId].forEach(line => {
                    ['quantity', 'amount'].forEach(fieldId => {
                        if (line[fieldId] && typeof line[fieldId].value === 'number') {
                            line[fieldId].value = -line[fieldId].value;
                        }
                    });
                });
            });
        }

        if (isDynamic === true) {
            outputRec._setDynamic(true);
        }
        if (defaultValues) {
            Object.keys(defaultValues).forEach(fieldId => {
                outputRec._fields[fieldId] = { value: defaultValues[fieldId] };
            });
        }

        return outputRec;
    }
}


module.exports = new nsMockRecord(); // instantiated singleton; name it 'record'.


