var roleKnight = {};

roleKnight.run = function(creep) {
    if (!creep.room.memory.enemiesPresent) {
        return;
    }

    var target = Game.getObjectById(creep.memory.attackTarget);
    //console.log(target);
    if (target !== undefined && target !== null) {
        if (!creep.pos.isNearTo(target)) {
            creep.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
        }
        else {
            creep.attack(target);
        }
    }
    else {
        creep.memory.attackTarget = getAttackTarget(creep);
    }
};

function getAttackTarget(creep) {
    var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    var healers = [];
    var knights = [];
    var archers = [];
    var others = [];

    if (enemies.length > 0) {
        for (var name in enemies) {
            var enemy = enemies[name];

            if (enemy.getActiveBodyparts(HEAL) > 0) {
                healers.push(enemy.id);
            }

            if (enemy.getActiveBodyparts(ATTACK) > 0) {
                knights.push(enemy.id);
            }

            if (enemy.getActiveBodyparts(RANGED_ATTACK) > 0) {
                archers.push(enemy.id);
            }

            if (!(enemy.id in healers) && !(enemy.id in knights) && !(enemy.id in archers)) {
                others.push(enemy.id);
            }
        }

        if (healers.length > 0) {
            return healers[0];
        }
        else if (knights.length > 0) {
            return knights[0];
        }
        else if (archers.length > 0) {
            return archers[0];
        }
        else {
            return others[0];
        }
    }
    else {
        return undefined;
    }
}

module.exports = roleKnight;