const {redis, conn} = require("../database");
const Discord = require("discord.js")
const {postProfile} = require("../utils");
module.exports = {
    name: 'edit',
    description: 'Edit your profile',
    execute(client, message, args) {

        redis.get(message.author.id, async function(err, id) {
            if (id === null) {
                message.channel.send(`You are not logged in! Use \`profile!login\` to login`)
                return;
            }
            await message.author.send("Starting to edit profile.")
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I have started editing your profile in our DMs!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
            let result = await conn.query( `SELECT * FROM profiles WHERE profile_id = '${id}' LIMIT 1`)
            let userResult = JSON.parse(JSON.stringify(result));
            let post_location = undefined
            if (userResult[0].category === '1') post_location = '690375296041353256';
            if (userResult[0].category === '2') post_location = '690316760624398427';
            if (userResult[0].category === '3') post_location = '690374989718880298';
            if (userResult[0].category === '4') post_location = '690375440107438082';
            if (userResult[0].category === '5') post_location = '690316792454971424';
            if (userResult[0].category === '6') post_location = '690374954998300804';
            if (userResult[0].category === '7') post_location = '690316818275107106';
            if (userResult[0].category === '8') post_location = '690375752478228500';
            const Profile = new Discord.MessageEmbed()
                .setTitle(`**Editing ${userResult[0].name}'s Profile!** _ID: ${userResult[0].profile_id}_`)
                .setThumbnail(`https://minotar.net/helm/${userResult[0].IGN}/100.png`)
                .addField('**1** IGN', `${userResult[0].IGN}`)
                .addField('**2** Name', `${userResult[0].name}`)
                .addField('**3** Description', `${userResult[0].profile_description}`)
                .addField('**4** Age', `${userResult[0].age}`)
                .addField('**5** Nicknames', `${userResult[0].nicknames}`)
                .addField('**6** Sexuality', `${userResult[0].sexuality}`)
                .addField('**7** Category', `<#${post_location}>`)
                .addField('**8** Looking For', `${userResult[0].looking_for}`)
                .addField('**9** Languages', `${userResult[0].languages}`)
                .addField('**10** Quote(s)', `${userResult[0].quotes}`)
                .addField('**11** Interests', `${userResult[0].interests}`)
                .addField('**12** Physical description', `${userResult[0].physical_description}`)
                .addField('**13** Image', `${userResult[0].photo}`)
                .setImage(userResult[0].photo);

            await message.author.send(Profile)
            await message.author.send('What field would you like to edit? _Reply with the number of the field you want to edit or with #cancel to stop_')
            await message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                max: 1,
                time: 60000,
                errors: ["time"]
            }).then(collected => {
                if (collected.first().content === '1'){
                    message.author.send('Enter new **IGN**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id,{
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET IGN = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**IGN** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {message.author.send('It took you too long to reply.')})
                } else if (collected.first().content === '2') {
                    message.author.send('Enter new **Name**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id,{
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET name = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Name** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {message.author.send('It took you too long to reply.')})
                } else if (collected.first().content === '3') {
                    message.author.send('Enter new **Description**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET profile_description = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Nicknames** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                } else if (collected.first().content === '4') {
                    message.author.send('Enter new **Age**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET age = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Age** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                } else if (collected.first().content === '5') {
                    message.author.send('Enter new **Nicknames**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET nicknames = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Nicknames** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                } else if (collected.first().content === '6') {
                    message.author.send('Enter new **Sexuality**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET sexuality = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Sexuality** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                } else if (collected.first().content === '7') {
                    message.author.send('Enter new **Category**: \n**1** - Straight Male\n**2** - Bisexual Male\n**3** - Gay Male\n**4** - Straight Female\n**5** - Bisexual Female\n**6** - Lesbian Female\n**7** - Trans profiles\n**8** - They and them profiles\n`Only answer with a number! Failure to do so will get your profile removed!`');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET category = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Category** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                } else if (collected.first().content === '8') {
                    message.author.send('Enter new **Looking For**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET looking_for = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Looking For** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                }  else if (collected.first().content === '9') {
                    message.author.send('Enter new **Languages**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET languages = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Languages** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                }  else if (collected.first().content === '10') {
                    message.author.send('Enter new **Quote(s)**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET quotes = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Quote(s)** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                }  else if (collected.first().content === '11') {
                    message.author.send('Enter new **Interests**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET interests = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Interests** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                }  else if (collected.first().content === '12') {
                    message.author.send('Enter new **Physical description**:');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET physical_description = '${collected.first().content.replace(/'/g, "\\'")}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Physical description** successfully updated to **${collected.first().content}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                }  else if (collected.first().content === '13') {
                    message.author.send('Upload new **Image**\n\`Make sure to upload it! Sending a link will result in a error\`');
                    message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    }).then(collected => {
                        conn.query(`UPDATE profiles SET photo = '${collected.first().attachments.last().url}' WHERE (profile_id = '${id}');`)
                            .then(() => message.author.send(`**Looking For** successfully updated to **${collected.first().attachments.last().url}**`))
                            .then(() => postProfile(client, message, id))
                            .catch(e => message.author.send(`We could not edit this field! \`${e}\`\nReport this issue to a founder!`))
                    }).catch(e => {
                        message.author.send('It took you too long to reply.')
                    })
                }
            }).catch(e => {message.author.send('It took you too long to reply.')})

        });
    },
};