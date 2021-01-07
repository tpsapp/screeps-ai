// Import global helper functions
var helper = require("helperFunctions");
// Import spawn hanlder to manage spawn queues
var spawner = require("spawnHandler");
// Import structure handler to manage construction sites
var foreman = require("structureHandler");
// Import all creep roles for census
var ROLES = require("roleDefinitions");

// Setup export object
var roomHandler = {};

// Create the main run function to process room logic
roomHandler.run = function () {
    // Check if we have visibility to any rooms
    if (!Game.rooms) {
        // Return from this function since we do not have visibility in any rooms
        return;
    }

    // Iterate through all rooms with visibility to us
    for (var name in Game.rooms) {
        // Assign the selected room to a reusable variable
        var room = Game.rooms[name];

        // Initialize the rooms memory entries
        initializeMemory(room);
        // Get a census of creeps and their roles
        takeCensus(room);
        // Check if the room needs to be defended
        defendRoom(room);
        // Run the spawn handler to create creeps
        spawner.run(room);
        // Control the towers to help defend the room
        foreman.controlTowers(room);
        // Run the structure handler to create construction sites
        foreman.run(room);
    }
};

// A function to setup the rooms memory for use in other scripts
function initializeMemory(room) {
    // Create an empty array entry for storing creep information
    // TODO: Figure out why I need this and it's correpsonding loop
    room.memory.creeps = [];
    // Create an empty array entry for storing spawn information
    room.memory.spawns = [];
    // Create an empty object entry for storing source information
    room.memory.sources = {};
    // Create an empty array entry for storing tower information
    room.memory.towers = [];

    // Iterate through all owned creeps
    for (var name in Game.creeps) {
        // Assign the creep to a reusable variable
        var creep = Game.creeps[name];

        // Check if the creep is in the current room being processed
        if (creep.room.name === room.name) {
            // Add the ID of the creep to memory
            // TODO: Figure out why I am doing this
            room.memory.creeps.push(creep.id);
        }
    }

    // Iterate through all owned spawns
    for (var name in Game.spawns) {
        // Assign the spawn to a reusable variable
        var spawn = Game.spawns[name];

        // Check if the spawn is located in the current room being processed
        if (spawn.room.name === room.name) {
            // Add the spawns id to memory
            // TODO: Figure out why I am doing this
            room.memory.spawns.push(spawn.id);
        }
    }

    // Get an array fo all sources in the current room
    var sources = room.find(FIND_SOURCES);
    // Get an array of all owned towers in the current room
    var towers = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TOWER && s.room.name === room.name);

    // Iterate through the found sources array
    for (var name in sources) {
        // Assign the source to a reusable variable
        var source = sources[name];
        // Get the number of spots free at the source
        var sourceSpots = getSourceSpots(source);
        // Get the list of miners assign to the source
        var sourceMiners = getSourceMiners(source.id);

        // Store the number of available spots and assigned miners for the source to the room memory
        room.memory.sources[source.id] = { spots: sourceSpots, miners: sourceMiners };
    }

    // Iterate through the owned towers
    for (var name in towers) {
        // Assign the tower to a reusable variable
        var tower = towers[name];

        // Store the towers id in the rooms memory
        // TODO: Figure out why I am doing this
        room.memory.towers.push(tower.id);
    }
}

// A function to get a count of all the open spots at a specific source
function getSourceSpots(source) {
    // Assign the sources room to a reusable variable
    var room = source.room;
    // Assign the sources positon to a reusable variable
    var pos = source.pos;
    // Create a variable to store the number of spots found
    var result = 0;

    // Step through the positions immediately around the current source position
    // Starts in the upper left corner which is source.pos.x - 1, source.pos.y - 1
    // And iterates through all locations until the bottom right corner which is source.pos.x + 1, source.pos.y + 1
    for (var x = pos.x - 1; x <= pos.x + 1; x++) {
        for (var y = pos.y - 1; y <= pos.y + 1; y++) {
            // Gets an array of objects at the current spot
            var spot = room.lookAt(x, y);

            // Checks the array for walls and increments the result variable if none are found
            if (_.filter(spot, (s) => s.type === "terrain" && s.terrain === "wall").length === 0) {
                result++;
            }
        }
    }

    // Return the number of open spots around the source
    return result;
}

// A function to get an array of miners assigned to the current source
function getSourceMiners(id) {
    // Get an array of creeps that have the miner role and are assigned to the specified source id
    var result = _.filter(Game.creeps, (c) => c.memory.role === "Miner" && c.memory.assignedSource === id).length;

    // Return the count of miner creeps
    return result;
}

