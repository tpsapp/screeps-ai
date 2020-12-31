// The Healer role is responsible for healing damaged creeps when our base is being attacked
// TODO: Add logic for following an attacking party to another room

// Setup export object
var roleHealer = {};

// Create the run function to process the role logic
roleHealer.run = function (creep) {
    // Assign the stored damaged creep to a reusable variable
    var target = Game.getObjectById(creep.memory.healtarget);

    // Check if the damaged creep still exists
    if (target !== undefined && target !== null) {
        // Check if the creep is near the damaged creep
        if (!creep.isNearTo(target)) {
            // Move towards the damaged creep since it is not near
            creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
        } else {
            // Heal the damaged creep since is is close enough
            creep.heal(target);
        }
    }
    // No damaged creep found
    else {
        // Assign the id of the next damaged creep to this creeps memory
        creep.memory.healtarget = getHealTarget();
    }

    // Check if the damaged creep still exists or if it has max hits
    if (target === null || target.hits === target.hitsMax) {
        // Assign the id of the next damaged creep to this creeps memory
        creep.memory.healtarget = getHealTarget();
    }
};

// A function to find a damaged creep
function getHealTarget() {
    // Initalize the target variable
    var target = undefined;
    // Initalize a variable to indicate the most damage incurred by found creeps
    var mostDamage = 0;

    // Iterate through all the creeps owned by us
    for (var name in Game.creeps) {
        // Store the currently selected creep
        var creep = Game.creeps[name];
        // Store the amount of damage done to the creep
        var dmg = creep.hitsMax - creep.hits;

        // Check if the amount of damage the selected creep has is greater than the already processed creeps
        if (dmg > mostDamage) {
            // Assign this creeps damage amount to the most damage variable
            mostDamage = dmg;
            // Assign this creep to the target
            target = creep.id;
        }
    }

    // Return the id of the most damaged creep or undefined if none are found
    return target;
}

// Export the roleHealer object for use in other files
module.exports = roleHealer;
