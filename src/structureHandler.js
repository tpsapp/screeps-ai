var helper = require('helperFunctions');
var UPDATE_DELAY = 50;
var MAX_EXTENSIONS = 0;

var structureHandler = {};

structureHandler.run = function(room) {
    if (!helper.isOutdated(room, 'lastConstructionUpdate', UPDATE_DELAY)) {
        return;
    }

    if (!room.controller.my || room.controller.level < 2) {
        return;
    }

    var structures = room.find(FIND_STRUCTURES);
    var extensions = _.filter(structures, (s) => s.structureType === STRUCTURE_EXTENSION);
    MAX_EXTENSIONS = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];

    if (extensions.length < MAX_EXTENSIONS) {
        return;
    }

    var costs = new PathFinder.CostMatrix;

    structures.forEach(function(s) {
        if (s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_ROAD && (s.structureType !== STRUCTURE_RAMPART || !s.my)) {
            costs.set(s.pos.x, s.pos.y, 0xff);
        }
    });

    buildRoads(room, costs);
    //buildWalls(room);
};

structureHandler.controlTowers = function(room) {
    for (var id of room.memory.towers) {
        var tower = Game.getObjectById(id);
        
        if (room.memory.enemiesPresent) {
            var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        
            if (target !== undefined) {
                tower.attack(target);
            }
        }
        else {
            //TODO: repair stuff and/or heal creeps
        }

        if (tower.energy < tower.energyCapacity) {
            require('spawnHandler').spawnArtilery(room);
        }
    }
};

function buildRoads(room, costs) {
    if (room.memory.roadsBuilt) {
        return;
    }

    var sources = [];
    var spawns = [];

    for (var id in room.memory.sources) {
        sources.push(Game.getObjectById(id));
    }

    for (var id of room.memory.spawns) {
        spawns.push(Game.getObjectById(id));
    }

    for (var spawn of spawns) {
        for (var source of sources) {
            var path = PathFinder.search(spawn.pos, {pos: source.pos, range: 1}, { roomCallback: function() { return costs; } })['path'];

            for (var i = 0; i < path.length; i++) {
                room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
        }

        path = PathFinder.search(spawn.pos, {pos: room.controller.pos, range: 1}, { roomCallback: function() { return costs; } })['path'];

        for (var i = 0; i < path.length; i++) {
            room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
    }

    room.memory.roadsBuilt = true;
}

function buildWalls(room) {
    if (!room.memory.roadsBuilt || room.memory.wallsBuilt) {
        return;
    }

    var topExits = room.find(FIND_EXIT_TOP);
    var rightExits = room.find(FIND_EXIT_RIGHT);
    var bottomExits = room.find(FIND_EXIT_BOTTOM);
    var leftExits = room.find(FIND_EXIT_LEFT);

    if (topExits.length > 0) {
        for (var x = topExits[0].x - 2; x <= topExits[topExits.length - 1].x + 2; x++) {
            for (var y = topExits[0].y + 1; y <= topExits[0].y + 2; y++) {
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    if (rightExits.length > 0) {
        for (var y = rightExits[0].y - 2; y <= rightExits[rightExits.length - 1].y + 2; y++) {
            for (var x = rightExits[0].x - 1; x <= rightExits[0].x - 2; x++) {
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    if (bottomExits.length > 0) {
        for (var x = bottomExits[0].x - 2; x <= bottomExits[bottomExits.length - 1].x + 2; y++) {
            for (var y = bottomExits[0].y - 1; y <= bottomExits[0].y - 2; y++) {
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    if (leftExits.length > 0) {
        for (var y = leftExits[0].y - 2; y <= leftExits[leftExits.length - 1].y + 2; y++) {
            for (var x = leftExits[0].x + 1; x <= leftExits[0].x+ 2; x++) {
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    room.memory.wallsBuilt = true;
}

module.exports = structureHandler;