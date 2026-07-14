
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

    _preload(recordArray) {
        recordArray.forEach(rec => {
            // Needs Type and Id. ID will be unavailable until the record is saved.
            if (rec.type === undefined || rec.id === undefined) {
                throw new Error("Record must have type and id");
            }
            this._database.push(rec)
        })
    }


    _precreate(recordArray) {
        recordArray.forEach(rec => {
            // Needs Type and Id. ID will be unavailable until the record is saved.
            if (rec.type === undefined || rec._id === undefined) {
                throw new Error("Record must have type and hidden id ('_id:1234')");
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

        return outputRec
    }
}


module.exports = new nsMockRecord(); // instantiated singleton; name it 'record'.


