var creepHandler = {};

creepHandler.run = function() {
    for (var name in Game.creeps) {
        Game.creeps[name].work();
    }
};

module.exports = creepHandler;