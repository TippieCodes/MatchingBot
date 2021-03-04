const {redis} = require("../database")
const {postProfile} = require("../utils")
module.exports = {
    name: 'bump',
    aliases: ['post', 'repost'],
    description: 'Repost your profile to be earlier in a channel!',
    cooldown: 3600,
    execute(client, message, args) {
        redis.get(message.author.id, function(err, id){
            if (id === null) {
                message.channel.send(`You are not logged in! Use \`profile!login\` to login`)
                return;
            }
            postProfile(client, message, id).then(() => message.channel.send(`Profile successfully posted/bumped!`))
        })
    },
};