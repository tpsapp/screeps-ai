var roleHealer = {};

roleHealer.run = function(creep) {
    var target = Game.getObjectById(creep.memory.healtarget);

    if (target !== undefined && target !== null) {
        if (!creep.isNearTo(target)) {
            creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
        }
        else {
            creep.heal(target);
        }
    }
    else {
        creep.memory.healtarget = getHealTarget();
    }

    if (target === null || target.hits === target.hitsMax) {
        creep.memory.healtarget = getHealTarget();
    }
};

function getHealTarget() {
    var target = undefined;
    var mostDamage = 0;

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var dmg = creep.hitsMax - creep.hits;

        if (dmg > mostDamage) {
            mostDamage = dmg;
            target = creep.id;
        }
    }

    return target;
}

module.exports = roleHealer;