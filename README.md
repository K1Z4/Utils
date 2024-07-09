# Utils
Mostly mysql utilities for Node.js

```bash
npm install @kiza/utils
```

## Setup connection string

Run once on startup:

```js
import { poolProvider } from "@kiza/utils";
import mysql from 'mysql2/promise';
import config from "config";

const pool = await mysql.createPool(config.database);
await poolProvider.setPool(pool);
```

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
import { mysqlBase } from "@kiza/utils";

export default class extends mysqlBase {
    static getJobs(siteId) {
        return this.all("SELECT * FROM job WHERE siteId = ? ORDER BY posted DESC", [siteId]);
    }
}
```

Transactions:

```js
import { mysqlBase } from "@kiza/utils";

export default class extends mysqlBase {
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

### v5

- Remove dep on mysql2 package, pool should be provided by consumer. This lets the consumer manage the mysql version
- Remove guid util. node:crypto should be used instead

### v4

- BIT maps to boolean automatically

### v3 

- moved es6 imports