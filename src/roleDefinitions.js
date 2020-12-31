// The roleDefinitions object stores data regarding the different roles for creeps
// The body identifier stores the array of creep body parts needed to create a base creep for the role
// The maxCount identifier stores an integer identifying the maximum number of creeps that should be assigned to the role
var roleDefinitions = {
    Archer: { body: [TOUGH, MOVE, RANGED_ATTACK], maxCount: 0 },
    Artilery: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Knight: { body: [TOUGH, MOVE, ATTACK], maxCount: 5 },
    Engineer: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Framer: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Healer: { body: [TOUGH, MOVE, HEAL], maxCount: 5 },
    Miner: { body: [WORK, CARRY, MOVE], maxCount: 8 },
    Technician: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Upgrader: { body: [WORK, CARRY, MOVE], maxCount: 2 },
};

// Export the roleDefinitions object for use in other files
module.exports = roleDefinitions;
