// The Engineer role is responsible for building structures
// TODO: Have engineer place construction sites according to a base plan

// Setup export object
var roleEngineer = {};

// Create the run function to process the role logic
roleEngineer.run = function (creep) {
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
        // Assign the stored construction site to a reusable variable
        var target = Game.getObjectById(creep.memory.worksite);

        // Check if the construction site still exists
        if (target !== undefined && target !== null) {
            // Check if the creep is close enough to the construction site
            if (!creep.pos.inRangeTo(target, 3)) {
                // Move towards the construction site since the creep is not near to it
                creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
            } else {
                // Build the construction site since it is near enough
                creep.build(target);
            }
        }
        // There are no custruction sites available
        else {
            // Fall back to the role of an upgrader
            require("roleUpgrader").run(creep);
        }

        // Check if the construction site still exists or if it has been compelted
        if (target === null || target.progress === target.progressTotal) {
            // Assign the id of the next available construction site to the creeps memory
            creep.memory.worksite = findWorksite(creep);
        }
    } else {
        // Get enough energy to build the construction site
        creep.getEnergy();
    }
};

// A function to find an available construction site to build
function findWorksite(creep) {
    // Iterate through all construction sites owned by us
    for (var name in Game.constructionSites) {
        // Return the id of the next available construction site
        return Game.constructionSites[name].id;
    }

    // Return undefined since no construction sites are available
    return undefined;
}

// Export the roleEngineer object for use in other files
module.exports = roleEngineer;
