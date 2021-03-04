const {redis} = require(`../database`)
module.exports = {
    name: 'logout.js',
    description: 'Logout of your profile.',
    execute(client, message, args) {
        redis.del(message.author.id)
        message.channel.send(`Sucessfully logged out!`)
    },
};