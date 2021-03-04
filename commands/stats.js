const {redis, conn} = require(`../database`)
const Discord = require("discord.js")
module.exports = {
    name: 'stats',
    description: 'See your profile stats',
    execute(client, message, args) {
        redis.get(message.author.id, async function(err, id) {
            if (id === null) {
                message.channel.send(`You are not logged in! Use \`profile!login\` to login`)
                return;
            }
            let result = await conn.query( `SELECT * FROM profiles WHERE profile_id = '${id}' LIMIT 1`)
            let userResult = JSON.parse(JSON.stringify(result));
            let result_liked = await conn.query(`SELECT * FROM likes WHERE likedby = '${id}' AND liketype = 'like'`)
            let userResult_liked = JSON.parse(JSON.stringify(result_liked));
            let profile_liked = userResult_liked.length
            let result_disliked = await conn.query(`SELECT * FROM likes WHERE likedby = '${id}' AND liketype = 'dislike'`)
            let userResult_disliked = JSON.parse(JSON.stringify(result_disliked));
            let profile_disliked = userResult_disliked.length
            let result_likes = await conn.query(`SELECT * FROM likes WHERE liked = '${id}' AND liketype = 'like'`)
            let userResult_likes = JSON.parse(JSON.stringify(result_likes));
            let profile_likes = userResult_likes.length
            let result_dislikes = await conn.query(`SELECT * FROM likes WHERE liked = '${id}' AND liketype = 'dislike'`)
            let userResult_dislikes = JSON.parse(JSON.stringify(result_dislikes));
            let profile_dislikes = userResult_dislikes.length
            let result_matches = await conn.query(`SELECT * FROM matches WHERE profile1 = '${id}' OR profile2 = '${id}'`)
            let userResult_matches = JSON.parse(JSON.stringify(result_matches));
            let profile_matches = userResult_matches.length
            const Stats = new Discord.MessageEmbed()
                .setTitle(`**${userResult[0].name}'s Profile Stats!**`)
                .setThumbnail(`https://minotar.net/helm/${userResult[0].IGN}/100.png`)
                .addField('**Profiles liked**', `${profile_liked}`, false)
                .addField('**Profiles disiked**', `${profile_disliked}`, false)
                .addField('**Amount of likes**', `${profile_likes}`, false)
                .addField('**Amount of dislikes**', `${profile_dislikes}`, false)
                .addField('**Amount of matches**', `${profile_matches}`, false);
            await message.channel.send(Stats);
        });
    },
};