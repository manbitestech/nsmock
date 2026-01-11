
class ResultSet {
    _counter = 0;
    count = 0;
    constructor(opt) {
        this._resultValues = opt || [];
        this.count = this._resultValues.length;
    }
}

each = jest.fn(function(callback) {
    for (let i = 0; i < this._resultValues.length; i++) {
        const row = this._resultValues[i];
        const rowObj = {
            id: row.id,
            getValue: function(fieldId) {
                // todo: some rigamarole was here about stored objects or arrays. Is it needed?
                return resultRow.values[fieldId];
            }
        }
        const retVal = callback(rowObj)
        if (retVal !== true) {
            break; // stop iteration if callback returns false
        }
        callback(rec, i);
    }   
})