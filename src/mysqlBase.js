"use strict";

const connection = require("./connectionProvider")
const util = require("util")

class mysqlBase {
    /**
     * Probably don't use this...
     */
    static query(sqlString, params, con = connection.pool) {
        if (typeof(sqlString) !== 'string') throw new Error("sqlString must be a string");
        if (!typeof params == 'object') throw new Error("params must be an array");

        return new Promise((resolve, reject) => {
            con.query(sqlString, params, (error, results, fields) => {
                if (error) return reject(error);
                resolve(results, fields);
            });
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
        return this.query.apply(this, arguments).then(e => {
            if (e.length === 1) {
                return e[0];
            }

            throw new Error("Query returned more than one result");
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
        return this.query.apply(this, arguments).then(e => e.length > 0);
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
        return this.query.apply(this, arguments).then(e => e[0] || null);
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
        return this.query.apply(this, arguments).then(e => e.insertId);
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
    static async inTransacation(func) {
        if (typeof(func) !== "function") {
            throw new TypeError(`func is not a function`);
        }

        const getConnection = util.promisify(connection.pool.getConnection).bind(connection.pool);
        const con = await getConnection();

        try {
            const commit = util.promisify(con.commit).bind(con);
            const rollback = util.promisify(con.rollback).bind(con);
            const beginTransaction = util.promisify(con.beginTransaction).bind(con);

            await beginTransaction();

            try {
                const result = await func(con);
                await commit();
                return result;
            } catch (err) {
                //logger.warn(`rolling back transaction`)
                await rollback();
                //logger.warn(`transaction rolled back`)
                throw err;
            }
        } finally {
            con.release();
        }
    }
}

module.exports = mysqlBase;