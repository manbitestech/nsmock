
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing")

module.exports = SuiteCloudJestConfiguration.build({
    projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
    projectFolder: '.',
    verbose: true,
});

