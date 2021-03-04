const Command = require("./type/Command");
const fs = require('fs')

class AdminCommand extends Command {
    async execute(client, message, args) {
        if (!message.member.hasPermission('ADMINISTRATOR')) message.reply('You need the `ADMINISTRATOR` permission to use this command!')
        if (args.length < 1) return message.reply('You didn\'t use the command properly!');
        if (args[0].toLowerCase() === 'questions') {
            if (args[1] === undefined) {
                let guildConfig = JSON.parse(fs.readFileSync(`./data/${message.guild.id}.json`));
                console.log(JSON.stringify(guildConfig))
                if (!guildConfig.questions) {
                    guildConfig.questions = []
                    console.log(JSON.stringify(guildConfig))
                    fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(guildConfig), 'utf-8')
                }
                let response = ""
                if (guildConfig.questions.length === 0) {
                    response = "This guild does not have any questions set up! Add them with `" + require('../config.json').prefix + "admin questions add`!"
                } else {
                    response = `**__Questions set up for this guild__ [${guildConfig.questions.length}/15]**`
                    for (let n = 0; n < guildConfig.questions.length; n++) {
                        response += `\n**${n + 1}** - ${guildConfig.questions[n].question}`
                    }
                    response += '\nUse `' + require('../config.json').prefix + 'admin questions manage` to manage them.';
                }
                message.reply(response);
            } else if (args[1].toLowerCase() === 'add') {
                let guildConfig = JSON.parse(fs.readFileSync(`./data/${message.guild.id}.json`));
                if (guildConfig.questions.length > 15) return message.reply('This guild already reached the maximum amount of questions (15)')
                let newQuestion = {}
                await message.channel.send('What will be the name of the question? *(what will show up in the profile)*')
                await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                    max: 1,
                    time: 600000,
                    errors: ["time"]
                }).then(collected => {
                    newQuestion.name = collected.first().content;
                })
                await message.channel.send('What will be the question be? *(what will be asked once creating or editing the profile)*')
                await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                    max: 1,
                    time: 600000,
                    errors: ["time"]
                }).then(collected => {
                    newQuestion.question = collected.first().content;
                }).catch(()=>message.reply('you took too long!'))
                guildConfig.questions.push(newQuestion)
                fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(guildConfig), 'utf-8')
                message.channel.send(`**Question added!**\n*Name:* ${newQuestion.name}\n*Question:* ${newQuestion.question}`)
            } else if (args[1].toLowerCase() === 'manage') {
                let guildConfig = JSON.parse(fs.readFileSync(`./data/${message.guild.id}.json`));
                console.log(JSON.stringify(guildConfig))
                if (!guildConfig.questions) {
                    guildConfig.questions = []
                    console.log(JSON.stringify(guildConfig))
                    fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(guildConfig), 'utf-8')
                }
                let list = ""
                if (guildConfig.questions.length === 0) {
                    list = "This guild does not have any questions set up! Add them with `" + require('../config.json').prefix + "admin questions add`!"
                } else {
                    list = `**__Managing questions__ [${guildConfig.questions.length}/15]**`
                    for (let n = 0; n < guildConfig.questions.length; n++) {
                        list += `\n**${n + 1}** - ${guildConfig.questions[n].question}`
                    }
                    list += '\nReply with the number you want to edit.'
                }
                await message.channel.send(list);
                await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                    max: 1,
                    time: 600000,
                    errors: ["time"]
                }).then(collected => {
                    if (isNaN(collected.first().content) || !guildConfig.questions[collected.first().content-1]) return message.reply('you did not provide a valid number.');
                    const editing = collected.first().content-1
                    message.channel.send(`__**Editing question**__\n**1** - **Name:** ${guildConfig.questions[editing].name}\n**2** - **Question:** ${guildConfig.questions[editing].question}\nReply with the number of option you want to edit.`)
                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 600000,
                        errors: ["time"]
                    }).then(collected => {
                        if (collected.first().content ===! "1" || collected.first().content ===! "2") return message.reply('you did not provide a valid number.');
                        if (collected.first().content === "1"){
                            message.channel.send('Enter the new question name.')
                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 600000,
                                errors: ["time"]
                            }).then(collected => {
                                guildConfig.questions[editing].name = collected.first().content;
                                fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(guildConfig), 'utf-8')
                                message.reply('question name updated!')
                            }).catch(()=>message.reply('you took too long!'))
                        } else {
                            message.channel.send('Enter the new question question.')
                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 600000,
                                errors: ["time"]
                            }).then(collected => {
                                guildConfig.questions[editing].question = collected.first().content;
                                fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(guildConfig), 'utf-8')
                                message.reply('question question updated!')
                            }).catch(()=>message.reply('you took too long!'))
                        }//todo add question types
                    }).catch(()=>message.reply('you took too long!'))
                }).catch(()=>message.reply('you took too long!'))
            }
        }
    }
}

module.exports = new AdminCommand("admin", "Administration command.");