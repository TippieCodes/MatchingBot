const {conn} = require("../database")
const {checkMatches} = require('../utils')
const Discord = require('discord.js')
const {removeProfile} = require("../utils");
const storage = require('node-sessionstorage')
function like(user, like_type, liked_by, liked_id, liked_by_name, liked_name, guild, client){
    if (like_type !== 'superlike') {
        conn.query(`INSERT INTO likes (likedby, liked, liketype) VALUES ('${liked_by}', '${liked_id}', '${like_type}');`)
            .then(() => {
                user.send(`**${liked_by_name}** ${like_type}d **${liked_name}**`)
                checkMatches(client, liked_by, guild)
            })
            .catch(e => user.send(`We couldn't process this ${like_type}!\n\`${e}\``))
    } else if (like_type === 'superlike') {
        user.send(`Superlikes are not enabled yet! This is a planned feature.`)
    }
}
module.exports = async (client, reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }
    let guild = reaction.message.guild
    if (reaction.message.channel.parentID !== '690316702529224704') return;
    const id = storage.getItem(user.id)
    run(err, id ,client, reaction, user);
    await reaction.users.remove(user.id);
};

async function run(err, id ,client, reaction, user) {
    if (id === null) {
        user.send(`You are not logged in! Use \`profile!login\` to login`)
        return;
    }
    let liked_id = undefined
    let liked_by = id
    let like_type = undefined
    let liked_name = undefined
    let liked_by_name = undefined
    let stop = false
    if (reaction.emoji.id === '693767342190100551') {
        like_type = 'like'
    } else if (reaction.emoji.id === '693767359193939988') {
        like_type = 'dislike'
    } else if (reaction.emoji.id === '693767366911197194') {
        like_type = 'superlike'
    } else if (reaction.emoji.name === '❓') {
        await conn.query(`SELECT * FROM profile_posts WHERE message_id = '${reaction.message.id}' LIMIT 1`)
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result))
                let profileId = userResult[0].profile_id;
                return conn.query(`SELECT * FROM profiles WHERE profile_id = '${profileId}' LIMIT 1`)
            })
            .then(result =>{
                let userResult = JSON.parse(JSON.stringify(result))
                let post_location = undefined
                if (userResult[0].category === '1') post_location = '690375296041353256';
                if (userResult[0].category === '2') post_location = '690316760624398427';
                if (userResult[0].category === '3') post_location = '690374989718880298';
                if (userResult[0].category === '4') post_location = '690375440107438082';
                if (userResult[0].category === '5') post_location = '690316792454971424';
                if (userResult[0].category === '6') post_location = '690374954998300804';
                if (userResult[0].category === '7') post_location = '690316818275107106';
                if (userResult[0].category === '8') post_location = '690375752478228500';
                let profileInfo = new Discord.MessageEmbed()
                    .setTitle(`**${userResult[0].name}'s Profile!**`)
                    .setThumbnail(`https://minotar.net/helm/${userResult[0].IGN}/100.png`)
                    .addField('Profile ID', `${userResult[0].profile_id}`, true)
                    .addField('Profile Owner', `<@${userResult[0].profile_owner}>`, true)
                    .addField('Location', `<#${post_location}>`, true)
                user.send(profileInfo);
            })
        return;
    } else if (reaction.emoji.name === '❌') {
        await conn.query(`SELECT * FROM profile_posts WHERE message_id = '${reaction.message.id}' LIMIT 1`)
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result))
                let profileId = userResult[0].profile_id;
                return conn.query(`SELECT * FROM profiles WHERE profile_id = '${profileId}' LIMIT 1`)
            })
            .then(result => {
                let userResult = JSON.parse(JSON.stringify(result))
                user.send(`Are you sure you want to delete **${userResult[0].name}'s** profile which is owned by **<@${userResult[0].profile_owner}>** [Yes/No]`)
                    .then(m => {
                        m.react('✔').then(() => m.react('❌'))
                        const filter = (reaction1, user1) => {
                            return ['✔', '❌'].includes(reaction1.emoji.name) && user1.id === user.id;
                        };
                        m.awaitReactions(filter,{ max: 1, time: 60000, errors: ['time'] })
                            .then(collected => {
                                const reaction = collected.first();

                                if (reaction.emoji.name === '✔') {
                                    removeProfile(m, userResult[0].profile_id, client)
                                        .then(() => {
                                            user.send(`Profile sucessfully removed!`)
                                            client.users.fetch(userResult[0].profile_owner).then(user3 => {
                                                user3.send(`Your profile **${userResult[0].name}** has been removed by an administrator!`)
                                            })
                                        })
                                        .catch(e => {
                                            user.send(`A error occured while removing your profile\n \`\`\`${e}\`\`\``)
                                        })
                                } else {
                                    user.send('Cancelled profile removal!');
                                }
                            })
                            .catch(collected => {
                                user.send('It took you too long to decided, we cancelled the profile removal for you.')
                            })
                    })
            })
        return;
    }
    if (like_type === undefined) {
        user.send(`We couldn't identify the type of like!`)
        stop = true;
        return;
    }
    await conn.query(`SELECT * FROM profiles WHERE profile_id = '${liked_by}' LIMIT 1`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result))
            liked_by_name = userResult[0].name
        });
    await conn.query(`SELECT * FROM profile_posts WHERE message_id = '${reaction.message.id}' LIMIT 1`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result))
            liked_id = userResult[0].profile_id
            return conn.query(`SELECT * FROM profiles WHERE profile_id = '${liked_id}' LIMIT 1`)
        })
        .catch(e => {
            user.send('The profile you liked is a ghost profile! Ask the creator to do `profile!post` to fix it.\nIf this keeps happening contact a founder with the following error code\n```' + e + '```');
            stop = true
            return Promise.reject();
        })
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result));
            let likedownerid = userResult[0].profile_owner;
            liked_name = userResult[0].name
            if (likedownerid === user.id) {
                stop = true
                user.send(`You cannot ${like_type} your own profile!`)
            }
        })
        .catch(e => {
            stop = true;
            console.log(e)
        });
    if (stop === true) return;
    await conn.query(`SELECT * FROM likes WHERE likedby = '${liked_by}' AND liked = '${liked_id}'`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result));
            if (!result.length) {
                like(user, like_type, liked_by, liked_id, liked_by_name, liked_name, guild, client);
                return;
            }
            let itemsProcessed = 0;
            userResult.forEach(async function (obj) {
                itemsProcessed++;
                if (like_type === obj.liketype && like_type !== 'superlike') {
                    await conn.query(`DELETE FROM likes WHERE (like_id = '${obj.like_id}')`)
                        .then(result => {
                            user.send(`**${liked_by_name}** un${like_type}d **${liked_name}**`)
                            stop = true
                        })
                        .catch(e => {
                            user.send(`We couldn't process this ${like_type}!\n\`${e}\``)
                            stop = true
                        });
                } else if (like_type === obj.liketype && like_type === 'superlike') {
                    user.send(`**${liked_by_name}** already superliked **${liked_name}**`)
                    stop = true
                } else if (itemsProcessed === userResult.length) {
                    if (stop === true) return;
                    like(user, like_type, liked_by, liked_id, liked_by_name, liked_name, guild, client);
                }
            })
        })
}