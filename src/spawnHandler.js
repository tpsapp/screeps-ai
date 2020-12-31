// Import global helper functions
var helper = require("helperFunctions");
// Import all creep roles for spawning
var ROLES = require("roleDefinitions");
// Setup the priority for worker creep roles
var WORKER_PRIORITY = ["Miner", "Upgrader", "Engineer", "Technician", "Framer"];
// Setup the priority for military creep roles
var MILITARY_PRIORITY = ["Knight", "Healer"];

// Setup export object
var spawnHandler = {};

// Create the main run function to process spawn logic
spawnHandler.run = function (room) {
    // Check if enemies are present in the current room or if there is not enough energy available
    if (room.memory.enemiesPresent || room.energyAvailable < 200) {
        // Return from this function as there are either enemies present or not enough energy
        return;
    }

    // Create a variable to store the miner slots
    var minerSpots = 0;
    // Iterate through the source entries in the rooms memory
    for (var id in room.memory.sources) {
        // Assign the source to a reusable variable
        var source = room.memory.sources[id];
        // add the spots available to the minerspots variable
        minerSpots += source.spots;
    }
    // Update the Miner roles maxCount to the available source spots count
    ROLES["Miner"].maxCount = minerSpots;

    // Iterate through the spawns stored in the rooms memory
    for (var id of room.memory.spawns) {
        // Assign the spawn to a reusable variable
        var spawn = Game.getObjectById(id);

        // Check if the spawn exists or if it is already creating a creep
        if (spawn === null || spawn.spawning !== null) {
            // Move to the next spawn since the current one no longer exists or is already busy
            continue;
        }

        // Iterate through the worker role priority list
        for (var role of WORKER_PRIORITY) {
            // Check if the role count for the room is less than the max count for the role
            if (room.memory[role] < ROLES[role].maxCount) {
                // Create a creep since there are not the max amount of creeps in the room for the role
                createCreep(spawn, buildBody(role, room.energyAvailable), role);
                // Exit from the worker role priority iteration
                break;
            }
        }
    }
};

// A function to build an army in a room that is under attack
spawnHandler.buildArmy = function (room) {
    // Check if there is enough energy available in the room
    if (room.energyAvailable < 200) {
        // Return from this function since there is not enough memory available
        return;
    }

    // Iterate through the spawns stored in the room memory
    for (var id of room.memory.spawns) {
        // Assign the spawn to a reusable variable
        var spawn = Game.getObjectById(id);

        // Check if the spawn still exists or if it is already creating a creep
        if (spawn === null || spawn.spawning !== null) {
            // Move to the next spawn since the current one no longer exists or is already busy
            continue;
        }

        // Iterate through the military role priority list
        for (var role of MILITARY_PRIORITY) {
            // Check if the role count for the room is less than the mx count for the role
            if (room.memory[role] < ROLES[role].maxCount) {
                // Create a creep since there are not the max amount of creeps in the room for the role
                createCreep(spawn, buildBody(role, room.energyAvailable), role);
                // Exit from the military role priority iteration
                break;
            }
        }
    }
};

// A function to create an Artilery creep to refill towers
spawnHandler.spawnArtilery = function (room) {
    // Check if the room has enough energy available
    if (room.energyAvailable < 200) {
        // Return from this function since not enough energy is available
        return;
    }

    // Create a variable to store the Artillery role name
    var role = "Artilery";

    // Iterate through the spawns stored in the room memory
    for (var id of room.memory.spawns) {
        // Assign the spawn to a reusable variable
        var spawn = Game.getObjectById(id);

        // Check if the spawn still exists or if it is already creating a creep
        if (spawn === null || spawn.spawning !== null) {
            // Move on to the next spawn since the current one either doesnt exist or is already busy
            continue;
        }

        // Check if the room artillery count is less than the max artillery count
        if (room.memory[role] < ROLES[role].maxCount) {
            // Create an artillery creep because there are not the maximum amount
            createCreep(spawn, buildBody(role, room.energyAvailable), role);
        }
    }
};

// A function to make spawning a creep easier
function createCreep(spawn, body, role) {
    // Check if the creepnamecount entry in the rooms memory is missing or if it is over 100
    // This memory entry is used to make the creep name unique and will reset to 0 after 100 creeps
    // are created as this should be long enough to prevent duplicate creep names
    if (Memory.creepNameCount === undefined || Memory.creepNameCount > 100) {
        // Set the creep name count to 0
        Memory.creepNameCount = 0;
    }

    // Increment the creep name count
    Memory.creepNameCount++;

    // Create the creep name using the role, room name, and creep name count
    var name = role + spawn.room.name + Memory.creepNameCount;
    // Check if the spawn can create the specified creep with the name and body needed
    var canCreate = spawn.canCreateCreep(body, name);

    // Check if the creep can be created
    if (canCreate === OK) {
        // Create the creep using the body, name, and role information for the creep
        spawn.createCreep(body, name, { role: role });
        // Log a notification that the creep is being created to the in-game console
        helper.log(spawn.name + " is creating a " + role + " named " + name + " in room " + spawn.room.name);
    } else {
        // Log the failure to create the creep to the in-game console
        helper.log("Unable to create creep due to error " + canCreate + ".\nBODY: " + body + " ROLE: " + role + " NAME: " + name);
    }
}

// A function to build the most effect creep body using the rooms energy resources
function buildBody(role, energy) {
    // Create a variable to store the body result
    var result = [];
    // Store the body data from the role definitions
    var bodyParts = ROLES[role].body;
    // Create a variable to store the max number of body parts that are able to be made
    var numberOfParts = 0;
    // Create a variable to store the minimum cost of the creep body
    var cost = 0;

    // Iterate through the body part array for the role
    for (var part of bodyParts) {
        // Add up the cost of all body parts needed
        cost += BODYPART_COST[part];
    }

    // Check if the cost is valid
    if (cost > 0) {
        // Divide the energy available in the room by the minimum body cost to get the max number of parts the creep can have
        numberOfParts = Math.floor(energy / cost);
    }

    // Check if the body parts are greater than 5 which is the most effective body part count
    if (numberOfParts > 5) {
        // Set the number of parts to 5 since it is greater than the most effective count
        numberOfParts = 5;
    }

    // Iterate through roles body part array
    for (var part of bodyParts) {
        // Loop from 0 to the total number of parts needed
        for (var i = 0; i < numberOfParts; i++) {
            // Add the current body part to the result array
            result.push(part);
        }
    }

    // Return the resultant body array
    return result;
}

// Export the spawnHandler object for use in other files
module.exports = spawnHandler;