// A function to get a count of all roles and the creeps assigned to them
function takeCensus(room) {
    // Iterate through the roles defined in the roleDefinition script
    for (var role in ROLES) {
        // Assign the count of creeps that have the specifed role to the rooms memory
        room.memory[role] = _.filter(Game.creeps, (c) => c.room.name === room.name && c.memory.role === role).length;
    }
}

// A function to check if the room is being attacked and built an army if needed
function defendRoom(room) {
    // Check if we own the room or not
    if (!room.controller.my) {
        // Return from this function as we cannot create an army in unowned rooms
        return;
    }

    // Get an array of hostile creeps in the current room
    var enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
    // Get an array of incoming nukes in the current room
    var enemyNukes = room.find(FIND_NUKES);

    // Check if hostile creeps were found
    if (enemyCreeps.length > 0) {
        // Check if we already know enemies are present
        if (!room.memory.enemiesPresent) {
            // Create an array to store the owner of each enemy creep
            var attackers = {};

            // Iterate through the hostile creeps array
            for (var name in enemyCreeps) {
                // Assign the enemy creep to a reusable variable
                var creep = enemyCreeps[name];

                // Check if the current enemy creeps owner name is in the attackers array
                if (!(creep.owner.username in attackers)) {
                    // Add the creep owners name to the array and assign a count of 1
                    attackers[creep.owner.username] = 1;
                } else {
                    // Increment the owner of the creeps count by 1
                    attackers[creep.owner.username]++;
                }
            }

            // Create a message to log to the console
            var message = room.name + " is under attack by the following creeps:\n";

            // Iterate through the array of attacker names
            for (var name in attackers) {
                // Add the name of the attacker and the number of creeps to the message
                message += name + ": " + attackers[name] + " creeps\n";
                // Check if the attacker is not an NPC and the attacker has more than 5 creeps and safemode is not already active
                if (name != "Invader" && attackers[name] > 5 && room.controller.safeMode === undefined) {
                    // Activate safemode to help stave off a large army
                    room.controller.activateSafeMode();
                }
            }

            // Check if safe mode was activated during this attack
            if (room.controller.safeMode !== undefined) {
                // Update the notification to indicate if safemode is active
                message += "\nSafe Mode is Active";
            } else {
                // Update the notification to indicate if safemode is not active
                message += "\nSafe Mode is not Active";
            }

            // Send a notification of all attackers and their creep count to the console and via email
            helper.log(message, true);
        }

        // Instruct the spawn handler to build an army to defend the room
        spawner.buildArmy(room);

        // Indicate that their are current enemies present in the room in memory
        room.memory.enemiesPresent = true;
    } else {
        // Indicate that their are no enemies present in the room in memory
        room.memory.enemiesPresent = false;
    }

    // Check if any nukes were found
    if (enemyNukes.length > 0) {
        // Check if we already knew that nukes were present
        if (!room.memory.nukesPresent) {
            // Create an array to store the originating room information of the nukes
            var nukes = {};

            // Iterate through the array of enemy nukes
            for (var name in enemyNukes) {
                // Assign the nuke to a reusable variable
                var nuke = enemyNukes[name];

                // Check if the originating room is already stored
                if (!nuke.launchRoomName in nukes) {
                    // Add the originating room to the array and increment its count
                    nukes[nuke.launchRoomName] = 1;
                } else {
                    // Increment the count for the room already in array
                    nukes[nuke.launchRoomName]++;
                }
            }

            // Create a message to indicate the nukes that are attacking our room
            var message = room.name + " is being nuked by the following people:\n";

            // Iterate through the nuke room array
            for (var name in nukes) {
                // Add the originating room name and the count of the nukes to the message
                message += name + ": " + nukes[name] + " nukes\n";
            }
        }

        // Iterate through each enemy nuke
        for (var name in enemyNukes) {
            // Assign the nuke to a reusable variable
            var nuke = enemyNukes[name];

            // Check if the nuke is going to land soon and if safemode is active or not
            if (nuke.timeToLand < 10 && room.controller.safeMode === undefined) {
                // Activate safemode to help deal with the nukes
                room.controller.activateSafeMode();
            }
        }

        // Check if safe mode was activated during this attack
        if (room.controller.safeMode !== undefined) {
            // Update the notification to indicate if safemode is active
            message += "\nSafe Mode is Active";
        } else {
            // Update the notification to indicate if safemode is not active
            message += "\nSafe Mode is not Active";
        }
    } else {
        // Indicate that no nukes are present in the room in memory
        room.memory.nukesPresent = false;
    }
}

// Export the roomHandler object for use in other files
module.exports = roomHandler;
