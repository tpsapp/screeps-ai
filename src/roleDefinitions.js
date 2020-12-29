var roleDefinitions = {
    Archer: { body: [TOUGH, MOVE, RANGED_ATTACK], maxCount: 0 },
    Artilery: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Knight: { body: [TOUGH, MOVE, ATTACK], maxCount: 5 },
    Engineer: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Framer: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Healer: { body: [TOUGH, MOVE, HEAL], maxCount: 5 },
    Miner: { body: [WORK, CARRY, MOVE], maxCount: 8},
    Technician: { body: [WORK, CARRY, MOVE], maxCount: 2 },
    Upgrader: { body: [WORK, CARRY, MOVE], maxCount: 2 }
};

module.exports = roleDefinitions;