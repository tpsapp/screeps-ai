var roleUpgrader = {};

roleUpgrader.run = function(creep) {
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
        if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
        }
        else {
            creep.upgradeController(creep.room.controller);
        }
    }
    else {
        creep.getEnergy();
    }
    
    if (creep.room.controller.sign != null && creep.room.controller.sign.username != "Raisor")
    {
        if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
        }
        else {
            creep.say("Signing");
            creep.signController(creep.room.controller, "Raisor was here!");
        }
    }
};

module.exports = roleUpgrader;