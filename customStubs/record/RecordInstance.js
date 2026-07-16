
class Record {
    constructor(opt) {
        // Record Setup.
        const {objData} = opt
        this.type = objData.type
        this.id = objData.id
        this._id = objData._id
        this._fields = objData.fields || {}
        this._sublists = objData.sublists || {}
        this._subrecords = objData.subrecords || {}
        this._currentLineMarker = {}
        this._pendingLine = {}
        // Utility methods and properties related to nsmock framework.
        this._isDynamic = false;
        this._setDynamic = function(bool) {
            this._isDynamic = bool;
        }
        // Methods for Record body.
        this.getValue = this._buildGetValue(false)
        this.getText = this._buildGetValue(true)
        this.setValue = jest.fn(this._buildSetValue())
        this.save = jest.fn(function() {
            if (this.isSubrecord === true) {
                throw {"message": "Unable to save subrecord"}
            }
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
            const {sublistId} = opt
            if (sublistId === undefined) {
                throw {"message": "sublistId not supplied"}
            }
            if (this._sublists[sublistId] === undefined) {
                throw {"message": "sublist not initialized in test setup"}
            }
            return this._sublists[sublistId].length
        })

        this.getSublistSubrecord = jest.fn(function(options) {
            if (typeof options !== 'object' || Array.isArray(options)) {
                throw {message: "Not Implemented: Serial Parameters for record.getSublistSubrecord. Use JSON input."}
            }
            const { sublistId, fieldId, value } = options;

            if (!sublistId) throw new Error('SSS_MISSING_REQD_ARGUMENT: sublistId');
            if (!fieldId) throw new Error('SSS_MISSING_REQD_ARGUMENT: fieldId');
            if (!value) throw new Error('SSS_MISSING_REQD_ARGUMENT: value');

            // this._enforceDynamic("getSublistSubrecord", false)
            if(typeof arguments[0] === 'object'){
                sublistId = arguments[0].sublistId
                fieldId = arguments[0].fieldId
                line = arguments[0].line
            } else {
                throw "Serial params not implemented for getSublistSubrecord"
            }
            const source = this._recordValues.sublists[sublistId][line]?.[fieldId].subrecord
            if (source){
                return new Record(source, {
                    isSubrecord: true
                })
            }
            throw {message: "subrecord JSON not correctly set up within sublist line. "}
        })
        this.getCurrentSublistSubrecord = jest.fn(function() {
            this._enforceDynamic("getCurrentSublistSubrecord", true)
            // todo: make this pull from the actual subrecord, same as the other 'getCurrent' functions.
            return new Record(undefined, {isSubrecord: true})
        })

        this.insertLine = jest.fn(function(options) {
            if (typeof arguments[0] !== 'object' || Array.isArray(arguments[0])) {
                throw {message: "Not Implemented: Serial Parameters for record.insertLine. Use JSON input."}
            }
            const { sublistId, line, doSublistSourcing = false } = options;

            if (!sublistId) throw new Error('SSS_MISSING_REQD_ARGUMENT: sublistId');
            if (typeof line !== 'number' || line < 0) throw new Error('INVALID_LINE_NUMBER');

            // todo: STRICT VALIDATION: Reject truly invalid sublist IDs

            // 2. LAZY DATA INIT: Auto-create array if this valid sublist hasn't been touched yet
            if (!this._sublists[sublistId]) {
                this._sublists[sublistId] = [];
            }

            const newLine = {};
            this._sublists[sublistId].splice(line, 0, newLine);

            if (doSublistSourcing) {
                // optional validation for sublist sourcing.
            }

            return this; // NetSuite returns the record object for chaining
        });


        this.selectLine = jest.fn(function() {
            let sublistId
            let line
            this._enforceDynamic("selectLine", true)
            if (typeof arguments[0] === 'object') {
                sublistId = arguments[0].sublistId
                line = arguments[0].line
            } else {
                sublistId = arguments[0]
                line = arguments[1]
            }
            this._currentLineMarker[sublistId] = line
        })
        this.selectNewLine = jest.fn(function() {
            let sublistId
            this._enforceDynamic("selectNewLine", true)
            if (typeof arguments[0] === 'object') {
                sublistId = arguments[0].sublistId
            } else {
                sublistId = arguments[0]
            }
            if (!this._sublists[sublistId]) {
                this._sublists[sublistId] = []
            }
            this._pendingLine[sublistId] = {}
            this._currentLineMarker[sublistId] = this._sublists[sublistId].length
        })
        this.commitLine = jest.fn(function() {
            let sublistId
            if (typeof arguments[0] === 'object') {
                sublistId = arguments[0].sublistId
            } else {
                sublistId = arguments[0]
            }
            if (!this._sublists[sublistId]) {
                this._sublists[sublistId] = []
            }
            this._sublists[sublistId].push(this._pendingLine[sublistId])
            this._pendingLine[sublistId] = null
            return this
        })

        this.removeLine = jest.fn(function(...args){
            const {sublistId, line} = args[0]
            if (!sublistId || line === undefined) {
                throw {"message": "removeLine: Input must include sublistId and line."}
            }

            const sublist = this._sublists[sublistId]
            if (!Array.isArray(sublist)) {
                throw {"message": "removeLine: Record sublist not initialized in nsMock object"}
            }
            if ((line + 1) > sublist.length) {
                throw {"message": "removeLine: Line does not exist in sublist"}
            }
            sublist.splice(line, 1)
        })
        this.setCurrentSublistValue = jest.fn((...args) => {
            this._enforceDynamic("setCurrentSublistValue", true)
            const { sublistId, fieldId, value } = typeof args[0] === 'object' ? 
                args[0] : {sublistId:args[0], fieldId:args[1], value:args[2]}
            if (!this._pendingLine[sublistId]) {
                this._pendingLine[sublistId] = {}
            }
            this._pendingLine[sublistId][fieldId] = { value: value }
        })
        this._buildSetSublistValue = function (isText){
            const finalKey = 'value' // todo: support 'text'
            return function(opt) {
                const {fieldId, sublistId, line, value} = opt
                if (this._sublists[sublistId][line] === undefined) {
                    this._sublists[sublistId][line] = {}
                }
                this._sublists[sublistId][line][fieldId] = {[finalKey]: value}
            }
        }
        this.setSublistValue = jest.fn(this._buildSetSublistValue())

        this.findSublistLineWithValue = jest.fn(function(options) {
            if (typeof options !== 'object' || Array.isArray(options)) {
                throw {message: "Not Implemented: Serial Parameters for record.findSublistLineWithValue. Use JSON input."}
            }
            const { sublistId, fieldId, value } = options;

            if (!sublistId) throw new Error('SSS_MISSING_REQD_ARGUMENT: sublistId');
            if (!fieldId) throw new Error('SSS_MISSING_REQD_ARGUMENT: fieldId');
            if (!value) throw new Error('SSS_MISSING_REQD_ARGUMENT: value');

            if (noInput(sublistId) || noInput(fieldId) || noInput(value, true)){
                throw({message: "findSublistLineWithValue must be called with sublistId, fieldId, and value."})
            }
            const targetSublist = this._sublists[sublistId]
            if (targetSublist && targetSublist.length > 0) {
                for (let j = 0; j < targetSublist.length; j++) {
                    const currentLine = targetSublist[j]
                    if (currentLine[fieldId]?.value == value) { // flexible NetSuite 'truthy' equivalence.
                        return j
                    }
                }
            }
            return -1
        })

        this._enforceDynamic = function(functionName, dynamicTrue=true) {
            const isError = (dynamicTrue === true && !this._isDynamic) ||
                (dynamicTrue === false && this._isDynamic)
            const qualifier = dynamicTrue ? "only" : "not"
            if (isError) {
                throw {message: functionName + " is " + qualifier + " supported in dynamic mode"}
            }
        }
    }

