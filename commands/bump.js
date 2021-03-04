const {postProfile} = require("../utils")
const UserCommand = require('./type/UserCommand')

class bumpCommand extends UserCommand {
    executeUser(client, message, args, id) {
        postProfile(client, message, id).then(() => message.channel.send(`Profile successfully posted/bumped!`))
    }
}

module.exports = new bumpCommand('bump', 'Repost your profile to be earlier in a channel!', 3600, ['post', 'repost']);
