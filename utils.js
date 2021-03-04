let {conn, redis} = require("./database.js");
const Discord = require("discord.js")
const config = require("./config.json")

function fetchMessageByIds(message_id, channel_id, client) {
    return new Promise(function (resolve, reject) {
        let message_channel = client.channels.cache.get(channel_id);
        message_channel.messages.fetch(message_id).then(m => {
            resolve(m);
        }).catch(e => {
            reject(e);
        })
    });
}

async function newMatch(client, profile1, profile2, guild) {
    let profile1_id = undefined
    let profile2_id = undefined
    let profile1_name = undefined
    let profile2_name = undefined
    let match_id = undefined
    let stop = false
    await conn.query(`SELECT * FROM profiles WHERE profile_id = '${profile1}' LIMIT 1`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result));
            profile1_id = userResult[0].profile_owner
            profile1_name = userResult[0].name
        })
    await conn.query(`SELECT * FROM profiles WHERE profile_id = '${profile2}' LIMIT 1`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result));
            profile2_id = userResult[0].profile_owner
            profile2_name = userResult[0].name
        })
    let match_channel = await guild.channels.create('match-undefined', {
        type: 'text',
        parent: config.match_channel_category_id,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
            },
            {
                id: profile1_id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
            },
            {
                id: profile2_id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
            },
        ],
    }).catch(e => {
        client.users.fetch(config.ownerID).then(tippie => {
            tippie.send('A error occured! **Fix this!**\n```' + e + '```')
            stop = true
        })
    })
    if (stop === true) return;
    let webhook = await match_channel.createWebhook('proxy')
    await conn.query(`INSERT INTO matches (profile1, profile2, match_channel) VALUES ('${profile1}', '${profile2}', '${match_channel.id}');`)
    await conn.query(`INSERT INTO kd.proxies (channelid, discordid, profileid, webhookID, webhookToken) VALUES ('${match_channel.id}', '${profile1_id}', '${profile1}', '${webhook.id}', '${webhook.token}');`)
    await conn.query(`INSERT INTO kd.proxies (channelid, discordid, profileid, webhookID, webhookToken) VALUES ('${match_channel.id}', '${profile2_id}', '${profile2}', '${webhook.id}', '${webhook.token}');`)
    await conn.query(`SELECT * FROM matches WHERE match_channel = '${match_channel.id}'`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result));
            match_id = userResult[0].match_id
        })
    await match_channel.setName('match-' + match_id)
    let matches_channel = await client.channels.fetch('698950537772662965');
    await matches_channel.send(`:smiling_face_with_3_hearts: **__MATCH__** :smiling_face_with_3_hearts: \n\n**${profile1_name} (<@${profile1_id}>)** and **${profile2_name} (<@${profile2_id}>)** have matched! You may now feel free to message each other through the tinder app, or just through your normal phone numbers.`);
    await match_channel.send(`**${profile1_name} (<@${profile1_id}>)** and **${profile2_name} (<@${profile2_id}>)**\n\n**Welcome to your private text channel!**\nFeel free to text here, or exchange numbers if you prefer.\n*keep in mind that this text channel may be delted if it is found inactive and this is all IC*\n` + "``` ```")
}

