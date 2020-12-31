// The Knight is responsible for defending the current base from NPC attackers and other players
// TODO: Provide logic for attacking other players and NPC bases

// Setup export object
var roleKnight = {};

// Create the run function to process the role logic
roleKnight.run = function (creep) {
    // Check if there are any enemy creeps still present in the current room
    if (!creep.room.memory.enemiesPresent) {
        // Return from this function since no enemies are present
        return;
    }

    // Assign the stored enemy creep in a reusable variable
    var target = Game.getObjectById(creep.memory.attackTarget);

    // Check if the enemy creep still exists
    if (target !== undefined && target !== null) {
        // Check if the creep is near the enemy creep
        if (!creep.pos.isNearTo(target)) {
            // Move toward the enemy creep since it is not close enough
            creep.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
        } else {
            // Attack the enemy creep since it is close enough
            creep.attack(target);
        }
    } else {
        // Assign the id of the next enemy creep to this creeps memory
        creep.memory.attackTarget = getAttackTarget(creep);
    }
};

// A function to find the next enemy creep available
function getAttackTarget(creep) {
    // Get an array of hostile creeps in the current room
    var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    // Initialize array for storing enemy healers
    var healers = [];
    // Initialize array for storing enemy knights
    var knights = [];
    // Initialize array for storing enemy archers
    var archers = [];
    // Initialize array for storing other enemy creeps
    var others = [];

    // Check to see if any enemy creeps are found
    if (enemies.length > 0) {
        // Iterate throug all the found enemies
        for (var name in enemies) {
            // Store the enemy creep object
            var enemy = enemies[name];

            // Check if the enemy creep has a heal part
            if (enemy.getActiveBodyparts(HEAL) > 0) {
                // Assign this creep to the healers array
                healers.push(enemy.id);
            }

            // Check if the enemy creep has an attack part
            if (enemy.getActiveBodyparts(ATTACK) > 0) {
                // Assign this creep the knights array
                knights.push(enemy.id);
            }

            // Check if the enemy creep has a ranged attack part
            if (enemy.getActiveBodyparts(RANGED_ATTACK) > 0) {
                // Assign this creep to the archers array
                archers.push(enemy.id);
            }

            // Check if the creep exists in any of the specific role arrays
            if (!(enemy.id in healers) && !(enemy.id in knights) && !(enemy.id in archers)) {
                // Assign to the misc role array since it is not one of the other types
                others.push(enemy.id);
            }
        }

        // Check if any healers were found as they are a priority
        if (healers.length > 0) {
            // Return the next healer id
            return healers[0];
        }
        // Check if any knight were found
        else if (knights.length > 0) {
            // Return the next knight id
            return knights[0];
        }
        // Check if any archers were found
        else if (archers.length > 0) {
            // Return the next archer id
            return archers[0];
        } else {
            // Return the id of the first creep found
            return others[0];
        }
    }
    // No enemy creeps were found
    else {
        // Return undefined since no creeps found
        return undefined;
    }
}

// Export the roleKnight object for use in other files
module.exports = roleKnight;
