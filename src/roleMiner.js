var helper = require('helperFunctions');

var roleMiner = {};

roleMiner.run = function(creep) {
    if (creep.busy) {
        return;
    }

    creep.getCloseResources();

    if (creep.memory.working && _.sum(creep.carry) === creep.carryCapacity) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && _.sum(creep.carry) === 0) {
        creep.memory.working = true;
    }

    if (creep.memory.working) {
        var target = Game.getObjectById(creep.memory.assignedSource);

        if (target !== undefined && target !== null) {
            if (!creep.pos.isNearTo(target)) {
                creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
            }
            else {
                creep.harvest(target);
            }
        }
        else {
            creep.memory.assignedSource = getAssignedSource(creep.room);
        }
    }
    else {
        var target = getClosestContainer(creep);

        if (target !== undefined && target !== null) {
            if (!creep.pos.isNearTo(target)) {
                creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
            }
            else {
                creep.transfer(target, RESOURCE_ENERGY);
            }
        }
    }
};

function getAssignedSource(room) {
    var result = undefined;
    var leastSpots = 9;

    for (var id in room.memory.sources) {
        var source = room.memory.sources[id];

        if (source.miners < source.spots && source.miners < leastSpots) {
            leastSpots = source.miners;
            result = id;
        }
    }

    return result;
}

function getClosestContainer(creep) {
    var containers = _.filter(Game.structures, (s) => ((s.structureType === STRUCTURE_SPAWN ||
                                                        s.structureType === STRUCTURE_EXTENSION) &&
                                                        s.energy < s.energyCapacity) ||
                                                      ((s.structureType === STRUCTURE_STORAGE ||
                                                        s.structureType === STRUCTURE_CONTAINER) &&
                                                        _.sum(s.store) < s.storeCapacity));

    if (containers.length > 0) {
        return creep.pos.findClosestByPath(containers);
    }
    else {
        return undefined;
    }
}

module.exports = roleMiner;