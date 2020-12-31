// The Technician is responsible for maintaining the walls and ramparts
// TODO: Determine why this is used instead of framer

// Setup export object
var roleTechnician = {};

// Create the run function to process the role log
roleTechnician.run = function (creep) {
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
        var target = Game.getObjectById(creep.memory.repairsite);

        // Check if the repair site still exists
        if (target !== undefined && target !== null) {
            // Check if the creep is in range of the repair site
            if (!creep.pos.inRangeTo(target, 3)) {
                // Move towards the repair site since it is not close enough
                creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
            } else {
                // Repair the repair site since it is close enough
                creep.repair(target);
            }
        } else {
            // Fall back to the engineer role since there is nothing to repair
            require("roleEngineer").run(creep);
        }

        // Check if the repair site still exists of it it is at maximum hits
        if (target === null || target.hits === target.hitsMax) {
            // Store the id of the next repair site in the creeps memory
            creep.memory.repairsite = findRepairSite(creep);
        }
    } else {
        // Get enough energy to repair the assigned repair site
        creep.getEnergy();
    }
};

// A function to find the next side that needs repairing
function findRepairSite(creep) {
    // Get a list of walls and ramparts which are not at maximum hits
    var sites = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax && s.room.name === creep.room.name,
    });

    // Check if any repair sites are found
    if (sites.length > 0) {
        // Return the id of the next repair site
        return sites[0].id;
    } else {
        // Return undefined since not repair sites are found
        return undefined;
    }
}

// Expor the roleTechnician object for use in other files
module.exports = roleTechnician;
