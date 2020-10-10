"use strict";

var config = null;
var pool = null;

const mysql = require('mysql');

module.exports = class {
    static setConfig(databaseConfig) {
        if (pool) {
            throw new Error("A config has already been set")
        }

        config = databaseConfig;
        pool = mysql.createPool(config);
    }

    static get pool() {
        if (!pool) {
            throw new Error("No pool as been setup")
        }
        
        return pool;
    }

    static get config() {
        if (!config) {
            throw new Error("No config as been defined")
        }
        
        return config;
    }
}