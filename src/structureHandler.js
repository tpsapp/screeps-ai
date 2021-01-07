// Import global helper functions
var helper = require("helperFunctions");
// Create a variable to store the number of ticks to delay the build functions
var UPDATE_DELAY = 50;
// Create a variable to store the max number of extensions for the room
var MAX_EXTENSIONS = 0;

// Setup export object
var structureHandler = {};

// Create the main run function to process structure building logic
structureHandler.run = function (room) {
    // Check if the indicated number of ticks has passed before doing the next update
    if (!helper.isOutdated(room, "lastConstructionUpdate", UPDATE_DELAY)) {
        // Return from this function as the number of ticks has not passed
        return;
    }

    // Check if the room is under our control and if the controller level is less than 2
    if (!room.controller.my || room.controller.level < 2) {
        // Return from this function as the room is either not ours or is not a high enough level
        return;
    }

    // Get an array of structures in the current room
    var structures = room.find(FIND_STRUCTURES);
    // Find all extensions in the room
    var extensions = _.filter(structures, (s) => s.structureType === STRUCTURE_EXTENSION);
    // Query the max number of extensions for the current rooms controller level
    MAX_EXTENSIONS = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];

    // Check if the max number of exteions are built
    if (extensions.length < MAX_EXTENSIONS) {
        // Return from this function since there are not enough extensions
        // TODO: Add code to place construction sites for extensions
        return;
    }

    // Create a net cost matrix
    var costs = new PathFinder.CostMatrix();

    // Iterate through the array of structures
    structures.forEach(function (s) {
        // Check if the structure is not a container, road, or rampart and if it is owned by us
        if (s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_ROAD && (s.structureType !== STRUCTURE_RAMPART || !s.my)) {
            // Set the cost for moving over the structure to max
            costs.set(s.pos.x, s.pos.y, 0xff);
        }
    });

    // build the roads using the costmatrix created
    buildRoads(room, costs);
    //buildWalls(room);
};

// A function to control the towers in the specified room
structureHandler.controlTowers = function (room) {
    // Iterate through the tower ids stored in the rooms memory
    for (var id of room.memory.towers) {
        // Assign the tower to a reusable variable
        var tower = Game.getObjectById(id);

        // Check if there are enemies present in the room
        if (room.memory.enemiesPresent) {
            // Assign the closest enemy creep to a reusable variable
            var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            // Check if the enemy creep still exists
            if (target !== undefined) {
                // Attack the enemy creep
                tower.attack(target);
            }
        } else {
            // TODO: repair stuff and/or heal creeps
        }

        // Check if the tower needs energy
        if (tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            // Create an artillery creep to refill the tower
            require("spawnHandler").spawnArtilery(room);
        }
    }
};

// A function to create construction sites for roads in the room
function buildRoads(room, costs) {
    // Check if we have already built roads or not
    if (room.memory.roadsBuilt) {
        // Return from this function because we have already built roads in this room
        return;
    }

    // Create an empty array to store the sources in the room
    var sources = [];
    // Create an empty array to store the spawns in the room
    var spawns = [];

    // Iterate through the source ids stored in the room memory
    for (var id in room.memory.sources) {
        // Add the source to the sources array
        sources.push(Game.getObjectById(id));
    }

    // Iterate through the spawn ids stored in the room memory
    for (var id of room.memory.spawns) {
        // Add the spawn to the spawns array
        spawns.push(Game.getObjectById(id));
    }

    // Iterate through the array of spawns
    for (var spawn of spawns) {
        // Iterate through array of sources
        for (var source of sources) {
            // Get the best path from the spawn to the source
            var path = PathFinder.search(
                spawn.pos,
                { pos: source.pos, range: 1 },
                {
                    roomCallback: function () {
                        return costs;
                    },
                }
            )["path"];

            // Loop through the path array
            for (var i = 0; i < path.length; i++) {
                // Create a road construction site at the current position in the path
                room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
        }

        // Get the best path from the spawn to the rooms controller
        path = PathFinder.search(
            spawn.pos,
            { pos: room.controller.pos, range: 1 },
            {
                roomCallback: function () {
                    return costs;
                },
            }
        )["path"];

        // Loop through the path array
        for (var i = 0; i < path.length; i++) {
            // Create a road construction site at the current position in the path
            if (room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD) !== OK) {
                return;
            }
        }
    }

    // Indicate to the rooms memory that the roads have been placed
    room.memory.roadsBuilt = true;
}

// A function to create construction sites for walls in the current room
function buildWalls(room) {
    // Check if the roads have not been built or if the walls have already been built
    if (!room.memory.roadsBuilt || room.memory.wallsBuilt) {
        // Return from this function as either the walls are already built or the roads need to be built first
        return;
    }

    // Get an array of all exists along the top of the room
    var topExits = room.find(FIND_EXIT_TOP);
    // Get an array of all exists along the right of the room
    var rightExits = room.find(FIND_EXIT_RIGHT);
    // Get an array of all exists along the bottom of the room
    var bottomExits = room.find(FIND_EXIT_BOTTOM);
    // Get an array of all exists along the left of the room
    var leftExits = room.find(FIND_EXIT_LEFT);

    // Check if exits were found at the top of the room
    if (topExits.length > 0) {
        // Loop through the x positions of the top exits
        for (var x = topExits[0].x - 2; x <= topExits[topExits.length - 1].x + 2; x++) {
            // Loop through the y positions of the top exits
            // TODO: Figure out why I am doing this
            for (var y = topExits[0].y + 1; y <= topExits[0].y + 2; y++) {
                // Create a wall construction site at the current position
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    // Check if exits were found at the right of the room
    if (rightExits.length > 0) {
        // Loop through the x positions of the right exits
        for (var y = rightExits[0].y - 2; y <= rightExits[rightExits.length - 1].y + 2; y++) {
            // Loop through the y positions of the right exits
            // TODO: Figure out why I am doing this
            for (var x = rightExits[0].x - 1; x <= rightExits[0].x - 2; x++) {
                // Create a wall construction site at the current position
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    // Check if exits were found at the bottom of the room
    if (bottomExits.length > 0) {
        // Loop through the x positions of the bottom exits
        for (var x = bottomExits[0].x - 2; x <= bottomExits[bottomExits.length - 1].x + 2; y++) {
            // Loop through the y positions of the bottom exits
            // TODO: Figure out why I am doing this
            for (var y = bottomExits[0].y - 1; y <= bottomExits[0].y - 2; y++) {
                // Create a wall construction site at the current position
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    // Check if exits were found at the left of the room
    if (leftExits.length > 0) {
        // Loop through the x positions of the left exits
        for (var y = leftExits[0].y - 2; y <= leftExits[leftExits.length - 1].y + 2; y++) {
            // Loop through the y positions of the left exits
            // TODO: Figure out why I am doing this
            for (var x = leftExits[0].x + 1; x <= leftExits[0].x + 2; x++) {
                // Create a wall construction site at the current position
                room.createConstructionSite(x, y, STRUCTURE_WALL);
            }
        }
    }

    // Indicate to the rooms memory that the walls have been placed
    // TODO: check that there are not too many construction sites before setting this
    room.memory.wallsBuilt = true;
}

// Export the structureHandler object for use in other files
module.exports = structureHandler;
