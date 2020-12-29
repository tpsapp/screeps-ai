var helper = require('helperFunctions');
var spawner = require('spawnHandler');
var foreman = require('structureHandler');
var ROLES = require('roleDefinitions');

var roomHandler = {};

roomHandler.run = function() {
    if (!Game.rooms) {
        return;
    }

    for (var name in Game.rooms) {
        var room = Game.rooms[name];

        initializeMemory(room);
        takeCensus(room);
        defendRoom(room);
        spawner.run(room);
        foreman.controlTowers(room);
        foreman.run(room);
    }
};

function initializeMemory(room) {
    room.memory.creeps = [];
    room.memory.spawns = [];
    room.memory.sources = {};
    room.memory.towers = [];

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.room.name === room.name) {
            room.memory.creeps.push(creep.id);
        }
    }

    for (var name in Game.spawns) {
        var spawn = Game.spawns[name];

        if (spawn.room.name === room.name) {
            room.memory.spawns.push(spawn.id);
        }
    }

    var sources = room.find(FIND_SOURCES);
    var towers = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TOWER);

    for (var name in sources) {
        var source = sources[name];
        var sourceSpots = getSourceSpots(source);
        var sourceMiners = getSourceMiners(source.id);

        room.memory.sources[source.id] = { spots: sourceSpots, miners: sourceMiners };
    }

    for (var name in towers) {
        var tower = towers[name];

        room.memory.towers.push(tower.id);
    }
}

function getSourceSpots(source) {
    var room = source.room;
    var pos = source.pos;
    var result = 0;

    for (var x = pos.x - 1; x <= pos.x + 1; x++) {
        for (var y = pos.y - 1; y <= pos.y + 1; y++) {
            var spot = room.lookAt(x, y);

            if (_.filter(spot, (s) => (s.type === 'terrain' && s.terrain === 'wall')).length === 0) {
                result++;
            }
        }
    }

    return result;
}

function getSourceMiners(id) {
    var result = _.filter(Game.creeps, (c) => c.memory.role === 'Miner' && c.memory.assignedSource === id).length;

    return result;
}

function takeCensus(room) {
    for (var role in ROLES) {
        room.memory[role] = _.filter(Game.creeps, (c) => c.room.name === room.name && c.memory.role === role).length;
    }
}

function defendRoom(room) {
    if (!room.controller.my) {
        return;
    }

    var enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
    var enemyNukes = room.find(FIND_NUKES);

    if (enemyCreeps.length > 0) {
        if (!room.memory.enemiesPresent) {
            var attackers = {};

            for (var name in enemyCreeps) {
                var creep = enemyCreeps[name];

                if (!(creep.owner.username in attackers)) {
                    attackers[creep.owner.username] = 1;
                }
                else {
                    attackers[creep.owner.username]++;
                }
            }

            var message = room.name + ' is under attack by the following creeps:\n';

            for (var name in attackers) {
                message += name + ': ' + attackers[name] + ' creeps\n';
                if (name != 'Invader' && attackers[name] > 5 && room.controller.safeMode === undefined) {
                    room.controller.activateSafeMode();
                }
            }

            helper.log(message, true);
        }

        spawner.buildArmy(room);
        
        room.memory.enemiesPresent = true;
    }
    else {
        room.memory.enemiesPresent = false;
    }
    
    if (enemyNukes.length > 0) {
        if (!room.memory.nukesPresent) {
            var nukes = {};
            
            for (var name in enemyNukes) {
                var nuke = enemyNukes[name];
                
                if (!nuke.launchRoomName in nukes) {
                    nukes[nuke.launchRoomName] = 1;
                }
                else {
                    nukes[nuke.launchRoomName]++;
                }
            }
            
            var message = room.name + ' is being nuked by the following people:\n';
            
            for (var name in nukes) {
                message += name + ': ' + nukes[name] + ' nukes\n';
            }
        }
        
        for (var name in enemyNukes) {
            var nuke = enemyNukes[name];
            
            if (nuke.timeToLand < 10 && room.controller.safeMode === undefined) {
                room.controller.activateSafeMode();
            }
        }
    }
    else {
        room.memory.nukesPresent = false;
    }
}

module.exports = roomHandler;