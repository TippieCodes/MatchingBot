const {conn, redis} = require("../database");
const {postProfile, loginProfile} = require("../utils");

String.prototype.isNumber = function() {
    return /^\d+$/.test(this);
};

module.exports = {
    name: 'login',
    description: 'Login to your profile!',
    execute(client, message, args) {
        let names = []
        let ids = []
        conn.query(`SELECT * FROM profiles WHERE profile_owner = '${message.author.id}'`)
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result));
                let itemsProcessed = 0;
                let itemsProcessed1 = 0;
                let msg = `**__Your Profiles:__**`
                let i = 0
                if (!userResult.length){
                    message.channel.send('You dont have a profile yet, use `profile!create` to get started!')
                }
                userResult.forEach(async function (obj) {
                    names.push(obj.name);
                    ids.push(obj.profile_id);
                    itemsProcessed++;
                    if(itemsProcessed === userResult.length) {
                        names.forEach(function(name) {
                            msg = msg + `\n**${i}** - ${name}`;
                            i++;
                            itemsProcessed1++;
                            if (itemsProcessed1 === names.length){
                                msg = msg + `\n*Reply with the number of the profile you want to login with.*`
                                message.channel.send(msg);
                                let filter = m => parseInt(m.content) <= i && m.author === message.author
                                message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                    .then(collected => {
                                        let number = parseInt(collected.first().content)
                                        let login_id = ids[number]
                                        loginProfile(message, login_id).then(name => {
                                            message.channel.send(`Successfully logged in as **${name}**`)
                                        })
                                    })
                                    .catch(collected => message.channel.send(`You failed to choose a profile in time.`));
                            }
                        })
                    }
                });
            });
    },
};