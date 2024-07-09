let pool = null;

export async function setPool(func) {
    if (pool) {
        throw new Error("A pool has already been set");
    }

    pool = await func();
}

export function getPool() {
    if (!pool) {
        throw new Error(
            "No pool as been setup. Ensure 'await poolProvider.setPool(pool)' is called on startup"
        );
    }

    return pool;
}