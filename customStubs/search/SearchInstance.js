const ResultSet = require('./ResultSet');

class SearchInstance {
    constructor(options, mockSearch) {
        this.searchType = options.type;
        this.filters = options.filters;
        this.columns = options.columns;
        this.mockSearch = mockSearch;
    }

    /**
     * "Runs" the search by fetching the mock results that match the search filters.
     * @returns {ResultSet} A new ResultSet containing the mock data.
     */
    run() {
        const results = this.mockSearch._getResults(this.searchType, this.filters);
        return new ResultSet(results);
    }
}

module.exports = SearchInstance;
