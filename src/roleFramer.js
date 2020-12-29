var roleFramer = {};

roleFramer.run = function(creep) {
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
        var target = null; //Game.getObjectById(creep.memory.repairsite);

        if (target !== undefined && target !== null) {
            if (!creep.pos.inRangeTo(target, 3)) {
                creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
            }
            else {
                creep.repair(target);
            }
        }
        else {
            require('roleTechnician').run(creep);
        }

        if (target === null || (target.structureType === STRUCTURE_WALL && target.hits >= 1000000) || (target.structureType === STRUCTURE_RAMPART && s.hits === s.hitsMax)) {
            creep.memory.repairsite = findRepairsite(creep);
        }
    }
    else {
        creep.getEnergy();
    }
};

function findRepairsite(creep) {
    var sites = creep.room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType === STRUCTURE_WALL && s.hits < 1000000) ||
                                                                  (s.structureType === STRUCTURE_RAMPART && s.hits < s.hitsMax * 0.75) });

    if (sites.length > 0) {
        return sites[0].id;
    }
    else {
        sites = creep.room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < s.hitsMax * 0.5 });
        if (sites.length > 0) {
            return sites[0].id;
        }
        else {
            return undefined;
        }
    }
}

module.exports = roleFramer;