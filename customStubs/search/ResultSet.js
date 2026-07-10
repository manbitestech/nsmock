class ResultSet {
  _counter = 0
  count = 0

  /**
   * Outputs a mock object with an instance.each method that can iterate and return the search results line by line
   * @param {Array} inputJson Array of records to be output. JSON structure given above.
   * Please see 'nsmock-oop-test' and other tests for examples of usage.
   */
  constructor (inputJson) {
    this._resultValues = inputJson || []
    this.count = this._resultValues.length
  }

  each = jest.fn(function(func) {
    for (let k = 0; k < this._resultValues.length; k++) {
      const resultRow = this._resultValues[k]
      const resultObj = {
        id: resultRow.id,
        getValue: fieldId => {
          const isFieldArray = Array.isArray(resultRow.values[fieldId])
          let isFieldObject = typeof resultRow.values[fieldId] === 'object' && resultRow.values[fieldId][0].hasOwnProperty('value')

          if(isFieldArray) {
            isFieldObject = typeof resultRow.values[fieldId][0] === 'object' && resultRow.values[fieldId][0].hasOwnProperty('value')
          }

          if(isFieldArray && isFieldObject) {
            return resultRow.values[fieldId][0].value
          }
          else if (isFieldArray && !isFieldObject) {
            return resultRow.values[fieldId][0]
          }
          else if (isFieldObject && !isFieldArray) {
            return resultRow.values[fieldId].value
          }

          return resultRow.values[fieldId]
        }
      }
      const retVal = func(resultObj)
      if (retVal !== true) {
        break
      }
    }
  })
  asMappedResults = jest.fn(() => {
    return this._resultValues;
  })
}


module.exports = ResultSet;