// Import global helper functions
var helper = require("helperFunctions");

// Setup export object
var memoryHandler = {};

// A function to cleanup unused memory entries.
memoryHandler.cleanUp = function () {
    // Interate through all the creep entries in the Global Memory object
    for (var name in Memory.creeps) {
        // Check to see if the selected creep entry still exists as an object
        if (!Game.creeps[name]) {
            // Remove the creep entry as it no longer exists
            delete Memory.creeps[name];
            // Log the deletion of the creep entry to the in-game console
            helper.log("Clearing non-existent creep " + name);
        }
    }

    // Iterate through all the room entries in the Global Memory object
    for (var name in Memory.rooms) {
        // Check to see if the selected room entry is still visible to us
        if (!Game.rooms[name]) {
            // Remove the room entry as it is no longer visible to us
            delete Memory.rooms[name];
            // Log the removal of the room entry to the in-game console
            helper.log("Clearing non-existent room " + name);
        }
    }

    // Iterate through all the flag entries in the Global Memory object
    for (var name in Memory.flags) {
        // Check to see if the selected flag still exists
        if (!Game.flags[name]) {
            // Remove the flag entry as it no longer exists
            delete Memory.flags[name];
            // Log the removal of the flag entry to the in-game console
            helper.log("Clearing non-existent flag " + name);
        }
    }
};

// Export the memoryHandler object for use in other files
module.exports = memoryHandler;
