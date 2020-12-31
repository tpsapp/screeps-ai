// Setup export object
var helperFunctions = {};

// A logging function to send formatted messages to the in-game console and email using the built-in notify function
helperFunctions.log = function (message, doNotify) {
    // Prepend the current Game time to the message being sent.
    message = Game.time + "> " + message;

    // Output the message to the in-game console
    console.log(message);

    // Check to see if an email notification should be sent
    if (doNotify) {
        // Email the message as a notification
        Game.notify(message);
    }
};

// A function to check if a certain number of tick have passed
helperFunctions.isOutdated = function (room, label, delay) {
    // Check to see if the difference between the Game time stored in the specified rooms memory
    // And the current Game time is less than the specified delay
    if (Game.time - room.memory[label] < delay) {
        // Return false as the delay has not passed
        return false;
    }

    // Return true as the delay has passed
    return true;
};

// Export the helperFunctions object for use in other files
module.exports = helperFunctions;
