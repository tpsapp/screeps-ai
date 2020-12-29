var roleEngineer = {};

roleEngineer.run = function(creep) {
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
        var target = Game.getObjectById(creep.memory.worksite);

        if (target !== undefined && target !== null) {
            if (!creep.pos.inRangeTo(target, 3)) {
                creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
            }
            else {
                creep.build(target);
            }
        }
        else {
            require('roleUpgrader').run(creep);
        }

        if (target === null || target.progress === target.progressTotal) {
            creep.memory.worksite = findWorksite(creep);
        }
    }
    else {
        creep.getEnergy();
    }
};

function findWorksite(creep) {
    for (var name in Game.constructionSites) {
        return Game.constructionSites[name].id;
    }

    return undefined;
}

module.exports = roleEngineer;