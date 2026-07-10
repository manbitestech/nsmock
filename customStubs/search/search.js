const SearchInstance = require('./SearchInstance');
const nsSearchDefault = require('@oracle/suitecloud-unit-testing/stubs/search/search');

class nsMockSearch {
    constructor() {
        this._resultSet = new ResultSet(inputJson)
        this._getResultSet = function() { return this._resultSet }

        this._setResults = (type, results) => {
            this._results[type] = results.map(r => ({
                ...r,
                id: r.id || Math.floor(Math.random() * 100000),
                recordType: type,
                getValue: (column) => r.values[typeof column === 'string' ? column : column.name],
                getText: (column) => r.values[typeof column === 'string' ? column : column.name],
            }));
        };

        this._getResults = (type, filters) => {
            let results = this._results[type] || [];

            if (filters && filters.length > 0) {
                results = results.filter(res => {
                    return filters.every(filter => {
                        const [field, op, value] = filter;
                        if (op === 'is') {
                            return res.values[field] == value;
                        }
                        return true;
                    });
                });
            }

            return results;
        };

        this._clearResults = () => {
            this._results = {};
        }

        this.create = (options) => {
            return new SearchInstance(options, this);
        };

        this.Type = nsSearchDefault.Type;
        this.Operator = nsSearchDefault.Operator;
        this.Column = nsSearchDefault.Column;
    }
}

//module.exports = new nsMockSearch();


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

