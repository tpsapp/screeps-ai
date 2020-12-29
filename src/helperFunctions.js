var helperFunctions = {};

helperFunctions.log = function(message, doNotify) {
    message = Game.time + "> " + message;

    console.log(message);

    if (doNotify) {
        Game.notify(message);
    }
};

helperFunctions.isOutdated = function(room, label, delay) {
    if (Game.time - room.memory[label] < delay) {
        return false;
    }

    return true;
}

module.exports = helperFunctions;