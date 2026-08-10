# @manbitestech/nsmock

A Jest-based unit test framework that enables rapid offline development of NetSuite SuiteScript code.

`@manbitestech/nsmock` provides a set of mock objects and a Jest configuration that allows you to test your SuiteScripts in a local environment, without needing to connect to a NetSuite instance. This enables faster development cycles and more robust testing.

> **Note on the name:** the package is published under the scoped name `@manbitestech/nsmock`. The unscoped name `nsmock` is unavailable on the npm registry (blocked as too similar to the existing `ns-mock` package), so all installs and requires use the scoped form.

## Core Principles

This project is designed to mock NetSuite's native behavior, i.e. real SuiteScript use cases.
In all cases, tailor functions and tests to reflect NetSuite's real world behavior.
`nsmock` is designed to be a developer's tool, not an exact simulation of NetSuite. It does not guarantee your code will work.

## Installation

To use `@manbitestech/nsmock` in your project, install it as a dev dependency:

```bash
npm install --save-dev @manbitestech/nsmock
```

## Usage

To use `@manbitestech/nsmock`, you need to configure your Jest setup to use its custom stubs. Below is an example of a `jest.config.js` file.
`@manbitestech/nsmock` adds stubs which override the Oracle defaults.

```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing");
const nsMockConfig = require("@manbitestech/nsmock");

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

Here's an example of how you can write a test using `@manbitestech/nsmock`:

```javascript
import Record from "N/record/instance";
import record from "N/record";

const salesOrder = new Record({
    objData: {
        id: 11211,
        type: record.Type.SALES_ORDER,
        fields: {
            memo: { value: "Hello Furman" }
        }
    }
});
record._preload([salesOrder]);

describe("simple getValue test", () => {
    it("gets the value of 'memo' field correctly", () => {
        const order = record.load({ id: 11211, type: record.Type.SALES_ORDER });
        const memo = order.getValue({ fieldId: 'memo' });
        expect(memo).toBe("Hello Furman");
    });
});
```

## Supported Modules

`@manbitestech/nsmock` provides custom stubs for the following NetSuite modules:

| Module | Highlights |
|--------|-----------|
| `N/record` | `create`, `load`, `save`, `transform`, `getValue`/`setValue`, `getText`/`setText`, standard & dynamic sublists, subrecords, `isDynamic` |
| `N/record/instance` | The `Record` class (exported directly) |
| `N/search` | `create`, `run`, `ResultSet.each`/`asMappedResults`, `Type`/`Operator` enums |
| `N/error` | `error`, `SuiteScriptError`, `UserEventError` |
| `N/http` | `get`, `post`, `put`, `delete`, `request` with configurable responses |
| `N/https` | `get`, `post`, `put`, `delete`, `request`, `createSecretKey`, `createSecureString` |

### Test utilities

The stubs expose underscore-prefixed helpers for seeding state in tests:

- `record._preload(recordOrArray)` — seed records for `load()`
- `record._precreate(recordOrArray)` — register records available for `create()`
- `record._startId(value)` — set the starting auto-assigned id
- `record._init()` / `record._clearDb()` — reset state between tests
- `Record._initType(type)` — create a bare record of a given type
- `search._setResults(type, results)` / `search._clearResults()` — seed search results
- `http._setResponse(config)` / `https._setResponse(config)` — configure mock responses

## Companion Project

For a more detailed and practical example of how to use `@manbitestech/nsmock`, check out the companion project: [usage-testing](https://github.com/manbitestech/nsmock-usage-testing).

## Repository

The source code for `@manbitestech/nsmock` is available on GitHub: [https://github.com/manbitestech/nsmock](https://github.com/manbitestech/nsmock)

## License

This project is licensed under the ISC License.
