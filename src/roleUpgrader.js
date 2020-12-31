// The Upgrader is responsible for upgrading the controller in its assigned room

// Setup export object
var roleUpgrader = {};

// Create the run function to process the role log
roleUpgrader.run = function (creep) {
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
        // Check if the controller is within 3 spaces from the creep
        if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
            // Move towards the controller since it is not close enough
            creep.moveTo(creep.room.controller, {
                visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 },
            });
        } else {
            // Upgrade the controller since it is close enough to the creep
            creep.upgradeController(creep.room.controller);
        }
    } else {
        // Get enough energy to upgrade the controller
        creep.getEnergy();
    }

    // Check if the controller is signed and if so does it have our username
    if (creep.room.controller.sign != null && creep.room.controller.sign.username !== "Raisor") {
        // Check if the controller is within 1 space from the creep
        if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
            // Move towards the controller since it is not close enough
            creep.moveTo(creep.room.controller, {
                visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 },
            });
        } else {
            // Notify that the creep is signing the controller visually on the map
            creep.say("Signing");
            // Sign the controller since it is close enough to the creep
            creep.signController(creep.room.controller, "Raisor was here!");
        }
    }
};

// Export the roleUpgrader object for use in other files
module.exports = roleUpgrader;
