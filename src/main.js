// Import custom prototypes
var prototypes = require("prototypeFunctions");
// Import creep handler to manage all creeps
var creepHandler = require("creepHandler");
// Import global helper functions
var helper = require("helperFunctions");
// Import memory handler to manage memory usage
var memoryHandler = require("memoryHandler");
// Import room handler to manage all owned/used rooms
var roomHandler = require("roomHandler");

module.exports.loop = function () {
    // Run memory cleanup to remove unused memory entries
    memoryHandler.cleanUp();
    // Run room handler to process room functions
    roomHandler.run();
    // Run creep handler to process creep functions
    creepHandler.run();

    // Check if there is 5000 units in the CPU bucket
    if (Game.cpu.bucket >= 5000) {
        // Check to see if we are on a screeps.com shard
        if (Game.shard.name.startsWith("shard")) {
            // Generate a pixel since we are on an official shard
            Game.cpu.generatePixel();
        }
    }
};