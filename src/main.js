var prototypes = require('prototypeFunctions');
var creepHandler = require('creepHandler');
var helper = require('helperFunctions');
var memoryHandler = require('memoryHandler');
var roomHandler = require('roomHandler');

module.exports.loop = function() {
    memoryHandler.cleanUp();
    roomHandler.run();
    creepHandler.run();
    if (Game.cpu.bucket >= 5000) {
        if(Game.shard.name !== 'Blackhole') {
            Game.cpu.generatePixel();
        }
    }
};
