class ResultSet {
    constructor(results) {
        this.results = results || [];
    }

    /**
     * Iterates over each result in the set.
     * @param {function} callback - The function to call for each result.
     *   The callback receives a mock 'Result' object.
     */
    each(callback) {
        for (const result of this.results) {
            // The callback returns `true` to continue, `false` to stop.
            if (callback(result) === false) {
                break;
            }
        }
    }

    /**
     * Gets a range of results.
     * @param {Object} options - Options containing start and end index.
     * @returns {Array<Object>} A slice of the results array.
     */
    getRange(options) {
        const start = options.start || 0;
        const end = options.end || 1000;
        return this.results.slice(start, end);
    }
}

module.exports = ResultSet;