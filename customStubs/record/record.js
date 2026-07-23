
const nsRecordDefault = require('@oracle/suitecloud-unit-testing/stubs/record/record')
const {Record} = require('./RecordInstance')

class nsMockRecord {
    constructor (options) {
        this.Type = nsRecordDefault.Type
        this._database = []
        this._cancreate = {}
        this.load = jest.fn(this.load.bind(this))
        this.create = jest.fn(this.create.bind(this))
    }


    _clearDb() {
        this._database = []
    }

    _init() {
        this._database = []
        this._cancreate = {}
    }

    _preload(recordArray) {
        recordArray.forEach(rec => {
            // Needs Type and Id. ID will be unavailable until the record is saved.
            if (rec.type === undefined || rec.id === undefined) {
                throw new Error("Record must have type and id");
            }
            this._database.push(rec)
        })
    }


    _precreate(recordData) {
        // Support both array format (legacy) and object format {type: [records]}
        // Object format keys can be strings ('customer') or record.Type enums (record.Type.CUSTOMER)
        if (Array.isArray(recordData)) {
            // Legacy: array of records
            recordData.forEach(rec => {
                if (rec.type === undefined || rec._id === undefined) {
                    throw new Error("Record must have type and hidden id ('_id:1234')");
                }
                if (this._cancreate[rec.type] === undefined) {
                    this._cancreate[rec.type] = []
                }
                this._cancreate[rec.type].push(rec)
            })
        } else {
            // New: object format {[record.Type.CUSTOMER]: [rec1, rec2], [record.Type.SALES_ORDER]: [rec3]}
            Object.keys(recordData).forEach(type => {
                const records = recordData[type]
                if (!Array.isArray(records)) {
                    throw new Error(`_precreate: value for type '${type}' must be an array`)
                }
                // Normalize type key - handle both 'customer' and record.Type.CUSTOMER
                const typeKey = type.toLowerCase()
                if (this._cancreate[typeKey] === undefined) {
                    this._cancreate[typeKey] = []
                }
                records.forEach(rec => {
                    if (rec._id === undefined) {
                        throw new Error(`Record of type '${type}' must have hidden id ('_id:1234')`);
                    }
                    // Set type if not already set
                    if (rec.type === undefined) {
                        rec.type = typeKey
                    }
                    this._cancreate[typeKey].push(rec)
                })
            })
        }
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
}


module.exports = new nsMockRecord(); // instantiated singleton; name it 'record'.


