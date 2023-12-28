import { getPool } from "./connectionProvider.js";

export default class {

    static query(sqlString, params, pool = getPool()) {
        return pool.query(sqlString, params).then(([rows, fields]) => {
            if (!fields) {
                return rows;
            }

            const bitFields = new Map();
            for (const field of fields) {
                // 16 === BIT
                if (field.type === 16) {
                    bitFields.set(field.name, true);
                }
            }

            // Convert BIT fields in rows to boolean
            if (bitFields.size > 0) {
                for (const row of rows) {
                    for (const [fieldName, _] of bitFields) {
                        if (row[fieldName] !== null) {
                            row[fieldName] = row[fieldName][0] === 1;
                        }
                    }
                }
            }

            return rows;
        });
    }

    /**
     * Returns the first result or throws an error if there are mutliple results.
     * @param {string} sqlString SQL string. Use '?' for parameter replacement
     * @param {any[]} params The parameters for your SQL query
     * @param {object} con Pool or single connection that is used for the query. 
     *     Ensure to pass the connection from the transcation if one exists.
     * @returns {object} The single result that was returned
     */
    static single(sqlString, params, con) {
        return this.query.apply(this, arguments).then(rows => {
            if (rows.length === 1) {
                return rows[0];
            }

            throw new Error(`Query returned ${rows.length} results`);
        });
    }

    /**
     * Returns true if the result contains at least one line.
     * @param {string} sqlString SQL string. Use '?' for parameter replacement
     * @param {any[]} params The parameters for your SQL query
     * @param {object} con Pool or single connection that is used for the query. 
     *     Ensure to pass the connection from the transcation if one exists.
     * @returns {boolean} Any results
     */
    static any(sqlString, params, con) {
        return this.query.apply(this, arguments).then(rows => rows.length > 0);
    }

    /**
     * Gets the first result or null from the query result.
     * @param {string} sqlString SQL string. Use '?' for parameter replacement
     * @param {any[]} params The parameters for your SQL query
     * @param {object} con Pool or single connection that is used for the query. 
     *     Ensure to pass the connection from the transcation if one exists.
     * @returns {object} The first result
     */
    static first(sqlString, params, con) {
        return this.query.apply(this, arguments).then(rows=> rows[0] || null);
    }

    /**
     * Doesn't augment the result of the query.
     * @param {string} sqlString SQL string. Use '?' for parameter replacement
     * @param {any[]} params The parameters for your SQL query
     * @param {object} con Pool or single connection that is used for the query. 
     *     Ensure to pass the connection from the transcation if one exists.
     * @returns {any[]} All results
     */
    static all(sqlString, params, con) {
        return this.query.apply(this, arguments);
    }

    /**
     * Gets the insertId after a query.
     * @param {string} sqlString SQL string. Use '?' for parameter replacement
     * @param {any[]} params The parameters for your SQL query
     * @param {object} con Pool or single connection that is used for the query. 
     *     Ensure to pass the connection from the transcation if one exists.
     * @returns {number} The insert Id
     */
    static insert(sqlString, params, con) {
        return this.query.apply(this, arguments)
            .then(rows => {
            if (typeof rows !== "object") {
                throw new Error(`Rows was not ResultSetHeader. Your query probably didn't insert anything`);
            }

            return rows.insertId;
        });
    }

    /**
     * @callback transactionCallback
     * @param {object} con The transaction connection. Use this connection for any queries within your transaction.
     */

    /**
     * Creates a transaction and passes the connection to 'func'
     * @param {transactionCallback} func Function gets invoked with a single 'con' parameter. 
     *     Ensure to use this connection for any queries within the function for them to be executed within the transaction.
     * @returns {any} The result of the passed func
     */
    static async inTransaction(func) {
        if (typeof (func) !== "function") {
            throw new TypeError(`func is not a function`);
        }

        const pool = getPool();
        const con = await pool.getConnection();

        try {
            await con.beginTransaction();

            try {
                const result = await func(con);
                await con.commit();
                return result;
            } catch (err) {
                await con.rollback();
                throw err;
            }
        } finally {
            await con.release();
        }
    }
}