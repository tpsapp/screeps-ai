// The Framer role is responsible for maintaining walls and ramparts

// Setup export object
var roleFramer = {};

// Create the run function to process the role logic
roleFramer.run = function (creep) {
    // Check if the creep is still being spawned
    if (creep.busy) {
        // Return from this function since the creep is still being spawned
        return;
    }

    // Check for dropped resources near the creep
    creep.getCloseResources();

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
        // Assign the stored repair site to a reusable variable
        // TODO: Figure out why I did this
        var target = null; //Game.getObjectById(creep.memory.repairsite);

        // Check if the repair site still exists
        if (target !== undefined && target !== null) {
            // Check if the creep is close enough to the repair site
            if (!creep.pos.inRangeTo(target, 3)) {
                // Move towards the repair site since the creep is not near to it
                creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
            } else {
                // Repair the repair site since it is close enough
                creep.repair(target);
            }
        } else {
            // Fall back to the technician role since no repair sites are available
            require("roleTechnician").run(creep);
        }

        // Check if the repair site still exists or if it is at max hits
        if (
            target === null ||
            (target.structureType === STRUCTURE_WALL && target.hits >= 1000000) ||
            (target.structureType === STRUCTURE_RAMPART && s.hits === s.hitsMax)
        ) {
            // Store the id of a new repair site in the creeps memory
            creep.memory.repairsite = findRepairsite(creep);
        }
    } else {
        // Get enough energy to repair the repair site
        creep.getEnergy();
    }
};

// A function to find an available repair site
function findRepairsite(creep) {
    // Get an array of walls that are at less than 1000000 hits and ramparts that are at less than 75% of their hits
    var sites = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_WALL && s.hits < 1000000) || (s.structureType === STRUCTURE_RAMPART && s.hits < s.hitsMax * 0.75),
    });

    // Check if there were any sites found
    if (sites.length > 0) {
        // Return the id of the first available repair site
        return sites[0].id;
    }
    // No repair sites with specific requirements found
    else {
        // Get an array of walls and ramparts that are at less than 75% of their hits
        sites = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < s.hitsMax * 0.5,
        });
        // Check if there were any sites found
        if (sites.length > 0) {
            // Return the id of the first available repair site
            return sites[0].id;
        }
        // No repair sites with specific requirements found
        else {
            // Return undefined since not repair sites were found
            return undefined;
        }
    }
}

// Export the roleFramer object for use in other files
module.exports = roleFramer;
