let pool = null;

export function setPool(newPool) {
    if (pool) {
        throw new Error("A pool has already been set");
    }

    pool = newPool;
}

export function getPool() {
    if (!pool) {
        throw new Error(
            "No pool as been setup. Ensure 'await poolProvider.setPool(pool)' is called on startup"
        );
    }

    return pool;
}