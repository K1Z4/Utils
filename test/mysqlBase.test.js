import { setConfig } from "../src/connectionProvider.js";
import mysqlBase from "../src/mysqlBase.js";
import assert from 'node:assert/strict';

await setConfig({
    "host": "localhost",
    "user": "root",
    "password": "Miseequuel69",
    "database": "test",
    "dateStrings": true,
    "port": 3306
});


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

console.log("Running tests...")


await FriendRepository.deleteAllFriends();
const firstFriendName = "test";
const friendId = await FriendRepository.insertFriend({ name: firstFriendName, isArchived: true });
assert.strictEqual(typeof friendId, "number");
console.log("Added friend with id", friendId);

await FriendRepository.insertFriend({ name: "Jake", isArchived: false });

const firstFriend = await FriendRepository.getFriend(friendId);
assert.strictEqual(firstFriend.name, firstFriendName);
assert.strictEqual(firstFriend.isArchived, true);
console.log("Got first friend", firstFriend);

const friends = await FriendRepository.getFriends();
assert.strictEqual(friends.length, 2);
console.log(`Got ${friends.length} friends`, friends);

const updatedName = "test2";
await FriendRepository.updateFriend(friendId, updatedName);
const updatedFriend = await FriendRepository.getFriend(friendId);
assert.strictEqual(updatedFriend.name, updatedName);

await FriendRepository.addFriends([{ name: "test3" }, { name: "test4" }]);
assert.strictEqual((await FriendRepository.getFriends()).length, 4);

await FriendRepository.addFriends([{ name: "test3" }, { name: "test4", invalid: "invalid" }]).catch(() => { });
assert.strictEqual((await FriendRepository.getFriends()).length, 4, "Transaction should have been rolled back");


console.log("All tests passed!")