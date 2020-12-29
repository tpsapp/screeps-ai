//Creep prototypes
Creep.prototype.work = function() {
    if (this.memory.role === undefined || this.memory.role === null ) {
        console.log(this.name + ' has no role assigned, killing it.');
        this.suicide();
    }

    require('role' + this.memory.role).run(this);
};

Creep.prototype.getCloseResources = function() {
    var resource = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

    if (resource !== undefined && resource !== null) {
        this.pickup(resource);
    }
};

Creep.prototype.getEnergy = function() {
    if (this.room.controller.level < 2) {
        for (var id of this.room.memory.spawns) {
            var spawn = Game.getObjectById(id);

            if (spawn.energy > 200) {
                if (!this.pos.isNearTo(spawn)) {
                    this.moveTo(spawn, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
                }
                else {
                    this.withdraw(spawn, RESOURCE_ENERGY);
                }
            }
            else {
                continue;
            }
        }
        return;
    }

    var energySources = _.filter(Game.structures, (s) => ((s.structureType === STRUCTURE_EXTENSION) &&
                                                           s.energy > 0) ||
                                                         ((s.structureType === STRUCTURE_STORAGE ||
                                                           s.structureType === STRUCTURE_CONTAINER) &&
                                                           _.sum(s.store) > 0));

    if (this.room.controller.level > 1 && energySources.length > 0) {
        var target = this.pos.findClosestByRange(energySources);

        if (!this.pos.isNearTo(target)) {
            this.moveTo(target, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
        }
        else {
            this.withdraw(target, RESOURCE_ENERGY);
        }
    }
    else {
        for (var id of this.room.memory.spawns) {
            var spawn = Game.getObjectById(id);

            if (spawn.energy > 200) {
                if (!this.pos.isNearTo(spawn)) {
                    this.moveTo(spawn, { visualizePathStyle: { fill: 'transparent', stroke: '#ff0', lineStyle: 'dashed', strokeWidth: .15, opacity: .5 } });
                }
                else {
                    this.withdraw(spawn, RESOURCE_ENERGY);
                }
            }
            else {
                continue;
            }
        }
    }
}