const {conn} = require("../database")
const {postProfile, loginProfile} = require("../utils")
const Command = require('./type/Command')
const questions = [
    "`OOC` What is your IGN?",
    "What is your name?",
    "How old are you?",
    "Do you have any nicknames? (answer `None` if none.)",
    "What is your sexuality?",
    "Under what category would your profile fit?\n**1** - Straight Male\n**2** - Bisexual Male\n**3** - Gay Male\n**4** - Straight Female\n**5** - Bisexual Female\n**6** - Lesbian Female\n**7** - Trans profiles\n**8** - They and them profiles\n`Only answer with a number! Failure to do so will get your profile removed!`",
    "What are you looking for? (Friendship, love, man, woman, etc.)",
    "What are your interests?",
    "Which languages do you speak?",
    "Your profile description? (Include a short description about yourself and your personality, like hobbies or favorite places.)",
    "What is your character's physical description? (Your character is not speaking here, describe yourself so people can get a better idea of what they're looking at.)",
    "A quote of you? (Optional, if none answer `None`)",
    "Upload a Photo of yourself `OOC:`(Of your character, can be a namemc render or a photo taken in game)\n\`Make sure to upload it! Sending a link will result in a error\`"
];

const applying = [];
function createProfile(client, message, args){
    return new Promise(async function(resolve, reject) {
        if (applying.includes(message.author.id)) return reject('You are already creating a profile, continue in your DMs!');
        try {
            console.log(`${message.author.tag} began creating a profile.`);

            applying.push(message.author.id);
            await message.author.send(":pencil: **Profile creation started!** Type `#cancel` to exit.\nRemember! **Everything is IC, Pretend like your character is filling in this form!!**\n`Note:` Do not use emoticons!")
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I have started profile creation in our DMs!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                    applying.splice(applying.indexOf(message.author.id), 1);
                });

            let answers = []
            for (let i = 0, cancel = false; i < questions.length && cancel === false; i++) {
                await message.author.send(questions[i]);
                await message.author.dmChannel.awaitMessages(m => m.author.id === message.author.id, {
                    max: 1,
                    time: 600000,
                    errors: ["time"]
                })
                    .then(collected => {
                        answers.push(collected);
                        if (collected.first().content.toLowerCase() === "#cancel") {
                            message.author.send(":x: **Profile creation cancelled.**");
                            applying.splice(applying.indexOf(message.author.id), 1);
                            cancel = true;
                            console.log(`${message.author.tag} cancelled their profile creation.`);
                        }
                    }).catch(() => {
                        message.author.send(":hourglass: **Application timed out.**");
                        applying.splice(applying.indexOf(message.author.id), 1);
                        cancel = true;

                        console.log(`${message.author.tag} let their profile creation time out.`);
                    });
                if (i === questions.length - 1) {
                    applying.splice(applying.indexOf(message.author.id), 1);
                    let image = undefined
                    if (answers[12].first().attachments.last().url) {
                        image = answers[12].first().attachments.last().url;
                    } else if (answers[12].first().content) {
                        image = answers[12].first().content;
                    }
                    // console.log(`INSERT INTO profiles (profile_owner, IGN, name, nicknames, age, sexuality, category, looking_for, interests, languages, profile_description, physical_description, quotes, photo) VALUES ('${message.author.id}' , '${answers[0].first().content.replace(/'/g, "\\'")}', '${answers[1].first().content.replace(/'/g, "\\'")}', '${answers[3].first().content.replace(/'/g, "\\'")}', '${answers[2].first().content.replace(/'/g, "\\'")}', '${answers[4].first().content.replace(/'/g, "\\'")}', '${answers[5].first().content.replace(/'/g, "\\'")}', '${answers[6].first().content.replace(/'/g, "\\'")}', '${answers[7].first().content.replace(/'/g, "\\'")}', '${answers[8].first().content.replace(/'/g, "\\'")}', '${answers[9].first().content.replace(/'/g, "\\'")}','${answers[10].first().content.replace(/'/g, "\\'")}', '${answers[11].first().content.replace(/'/g, "\\'")}', '${image}');`)
                    await conn.query(`INSERT INTO profiles (profile_owner, IGN, name, nicknames, age, sexuality, category, looking_for, interests, languages, profile_description, physical_description, quotes, photo) VALUES ('${message.author.id}' , '${answers[0].first().content.replace(/'/g, "\\'")}', '${answers[1].first().content.replace(/'/g, "\\'")}', '${answers[3].first().content.replace(/'/g, "\\'")}', '${answers[2].first().content.replace(/'/g, "\\'")}', '${answers[4].first().content.replace(/'/g, "\\'")}', '${answers[5].first().content.replace(/'/g, "\\'")}', '${answers[6].first().content.replace(/'/g, "\\'")}', '${answers[7].first().content.replace(/'/g, "\\'")}', '${answers[8].first().content.replace(/'/g, "\\'")}', '${answers[9].first().content.replace(/'/g, "\\'")}','${answers[10].first().content.replace(/'/g, "\\'")}', '${answers[11].first().content.replace(/'/g, "\\'")}', '${image}');`)
                        .then(() => {
                            message.author.send(":thumbsup: **You're all done!**");
                            console.log(`${message.author.tag} finished creating their profile.`);
                            conn.query(`SELECT * FROM kd.profiles WHERE name = '${answers[1].first().content.replace(/'/g, "\\'")}' LIMIT 1`)
                                .then(result => {
                                    let userResult = JSON.parse(JSON.stringify(result));
                                    userResult.forEach(function (obj) {
                                        let profile_id = obj.profile_id;
                                        resolve(profile_id);
                                    })
                                }).catch(e => reject(e))
                        })
                        .catch(e => {
                            message.author.send(`There was an error while creating your profile! This might have something if you use \`'\` in one of your answers. Try not to use them.\nIf this keeps happening DM a founder with the following error \`${e}\``);
                            console.error(`${message.author.tag} exited profile creation with error ${e}`);

                        })
                }
            }

        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

class CreateCommand extends Command {

    execute(client, message, args) {
        createProfile(client, message, args).then(id => {
            postProfile(client, message, id);
            loginProfile(message, id);
        }).catch(e => {
            message.reply(`Failed to create your profile.\n\`${e}\``)
        });
    }
}

module.exports = new CreateCommand('create', 'Create your profile!');