
class Record {
    constructor(opt) {
        this._objData = opt.objData
        this.type = opt.objData.header.type
        this.id = opt.objData.header.id
    }
    getValue(opt){
        return this._objData.fields[opt.fieldId].value
    }
}

module.exports = {
    Record
}