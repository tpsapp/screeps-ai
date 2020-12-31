// A prototype function to process creep logic
Creep.prototype.work = function () {
    // Checks to see if the creep accessing the function has a rold defined in memory
    if (this.memory.role === undefined || this.memory.role === null) {
        // Log a message to the console identifying the creep and that it will be removed
        console.log(this.name + " has no role assigned, killing it.");
        // Kill the creep
        // TODO: Replace with creep reclaim instead
        this.suicide();
    }

    // Call the run function from the specified role
    require("role" + this.memory.role).run(this);
};

// A prototype function to find the closest orphaned resource
// TODO: Move this to a janitor creep
Creep.prototype.getCloseResources = function () {
    // Find the closest dropped resource by range from the creep
    var resource = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

    // Check to see if the resource still exists
    if (resource !== undefined && resource !== null) {
        // Pickup the resource if it is near the creep
        this.pickup(resource);
    }
};

// A prototype function to help creeps gather energy
Creep.prototype.getEnergy = function () {
    // Check to see if the creeps room controller is less than 2
    // This check is done to save CPU time by not having to iterate through game objects
    // since there will not be any other structures available until controller level 2
    if (this.room.controller.level < 2) {
        // Iterate through the list of spawns saved in the rooms memory.
        for (var id of this.room.memory.spawns) {
            // Assign the spawn object to a variable
            var spawn = Game.getObjectById(id);

            // Verify that the spawn has more than 200 energy which is the minimum amount of energy to create a creep
            if (spawn.energy > 200) {
                // Check if the creep is near the spawn
                if (!this.pos.isNearTo(spawn)) {
                    // Move the creep towards the spawn since it is not near it
                    this.moveTo(spawn, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
                } else {
                    // Since the creep is near the spawn it can withdraw energy to use
                    this.withdraw(spawn, RESOURCE_ENERGY);
                }
            } else {
                // Check the next spawn stored in memory
                continue;
            }
        }
        // Return from this function as there are going to be no other sources of energy available
        return;
    }

    // Get a list of structures that can contain energy and have energy stored in them
    var energySources = _.filter(
        Game.structures,
        (s) =>
            (s.structureType === STRUCTURE_EXTENSION && s.energy > 0) ||
            ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) && _.sum(s.store) > 0)
    );

    // Check to see if the room controller level is greater than 1 and that there were structures found
    if (this.room.controller.level > 1 && energySources.length > 0) {
        // Find the closest structure to the creep and assign to a variable
        var target = this.pos.findClosestByRange(energySources);

        // Check if the creep is close enough to the structure
        if (!this.pos.isNearTo(target)) {
            // Move the creep towards the structure since it is not near it
            this.moveTo(target, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
        } else {
            // Since the creep is near the structure it can withdraw energy to use
            this.withdraw(target, RESOURCE_ENERGY);
        }
    }
    // No structures with energy found or the controller level is less than 1
    else {
        // Iterate through the list of spawns saved in the rooms memory.
        for (var id of this.room.memory.spawns) {
            // Assign the spawn object to a variable
            var spawn = Game.getObjectById(id);

            // Verify that the spawn has more than 200 energy which is the minimum amount of energy to create a creep
            if (spawn.energy > 200) {
                // Check if the creep is near the spawn
                if (!this.pos.isNearTo(spawn)) {
                    // Move the creep towards the spawn since it is not near it
                    this.moveTo(spawn, { visualizePathStyle: { fill: "transparent", stroke: "#ff0", lineStyle: "dashed", strokeWidth: 0.15, opacity: 0.5 } });
                } else {
                    // Since the creep is near the spawn it can withdraw energy to use
                    this.withdraw(spawn, RESOURCE_ENERGY);
                }
            } else {
                // Check the next spawn stored in memory
                continue;
            }
        }
    }
};
