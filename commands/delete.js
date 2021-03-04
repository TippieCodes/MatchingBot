const {redis, conn} = require("../database")
const {removeProfile} = require("../utils")
module.exports = {
    name: 'delete',
    aliases: ['remove'],
    description: 'Repost your profile to be earlier in a channel!',
    execute(client, message, args) {
        redis.get(message.author.id, function(err, id){
            if (id === null) {
                message.channel.send(`You are not logged in! Use \`profile!login\` to login`)
                return;
            }
            conn.query(`SELECT * FROM profiles WHERE profile_id = '${id}'`)
                .then(result => {
                    let userResult = JSON.parse(JSON.stringify(result));
                    userResult.forEach(function (obj) {
                        message.channel.send(`Are you sure you want to remove the profile for ${obj.name}`)
                            .then(m => {
                                m.react('✔').then(() => m.react('❌'))
                                const filter = (reaction, user) => {
                                    return ['✔', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                                };
                                m.awaitReactions(filter,{ max: 1, time: 60000, errors: ['time'] })
                                    .then(collected => {
                                        const reaction = collected.first();

                                        if (reaction.emoji.name === '✔') {
                                            removeProfile(message, id, client)
                                                .then(() => {
                                                    message.channel.send(`Profile sucessfully removed!`)
                                                })
                                                .catch(e => {
                                                    message.channel.send(`A error occured while removing your profile\n \`\`\`${e}\`\`\``)
                                                })
                                        } else {
                                            message.channel.send('Cancelled profile removal!');
                                        }
                                    })
                                    .catch(collected => {
                                        message.channel.send('It took you too long to decided, we cancelled the profile removal for you.')
                                    })
                            });
                    })
                })
        })
    },
};