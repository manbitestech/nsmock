
class Record {
    constructor(opt) {
        // Record Setup.
        const {objData} = opt
        this.type = objData.header.type
        this.id = objData.header.id
        this._fields = objData.fields || {}
        this._sublists = objData.sublists || {}
        this._subrecords = objData.subrecords || {}
        // Utility methods and properties related to nsmock framework.
        this._isDynamic = false;
        this._setDynamic = function(bool) {
            this.isDynamic = bool;
        }
        // Methods for Record body.
        this.getValue = this._buildGetValue(false)
        this.getText = this._buildGetValue(true)
        this.setValue = jest.fn(this._buildSetValue())
        this.save = jest.fn(function() {
            if (this.id === undefined && this._id !== undefined) {
                this.id = this._id // ID is hidden until saved.
            }
            return this.id
        });
        // Methods for Sublists.
        this.getSublistValue = jest.fn(this._buildGetSublistValue(false))
        this.getSublistText = jest.fn(this._buildGetSublistValue(true))
        this.setSublistValue = jest.fn() // todo: store values
        this.getLineCount = jest.fn(function(opt){
            if (opt.sublistId === undefined) {
                throw {"message": "sublistId not supplied"}
            }
            if (this._sublists[opt.sublistId] === undefined) {
                throw {"message": "sublist not initialized in test setup"}
            }
            return this._sublists[opt.sublistId].length
        })
        this.insertLine = jest.fn(function(opt) {
            if (opt.sublistId === undefined) {
                throw {"message": "sublistId not supplied"}
            } 
            if (this._sublists[opt.sublistId] === undefined) {
                this._sublists[opt.sublistId] = []
            }
            const insertedLine = {}
            // todo: if it is a subrecord, we need to create a new record instance
            this._sublists[opt.sublistId].splice(opt.line, 0, insertedLine)
        })
    }
    _buildGetValue = function(getText) {
            const finalKey = getText === true ? 'text' : 'value'
            return function(opt) {
                return this._fields[opt.fieldId]?.[finalKey]
            }
        }
    _buildGetSublistValue(getText) {
        return function(opt) {
            const finalKey = getText === true ? 'text' : 'value'
            if (opt.sublistId === undefined) {
                throw {"message": "sublistId not supplied"}
            }
            if (opt.fieldId === undefined) {
                throw {"message": "fieldId not supplied"}
            }
            if (typeof opt.line !== 'number') {
                throw {"message": "line not supplied or non-numerical"}
            }
            const sub = this._sublists[opt.sublistId];
            if (sub === undefined) {
                throw "Sublist not initialized.";
            }
            return sub[opt.line]?.[opt.fieldId]?.[finalKey]
        };
    }
    _buildSetValue() {
        // Ability to later add a setText method
        return function (opt) {
            if (this._fields[opt.fieldId] === undefined) {
                this._fields[opt.fieldId] = {}
            }
            this._fields[opt.fieldId].value = opt.value;
        }
    }
    
}

Record.sublistsWithSubrecords = {
    "addressbook": {
        "addressbookaddress": {"subrecord": {}}
    }
}

module.exports = {
    Record
}