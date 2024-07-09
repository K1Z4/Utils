import { setPool } from "../src/poolProvider.js";
import mysqlBase from "../src/mysqlBase.js";
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import test from 'node:test';

await setPool(() => mysql.createPool({
    "host": "localhost",
    "user": "root",
    "password": "Miseequuel69",
    "database": "test",
    "dateStrings": true,
    "port": 3306
}));

class FriendRepository extends mysqlBase {
    static getFriends() {
        return this.all("SELECT * FROM friend");
    }

    static deleteAllFriends() {
        return this.query("DELETE FROM friend");
    }

    static insertFriend(friend) {
        return this.insert("INSERT INTO friend SET ?", [friend]);
    }

    static updateFriend(id, name) {
        return this.query("UPDATE friend SET ? WHERE friendId = ?", [{ name }, id]);
    }

    static getFriend(id) {
        return this.single("SELECT * FROM friend WHERE friendId = ?", [id]);
    }

    static deleteFriend(id) {
        return this.query("DELETE FROM friend WHERE friendId = ?", [id]);
    }

    static addFriends(friends) {
        return this.inTransaction(async (con) => {
            for (const friend of friends) {
                await this.insert("INSERT INTO friend SET ?", [friend], con);
            }
        });
    }
}

test('Insert and retrieve friend', async (t) => {
    await FriendRepository.deleteAllFriends();
    const name = "test";
    const friendId = await FriendRepository.insertFriend({ name: name, isArchived: true });
    assert.strictEqual(typeof friendId, "number");

    const friend = await FriendRepository.getFriend(friendId);
    assert.strictEqual(friend.name, name);
    assert.strictEqual(friend.isArchived, true);
});

test('Retrieve all friends', async (t) => {
    await FriendRepository.deleteAllFriends();
    await FriendRepository.insertFriend({ name: "test", isArchived: true });
    await FriendRepository.insertFriend({ name: "Jake", isArchived: false });

    const friends = await FriendRepository.getFriends();
    assert.strictEqual(friends.length, 2);
});

test('Update friend', async (t) => {
    await FriendRepository.deleteAllFriends();
    const firstFriendName = "test";
    const friendId = await FriendRepository.insertFriend({ name: firstFriendName, isArchived: true });
    const updatedName = "test2";
    await FriendRepository.updateFriend(friendId, updatedName);
    const updatedFriend = await FriendRepository.getFriend(friendId);
    assert.strictEqual(updatedFriend.name, updatedName);
});

test('Add friends in transaction', async (t) => {
    await FriendRepository.deleteAllFriends();
    await FriendRepository.addFriends([{ name: "test3" }, { name: "test4" }]);
    assert.strictEqual((await FriendRepository.getFriends()).length, 2);
});

test('Rollback transaction on error', async (t) => {
    await FriendRepository.deleteAllFriends();
    await FriendRepository.addFriends([{ name: "test3" }, { name: "test4", invalid: "invalid" }]).catch(() => { });
    assert.strictEqual((await FriendRepository.getFriends()).length, 0, "Transaction should have been rolled back");
});

test('null BIT field remains null', async (t) => {
    const friendId = await FriendRepository.insertFriend({ name: "friend", isArchived: null });
    const friend = await FriendRepository.getFriend(friendId);
    await FriendRepository.deleteFriend(friendId);

    assert.strictEqual(friend.isArchived, null);
});