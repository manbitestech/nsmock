
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
]

module.exports = CUSTOM_STUBS
