"use strict";
const { v4: uuidv4 } = require('uuid');

module.exports = class {
    static newGuid() {
        return uuidv4();
    }
};