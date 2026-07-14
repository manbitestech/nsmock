const SearchInstance = require('./SearchInstance');
const nsSearchDefault = require('@oracle/suitecloud-unit-testing/stubs/search/search');

class nsMockSearch {
    constructor() {
        this._results = {};

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
        };

        this.create = (options) => {
            return new SearchInstance(options, this);
        };

        this.Type = nsSearchDefault.Type;
        this.Operator = nsSearchDefault.Operator;
        //this.Column = nsSearchDefault.Column;
    }
}

module.exports = new nsMockSearch();

