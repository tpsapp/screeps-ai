var helper = require('helperFunctions');

var roleArtilery = {};

roleArtilery.run = function(creep) {
    creep.getCloseResources();
    
    if (creep.memory.tower === undefined) {
        getTower(creep);
    }

    if (creep.memory.working && _.sum(creep.carry) === 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && _.sum(creep.carry) === creep.carryCapacity) {
        creep.memory.working = true;
    }

    if (creep.memory.working) {
        var target = Game.getObjectById(creep.memory.tower);

        if (target !== undefined && target !== null) {
            if (!creep.pos.isNearTo(target)) {
                creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
            }
            else {
                creep.transfer(target, RESOURCE_ENERGY);
            }
        }
        else {
            if (creep.room.storage !== undefined && creep.room.storage !== null) {
                if (!creep.pos.isNearTo(creep.room.storage)) {
                    creep.moveTo(creep.room.storage, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
                }
                else {
                    creep.transfer(creep.room.storage, RESOURCE_ENERGY);
                    //creep.suicide();
                }
            }
        }

        if (target === null || target.energy === target.energyCapacity) {
            creep.memory.tower = getTower(creep);
        }
    }
    else {
        creep.getEnergy();
    }
};

function getTower(creep) {
    var towers = _.filter(Game.structures, (s) => s.structureType === STRUCTURE_TOWER && s.room.name === creep.room.name && s.energy < s.energyCapacity);

    if (towers.length > 0) {
        return towers[0].id;
    }
    else {
        return undefined;
    }
}

module.exports = roleArtilery;