const Command = require("./type/Command");
class pingCommand extends Command {
    execute(client, message, args) {
        message.channel.send('Pong.');
    }
}

module.exports = new pingCommand("ping", "Test if the bot is responding or not");