    _buildGetValue = function(getText) {
        const finalKey = getText === true ? 'text' : 'value'
        return function(opt) {
            // possible
            let fieldId
            if (typeof arguments[0] === 'object') {
                fieldId = arguments[0].fieldId
            } else {
                fieldId = arguments[0]
            }
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
            if (typeof parseInt(opt.line) !== 'number') {
                throw {"message": "line not supplied or non-numerical"}
            }
            const targetSublist = this._sublists[opt.sublistId];
            if (targetSublist === undefined) {
                throw "Sublist not initialized.";
            }
            return targetSublist[opt.line]?.[opt.fieldId]?.[finalKey]
        };
    }
    _buildGetCurrentSublistOutput = function(isText) {
        const finalKey = isText ? 'text' : 'value'
        const functionName = isText ? 'getCurrentSublistText' : 'getCurrentSublistValue'
        const outputFn = sublistQueryInput => {
            // todo: adapt to serial params input (alternate to JSON)
            this._enforceDynamic(functionName, true)
            const currentLineNumber = this._currentLineMarker[sublistQueryInput.sublistId]
            return this._sublists[sublistQueryInput.sublistId]?.[currentLineNumber]?.[sublistQueryInput.fieldId]?.[finalKey]
        }
        return outputFn
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

Record._clone = function(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
        const arrCopy = [];
        for (let i = 0; i < obj.length; i++) {
            arrCopy[i] = Record._clone(obj[i]);
        }
        return arrCopy;
    }

    const objCopy = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            objCopy[key] = Record._clone(obj[key]);
        }
    }
    return objCopy;
}
Record._cleanJson = function(obj, mergeData){
    const clone = Record._clone(obj)
    if (!mergeData || typeof mergeData !== 'object' || Object.keys(mergeData).length == 0){
        return clone
    }
    if (mergeData.id) {
        clone.id = mergeData.id
    }
    if (mergeData.hasOwnProperty("type") && mergeData.type !== clone.type){
        throw {"message": "Unable to merge across record types"}
    }
    const sets = ["fields", "sublists"]
    for (let k = 0; k < sets.length; k++){
        const set = sets[k]
        if (!mergeData.hasOwnProperty(set)){
            continue
        }
        if (!clone[set] || typeof clone[set] !== 'object'){
            clone[set] = {}
        }
        const mergeProperties = Object.keys(mergeData[set])
        for (let j = 0; j < mergeProperties.length; j++){
            const e = mergeProperties[j]
            clone[set][e] = Record._clone(mergeData.fields[e])
        }
    }
    return clone
}

module.exports = {
    Record
}
