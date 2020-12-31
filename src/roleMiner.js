// Import global helper functions
var helper = require("helperFunctions");

// Setup export object
var roleMiner = {};

// Create the run function to process the role logic
roleMiner.run = function (creep) {
    // Check if the creep is still spawning
    if (creep.busy) {
        // Return from this function as the creep is still spawning
        return;
    }

    // Check for dropped resources near the creep
    creep.getCloseResources();

    // Check if the creeps working memory entry is true and that the creep is carrying max resources
    if (creep.memory.working && _.sum(creep.carry) === creep.carryCapacity) {
        // Set the creeps working memory to false to indicate that it is not working and should depost the energy
        creep.memory.working = false;
    }
    // Check if the creeps working memory entry is false and that the creep is not carrying resources
    if (!creep.memory.working && _.sum(creep.carry) === 0) {
        // Set the creeps working memory entry to true to indicate that it is working and has should gather energy
        creep.memory.working = true;
    }

    // Check if the creep should be working
    if (creep.memory.working) {
        // ASsign the stored source object in a reusable variable
        var target = Game.getObjectById(creep.memory.assignedSource);

        // Check if the source still exists
        if (target !== undefined && target !== null) {
            // Check if the creep is near the assigned source
            if (!creep.pos.isNearTo(target)) {
                // Move towards the assigned source since it is not close enough
                creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
            } else {
                // Harvest energy from the source since it is close enough
                creep.harvest(target);
            }
        }
        // Assigned source is not valid or doesnt exist
        else {
            // Store the id of the next source available
            creep.memory.assignedSource = getAssignedSource(creep.room);
        }
    } else {
        // Get the closest structure to store energy in
        var target = getClosestContainer(creep);

        // Check if the structure still exists
        if (target !== undefined && target !== null) {
            // Check if the creep is near the structure
            if (!creep.pos.isNearTo(target)) {
                // Move towards the structure since it is not close enough
                creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
            } else {
                // Transfer the energy to the structure since it is close enough
                creep.transfer(target, RESOURCE_ENERGY);
            }
        }
    }
};

// A function to get the next assigned source
function getAssignedSource(room) {
    // Initialize a variable to store the source id
    var result = undefined;
    // Initialize a variable to check for available spots around a source
    var leastSpots = 9;

    // Iterate through the source ids stored in the rooms memory
    for (var id in room.memory.sources) {
        // Assign the source memory object to a reusable variable
        var source = room.memory.sources[id];

        // Check if there are any less miners assigned to the source than available spots
        if (source.miners < source.spots && source.miners < leastSpots) {
            // Store the miner count
            leastSpots = source.miners;
            // Store the source id
            result = id;
        }
    }

    // Return the source id or undefined if none are found or have no empty spots available
    return result;
}

// A function to find the closest structure to store energy in
function getClosestContainer(creep) {
    // Get an array of all structures that can store energy and that are not full
    var containers = _.filter(
        Game.structures,
        (s) =>
            ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.energy < s.energyCapacity) ||
            ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) && _.sum(s.store) < s.storeCapacity)
    );

    // Check if any structures found
    if (containers.length > 0) {
        // Return the closest structure to the creep
        return creep.pos.findClosestByPath(containers);
    } else {
        // Return undefined since no structures found
        return undefined;
    }
}

// Export the roleMiner object for use in other files
module.exports = roleMiner;
