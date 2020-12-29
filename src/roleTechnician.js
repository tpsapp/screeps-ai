var roleTechnician = {};

roleTechnician.run = function(creep) {
    if (creep.busy) {
        return;
    }

    creep.getCloseResources();

    if (creep.memory.working && _.sum(creep.carry) === 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && _.sum(creep.carry) === creep.carryCapacity) {
        creep.memory.working = true;
    }

    if (creep.memory.working) {
        var target = Game.getObjectById(creep.memory.repairsite);

        if (target !== undefined && target !== null) {
            if (!creep.pos.inRangeTo(target, 3)) {
                creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
            }
            else {
                creep.repair(target);
            }
        }
        else {
            require('roleEngineer').run(creep);
        }

        if (target === null || target.hits === target.hitsMax) {
            creep.memory.repairsite = findRepairSite(creep);
        }
    }
    else {
        creep.getEnergy();
    }
};

function findRepairSite(creep) {
    var sites = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax && s.room.name === creep.room.name });

    if (sites.length > 0) {
        return sites[0].id;
    }
    else {
        return undefined;
    }
}

module.exports = roleTechnician;