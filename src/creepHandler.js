// Setup export object
var creepHandler = {};

// Create the main run function to process creep logic
creepHandler.run = function () {
    // Iterate through all owned creeps
    for (var name in Game.creeps) {
        // Execute the work prototype function for the selected creep
        Game.creeps[name].work();
    }
};

// Export the creepHandler object for use in other files
module.exports = creepHandler;
