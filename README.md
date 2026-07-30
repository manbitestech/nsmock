# nsmock

A Jest-based unit test framework that enables rapid offline development of NetSuite SuiteScript code.

`nsmock` provides a set of mock objects and a Jest configuration that allows you to test your SuiteScripts in a local environment, without needing to connect to a NetSuite instance. This enables faster development cycles and more robust testing.

## Core Principles. 
This project is designed to mock NetSuite's native behavior, i.e. real SuiteScript use cases. 
In all cases, tailor functions and tests to reflect NetSuite's real world behavior.
`nsmock` is designed to be a developer's tool, not an exact simulation of NetSuite. It does not guarantee your code will work.



## Installation

To use `nsmock` in your project, install it as a dev dependency:

```bash
npm install --save-dev nsmock
```

## Usage

To use `nsmock`, you need to configure your Jest setup to use its custom stubs. Below is an example of a `jest.config.js` file.
`nsmock` adds stubs which override the Oracle defaults.

```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing");
const nsMockConfig = require("nsmock");

module.exports = SuiteCloudJestConfiguration.build({
    projectFolder: 'src',
    projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
    verbose: true,
    testMatch: ['<rootDir>/__tests__/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    customStubs: nsMockConfig
});
```

## Example

Here's an example of how you can write a test using `nsmock`:

```javascript
import { Record } from "N/record/instance";
import record from "N/record";

const orderParams = {
    header: {
        id: 11211,
        type: record.Type.SALES_ORDER
    },
    fields: {
        memo: {
            value: "Hello Furman"
        }
    }
};

const salesOrder = new Record({objData: orderParams});
record._preload([salesOrder]);

describe("simple getValue test", () => {
    it("gets the value of 'memo' field correctly", () => {
        const order = record.load({id: 11211, type: record.Type.SALES_ORDER});
        const memo = order.getValue({fieldId:'memo'});
        expect(memo).toBe("Hello Furman");
    });
});
```

## Companion Project

For a more detailed and practical example of how to use `nsmock`, check out the companion project: [usage-testing](https://github.com/manbitestech/nsmock-usage-testing).

## Repository

The source code for `nsmock` is available on GitHub: [https://github.com/manbitestech/nsmock](https://github.com/manbitestech/nsmock)

## License

This project is licensed under the ISC License.