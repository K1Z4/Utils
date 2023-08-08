let config = null;
let pool = null;

import mysql from 'mysql2/promise';

export async function setConfig(databaseConfig) {
    if (pool) {
        throw new Error("A config has already been set");
    }
    config = databaseConfig;
    pool = await mysql.createPool(config);
}

export function getPool() {
    if (!pool) {
        throw new Error(
            "No pool as been setup. Ensure 'await connectionProvider.setConfig(config)' is called on startup"
        );
    }

    return pool;
}

export function getConfig() {
    if (!config) {
        throw new Error(
            "No config as been defined. Ensure 'await connectionProvider.setConfig(config)' is called on startup"
        );
    }

    return config;
}