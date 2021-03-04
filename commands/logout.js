const storage = require('node-sessionstorage')
const Command = require('./type/Command')

class LogoutCommand extends Command {

    execute(client, message, args) {
        storage.set(message.author.id)
        message.channel.send(`Sucessfully logged out!`)
    }
}

module.exports = new LogoutCommand('logout', 'Logout of your profile.');
