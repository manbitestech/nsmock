
class Record {
    constructor(opt) {
        const {objData} = opt
        this.type = objData.header.type
        this.id = objData.header.id
        this._fields = objData.fields
        this._sublists = objData.sublists || {}
        this._subrecords = objData.subrecords || {}
        this._buildGetValue = function(getText) {
            const finalKey = getText === true ? 'text' : 'value'
            const builtFunction = function(opt) {
                return this._fields[opt.fieldId]?.[finalKey]
            }
            return builtFunction
        }
        this.getValue = this._buildGetValue(false)
        this.getText = this._buildGetValue(true)
    }
    getSublistValue(opt) {
        if (opt.sublistId === undefined) {
            throw "sublistId not supplied"
        }
        if (opt.fieldId === undefined) {
            throw "fieldId not supplied"
        }
        if (typeof opt.line !== 'number') {
            throw "line not supplied or non-numerical"
        }
        const sub = this._sublists[opt.sublistId]
        if (sub === undefined) {
            throw "Sublist not initialized."
        }
        return sub[opt.line]?.[opt.fieldId]?.value
    }
}

module.exports = {
    Record
}