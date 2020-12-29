var helper = require('helperFunctions');

var memoryHandler = {};

memoryHandler.cleanUp = function() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            helper.log('Clearing non-existent creep ' + name);
        }
    }

    for (var name in Memory.rooms) {
        if (!Game.rooms[name]) {
            delete Memory.rooms[name];
            helper.log('Clearing non-existent room ' + name);
        }
    }

    for (var name in Memory.flags) {
        if (!Game.flags[name]) {
            delete Memory.flags[name];
            helper.log('Clearing non-existent flag ' + name);
        }
    }
};

module.exports = memoryHandler;