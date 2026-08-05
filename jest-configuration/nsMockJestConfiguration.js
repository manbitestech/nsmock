
const NSMOCK_PATH = 'nsmock'
const CUSTOM_STUBS_PATH = `${NSMOCK_PATH}/customStubs`

const CUSTOM_STUBS = [
    {
        module: 'N/record',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/record/record.js`
    },
    {
        module: 'N/record/instance',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/record/RecordInstance.js`
    },
    {
        module: 'N/search',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/search/search.js`
    },
    {
        module: 'N/error',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/error/error.js`
    },
    {
        module: 'N/error/suiteScriptError',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/error/SuiteScriptError.js`
    },
    {
        module: 'N/error/userEventError',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/error/UserEventError.js`
    },
    {
        module: 'N/http',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/http/http.js`
    },
    {
        module: 'N/https',
        path: `<rootDir>/node_modules/${CUSTOM_STUBS_PATH}/https/https.js`
    }
]

module.exports = CUSTOM_STUBS
