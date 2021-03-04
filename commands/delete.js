const {conn} = require("../database")
const {removeProfile} = require("../utils")
const UserCommand = require('./type/UserCommand')

class DeleteCommand extends UserCommand {

    executeUser(client, message, args, id) {
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
    }
}
module.exports = new DeleteCommand('delete', 'Delete your profile.', 0 , ['remove']);