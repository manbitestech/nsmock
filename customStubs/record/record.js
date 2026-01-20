
const nsRecordDefault = require('@oracle/suitecloud-unit-testing/stubs/record/record')
class nsMockRecord {
    constructor (options) {
        this.Type = nsRecordDefault.Type
        this._database = []
        this._cancreate = {}
        this._preload = function(recordArray) {
            recordArray.forEach(rec => {
                // Needs Type and Id. ID will be unavailable until the record is saved.
                if (rec.type === undefined || rec.id === undefined) {
                    throw new Error("Record must have type and id");
                }
                this._database.push(rec)
            })
        }
        this._precreate = function(recordArray) {
            recordArray.forEach(rec => {
                // Needs Type and Id. ID will be unavailable until the record is saved.
                if (rec.type === undefined || rec.id === undefined) {
                    throw new Error("Record must have type and id");
                }
                if (this._cancreate[rec.type] === undefined) {
                    this._cancreate[rec.type] = []
                }
                this._cancreate[rec.type].push(rec)
            })
        }
        
        this.load = function(opt) {
            for (let j = 0; j < this._database.length; j++) {
                const rec = this._database[j]
                if (rec.type === opt.type && rec.id === opt.id){
                    return rec
                }
                throw ("Record Not Found")
            }
        }
        this.create = function(opt) {
            if (opt.type === undefined) {
                throw new Error("Type is required to create a record");
            }
            if (this._cancreate[opt.type] === undefined) {
                throw new Error({message: "Record must be initialized with _precreate to create"})
            }
            let can = this._cancreate[opt.type].shift()
            can._id = can.id 
            can.id = undefined // ID is hidden until saved. 
            return can
        }
    }
}

module.exports = new nsMockRecord();
