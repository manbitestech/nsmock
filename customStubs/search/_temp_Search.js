
class Search {
  _resultSet = {}
  _recordLookupListObjects = []

  /**
   * Outputs a mock object with an instance.each method that can iterate and return the search results line by line.
   * @param {Array} inputJson Array of records to be output. JSON structure given above.
   * Please see 'nsmock-oop-test' and other tests for examples of usage.
   */
  constructor (inputJson) {
    this._resultSet = new ResultSet(inputJson)
  }

  _getResultSet () { return this._resultSet }

  /**
   * @description given a lookup result, with an id and type
   * @param {{id: number, type: String, key:[{value: number, text: String}]}}object
   */
  addLookupFieldData = (object) => {
    this._recordLookupListObjects.push(object)
  }

  run = jest.fn(() => this._getResultSet())
  runPaged = jest.fn(() => this._getResultSet())
  lookupFields = jest.fn((options) => {
    const foundValues = this._recordLookupListObjects.filter((x) => x.id === options.id && x.type === options.type)
    const pick = (o, ...props) => {
      return Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})));
    };

    return foundValues.map((v, i, a) => { return pick(v, options.columns)})[0]
  })
}

module.exports = Search

