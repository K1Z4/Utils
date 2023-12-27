# Utils
Mostly mysql utilities for Node.js

```bash
npm install @kiza/utils
```

## Setup connection string

Run once on startup:

```js
const { connectionProvider } = require("@kiza/utils");
const config = require("config");
await connectionProvider.setConfig(config.database);
```

Where `config.database` is the object which will be passed to `mysql2.createConnection`

Example of config: 

```json
{
    "host": "localhost",
    "user": "root",
    "password": "password",
    "database": "mydb",
    "dateStrings": true,
    "port": 3306,
    "charset": "utf8mb4"
}
```

## Use mysqlBase

See example in testApp.js

Create your repositories like:

```js
const { mysqlBase } = require("@kiza/utils")

module.exports = class extends mysqlBase {
    static getJobs(siteId) {
        return this.all("SELECT * FROM job WHERE siteId = ? ORDER BY posted DESC", [siteId]);
    }
}
```

Transactions:

```js
const { mysqlBase } = require("@kiza/utils")

module.exports = class extends mysqlBase {
    static addJobs(job, job2) {
        return this.inTransacation(async con => {
            await this.insert("INSERT INTO job SET ?", job, con);
            await this.insert("INSERT INTO job SET ?", job2, con);
        });
    }
}
```

## Publish package

Note to self

```bash
npm publish --access public
```

## Change log

### v4

- BIT maps to boolean automatically

### v3 

- moved es6 imports