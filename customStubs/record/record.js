
const nsRecordDefault = require('@oracle/suitecloud-unit-testing/stubs/record/record')
class nsMockRecord {
    constructor (options) {
        this.Type = nsRecordDefault.Type
        this._database = []
        this._preload = function(recordArray) {
            this._database = this._database.concat(recordArray)
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
    }
}

export default new nsMockRecord()
