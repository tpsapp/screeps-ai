// The Artilery role is used to keep towers filled with energy
// Artilery creeps are only created when towers need to have energy transferred to them

// Import global helper functions
var helper = require("helperFunctions");

// Setup export object
var roleArtilery = {};

// Create the run function to process the role logic
roleArtilery.run = function (creep) {
    // Check for dropped resources near the creep
    creep.getCloseResources();

    // Check if the creep has a tower structure id stored in memory
    if (creep.memory.tower === undefined) {
        // Populate the tower structure id in the creeps memory
        getTower(creep);
    }

    // Check if the creeps working memory entry is true and that the creep is not carrying resources
    if (creep.memory.working && _.sum(creep.carry) === 0) {
        // Set the creeps working memory to false to indicate that it is not working and should gather energy
        creep.memory.working = false;
    }
    // Check if the creeps working memory entry is false and that the creep is carrying enough resources
    if (!creep.memory.working && _.sum(creep.carry) === creep.carryCapacity) {
        // Set the creeps working memory entry to true to indicate that it is working and has enough energy
        creep.memory.working = true;
    }

    // Check if the creep should be working
    if (creep.memory.working) {
        // Assign the stored tower structure object to a reusable variable
        var target = Game.getObjectById(creep.memory.tower);

        // Check if the tower structure exists
        if (target !== undefined && target !== null) {
            // Check if the creep is near the tower
            if (!creep.pos.isNearTo(target)) {
                // Move the creep towards the tower since it is not near it
                creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
            } else {
                // Transfer energy to the tower since it is close enough to it
                creep.transfer(target, RESOURCE_ENERGY);
            }
        }
        // There are no towers that need energy left so look for a storage facility to transfer the energy to
        else {
            // Check to see if there is a storage structure available
            if (creep.room.storage !== undefined && creep.room.storage !== null) {
                // Check if the creep is near the storage
                if (!creep.pos.isNearTo(creep.room.storage)) {
                    // Move the creep towards the storage since it is not near it
                    creep.moveTo(creep.room.storage, {
                        visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 },
                    });
                } else {
                    // Transfer energy to the storage since it is close enough
                    creep.transfer(creep.room.storage, RESOURCE_ENERGY);
                }
            }
        }

        // Check to see if the tower no longer exists or is full
        if (target === null || target.energy === target.energyCapacity) {
            // Assign a new tower id to the creeps memory
            creep.memory.tower = getTower(creep);
        }
    } else {
        // Get energy to transfer to the assigned turret
        creep.getEnergy();
    }
};

// A function to find a tower that needs energy
function getTower(creep) {
    // Get a list of towers that are in the same room as the creep and need energy
    var towers = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TOWER && s.room.name === creep.room.name && s.energy < s.energyCapacity);

    // Check if any towers were found
    if (towers.length > 0) {
        // Return the first tower id in the array
        return towers[0].id;
    } else {
        // Return undefined since no towers were found
        return undefined;
    }
}

// Export the roleArtillery object so it can be used in other files
module.exports = roleArtilery;
