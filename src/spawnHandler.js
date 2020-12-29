var helper = require('helperFunctions');
var ROLES = require('roleDefinitions');
var WORKER_PRIORITY = ['Miner', 'Upgrader', 'Engineer', 'Technician', 'Framer'];
var MILITARY_PRIORITY = ['Knight', 'Healer'];

var spawnHandler = {};

spawnHandler.run = function(room) {
    if (room.memory.enemiesPresent || room.energyAvailable < 200) {
        return;
    }

    var minerSpots = 0;
    for (var id in room.memory.sources) {
        var source = room.memory.sources[id];
        minerSpots += source.spots;
    }
    ROLES['Miner'].maxCount = minerSpots;

    for (var id of room.memory.spawns) {
        var spawn = Game.getObjectById(id);

        if (spawn === null || spawn.spawning !== null) {
            continue;
        }

        for (var role of WORKER_PRIORITY) {
            //console.log(spawn.name, 'checking if', role, 'is less than', ROLES[role].maxCount);
            if (room.memory[role] < ROLES[role].maxCount) {
                createCreep(spawn, buildBody(role, room.energyAvailable), role);
                break;
            }
        }
    }
};

spawnHandler.buildArmy = function(room) {
    if (room.energyAvailable < 200) {
        return;
    }

    for (var id of room.memory.spawns) {
        var spawn = Game.getObjectById(id);

        if (spawn === null || spawn.spawning !== null) {
            continue;
        }

        for (var role of MILITARY_PRIORITY) {
            //console.log(spawn.name, 'checking if', role, 'is less than', ROLES[role].maxCount);
            if (room.memory[role] < ROLES[role].maxCount) {
                createCreep(spawn, buildBody(role, room.energyAvailable), role);
                break;
            }
        }
    }
};

spawnHandler.spawnArtilery = function(room) {
    if (room.energyAvailable < 200) {
        return;
    }

    var role = 'Artilery';

    for (var id of room.memory.spawns) {
        var spawn = Game.getObjectById(id);

        if (spawn === null || spawn.spawning !== null) {
            continue;
        }

        if (room.memory[role] < ROLES[role].maxCount) {
            createCreep(spawn, buildBody(role, room.energyAvailable), role);
            break;
        }
    }
}

function createCreep(spawn, body, role) {
    if (Memory.creepNameCount === undefined || Memory.creepNameCount > 100) {
        Memory.creepNameCount = 0;
    }

    Memory.creepNameCount++;

    var name = role + spawn.room.name + Memory.creepNameCount;
    var canCreate = spawn.canCreateCreep(body, name);

    if (canCreate === OK) {
        spawn.createCreep(body, name, { role: role });
        helper.log(spawn.name + ' is creating a ' + role + ' named ' + name + ' in room ' + spawn.room.name);
    }
    else {
        helper.log('Unable to create creep due to error ' + canCreate + '.\nBODY: ' + body + ' ROLE: ' + role + ' NAME: ' + name);
    }
}

function buildBody(role, energy) {
    var result = [];
    var bodyParts = ROLES[role].body;
    var numberOfParts = 0;
    var cost = 0;

    for (var part of bodyParts) {
        cost += BODYPART_COST[part];
    }

    if (cost > 0) {
        numberOfParts = Math.floor(energy / cost);
    }

    if (numberOfParts > 5) {
        numberOfParts = 5;
    }

    for (var part of bodyParts) {
        for (var i = 0; i < numberOfParts; i++) {
            result.push(part);
        }
    }

    return result;
}

module.exports = spawnHandler;