module.exports = {
    fetchMessageByIds,
    newMatch,
    clean: function clean(text) {
        if (typeof (text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    },
    postProfile: function postProfile(client, message, profile_id, location) {
        return new Promise(function (resolve, reject) {
        let pre_location = location
        let post_location = undefined
        let post = true
        conn.query(`SELECT * FROM profile_posts WHERE profile_id = '${profile_id}'`)
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result));
                userResult.forEach(async function (obj) {
                    let old_profile_id = obj.profile_id;
                    let old_message_id = obj.message_id;
                    let old_channel_id = obj.channel_id;

                    if (`${old_profile_id}` === `${profile_id}`) {
                        fetchMessageByIds(`${old_message_id}`, `${old_channel_id}`, client)
                            .then(msg => {
                                msg.delete().then(() =>{
                                    let q = `DELETE FROM profile_posts WHERE (post_id = '${obj.post_id}');`
                                    conn.query(q);
                                }).catch(e => {
                                    reject(e);
                                    post = false
                                });
                            })
                            .catch(e => {
                                message.channel.send(`An exeption occured!\n${e.message}\nThis might be nothing special, but if your profile is not posted now please contact a founder!`);
                                let q = `DELETE FROM profile_posts WHERE (post_id = '${obj.post_id}');`
                                conn.query(q);
                            })
                            .catch(e => {
                                reject(e);
                            });
                    }
                });
                return conn.query(`SELECT * FROM profiles WHERE profile_id = '${profile_id}'`);
            })
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result));
                userResult.forEach(async function (obj) {
                    if (!pre_location) {
                        if (obj.category === '1') post_location = '690375296041353256';
                        if (obj.category === '2') post_location = '690316760624398427';
                        if (obj.category === '3') post_location = '690374989718880298';
                        if (obj.category === '4') post_location = '690375440107438082';
                        if (obj.category === '5') post_location = '690316792454971424';
                        if (obj.category === '6') post_location = '690374954998300804';
                        if (obj.category === '7') post_location = '690316818275107106';
                        if (obj.category === '8') post_location = '690375752478228500';
                        if (!obj.category > '0' && !obj.category < '9') {
                            post = false;
                            client.users.fetch(obj.owner_id).then(u => {
                                u.send("Your profile's category is wrong!")
                            })
                            return;
                        }
                    } else if (pre_location) {
                        post_location = pre_location
                    }
                    if (post === true && post_location) {
                        const Profile = new Discord.MessageEmbed()
                            .setTitle(`**${obj.name}'s Profile!**`)
                            .setThumbnail(`https://minotar.net/helm/${obj.IGN}/100.png`)
                            .setDescription(`${obj.profile_description}`)
                            .addField('Name', `${obj.name}`, true)
                            .addField('Age', `${obj.age}`, true)
                            .addField('Nicknames', `${obj.nicknames}`, true)
                            .addField('Sexuality', `${obj.sexuality}`, true)
                            .addField('Looking For', `${obj.looking_for}`, true)
                            .addField('Languages', `${obj.languages}`, true)
                            .addField('Quote(s)', `${obj.quotes}`, true)
                            .addField('Interests', `${obj.interests}`, false)
                            .addField('Physical description', `${obj.physical_description}`, false)
                            .setImage(obj.photo);

                        let post_channel = client.channels.cache.find(c => c.id === post_location);
                        await post_channel.send(Profile).then(m => {
                            conn.query(`INSERT INTO profile_posts (profile_id, message_id, channel_id) VALUES ('${profile_id}', '${m.id}', '${m.channel.id}');`);
                            m.react('693767342190100551')
                                .then(() => m.react('693767359193939988'))
                                .then(() => resolve());
                        }).catch(e => {
                            reject(e);
                        })
                    }
                });
            });
        });
    },
    loginProfile: function loginProfile(message, profile_id) {
        return new Promise(function(resolve, reject) {
        conn.query(`SELECT * from profiles WHERE profile_id = '${profile_id}'`)
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result));
                userResult.forEach(async function (obj) {
                    if (`${obj.profile_owner}` === `${message.author.id}`) {
                        redis.set(message.author.id, profile_id)
                        resolve(obj.name)
                    } else {
                        reject();
                    }
                })
            })
        })
    },
    removeProfile: function removeProfile(message, profile_id, client) {
        return new Promise(function(resolve, reject) {
            redis.del(message.author.id)
            conn.query(`SELECT * FROM matches WHERE profile1 = '${profile_id}' or profile2 = '${profile_id}'`)
                .then(result => {
                    let userResult = JSON.parse(JSON.stringify(result));
                    userResult.forEach(function (obj) {
                        client.channels.fetch(obj.match_channel)
                            .then(channel => {
                                channel.delete()
                                    .then(r => {
                                        conn.query(`DELETE FROM matches WHERE match_id = '${obj.match_id}'`)
                                    })
                                    .catch(e => {
                                        message.reply('A error occurred\n```' + e + "```")
                                    })
                            })
                            .catch(e => {
                                conn.query(`DELETE FROM matches WHERE match_id = '${obj.match_id}'`)
                                message.reply('A error occurred\n```' + e + "```")
                            })
                        conn.query(`SELECT * FROM proxies WHERE channelid = '${obj.match_channel}'`)
                            .then(result =>{
                                let userResult = JSON.parse(JSON.stringify(result));
                                userResult.forEach(function (obj) {
                                    conn.query(`DELETE FROM proxies WHERE proxyid = '${obj.proxyid}'`)
                                })
                            })
                    })
                })
            conn.query(`SELECT * FROM likes WHERE likedby = '${profile_id}' or liked = '${profile_id}'`)
                .then(result => {
                    let userResult = JSON.parse(JSON.stringify(result));
                    userResult.forEach(function (obj) {
                        conn.query(`DELETE FROM likes WHERE like_id = '${obj.like_id}'`)
                    })
                })
            conn.query(`SELECT * FROM profile_posts WHERE profile_id = '${profile_id}'`)
                .then(result => {
                    let userResult = JSON.parse(JSON.stringify(result));
                    userResult.forEach(async function (obj) {
                        let old_profile_id = obj.profile_id;
                        let old_message_id = obj.message_id;
                        let old_channel_id = obj.channel_id;

                        if (`${old_profile_id}` === `${profile_id}`) {
                            fetchMessageByIds(`${old_message_id}`, `${old_channel_id}`, client)
                                .then(msg => {
                                    msg.delete().then(() => {
                                        let q = `DELETE FROM profile_posts WHERE (post_id = '${obj.post_id}');`
                                        conn.query(q);
                                    }).catch(e => {
                                        reject(e);
                                    });
                                })
                                .catch(e => {
                                    message.channel.send(`An exeption occured!\n${e.message}\nThis might be nothing special, but if your profile is not posted now please contact a founder!`);
                                    let q = `DELETE FROM profile_posts WHERE (post_id = '${obj.post_id}');`
                                    conn.query(q);
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        }
                    });
                    return conn.query(`DELETE FROM profiles WHERE (profile_id = '${profile_id}')`);
                })
                .then(() => {
                    resolve()
                })
                .catch(e => {
                    reject(e)
                });
        })
    },
    checkMatches: function checkMatches(client, profile_id, guild){
        return new Promise(function (resolve, reject) {

        let new_matches = 0
        conn.query(`SELECT * FROM likes WHERE likedby = '${profile_id}' AND liketype = 'like'`)
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result));
                let itemsProcessed = 0
                if (!userResult.length){
                    resolve(`You haven't liked any profiles yet!`);
                }
                userResult.forEach(async function (obj) {
                    let new_match_1 = undefined
                    let new_match_2 = undefined
                    let stop = false
                    await conn.query(`SELECT * FROM likes WHERE likedby = '${obj.liked}' AND liked = '${profile_id}' AND liketype = 'like' LIMIT 1`)
                        .then(result =>  {
                            let userResult = JSON.parse(JSON.stringify(result));
                            if (!userResult.length) return 'stop';
                            new_match_1 = profile_id
                            new_match_2 = obj.liked
                            return conn.query(`SELECT * FROM matches WHERE ( profile1 = '${new_match_1}' OR profile1 = '${new_match_2}' ) AND ( profile2 = '${new_match_1}' OR profile2 = '${new_match_2}' ) LIMIT 1`)
                        })
                        .then(result => {
                            if (result === 'stop') return;
                            let userResult = JSON.parse(JSON.stringify(result))
                            if (userResult.length) return;
                            new_matches = new_matches + 1
                            newMatch(client, new_match_1, new_match_2, guild);
                        })
                        .catch(e => console.log(e))
                    itemsProcessed++;
                    if (itemsProcessed === userResult.length) {
                        resolve(new_matches);
                    }
                })
            })
        })
    }
}

