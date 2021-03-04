const Discord = require("discord.js");
const {conn} = require("../database");
const {cooldowns} = require("../index");
module.exports = (client, message) => {
    if (message.author.bot) return;
    conn.query(`SELECT * FROM proxies WHERE channelid = '${message.channel.id}' AND discordid = '${message.author.id}' LIMIT 1`)
        .then(result => {
            let userResult = JSON.parse(JSON.stringify(result));
            if(!userResult.length) return;
            message.delete()
            let webhookid = userResult[0].webhookID;
            let webhooktoken = userResult[0].webhookToken;
            let proxy_profileid = userResult[0].profileid
            let proxy_name = undefined
            let proxy_image = undefined
            conn.query(`SELECT * FROM profiles WHERE profile_id = '${proxy_profileid}' LIMIT 1`)
                .then(result => {
                    let userResult = JSON.parse(JSON.stringify(result));
                    if(!userResult.length) {
                        proxy_image = `https://getdrawings.com/free-icon/web-icon-download-66.png`
                        proxy_name = 'deleted user ' + proxy_profileid
                    } else {
                        proxy_image = `https://minotar.net/helm/${userResult[0].IGN}/100.png`
                        proxy_name = userResult[0].name
                    }
                    const webhookClient = new Discord.WebhookClient(webhookid, webhooktoken)
                    webhookClient.send(message.content, {
                        username: proxy_name,
                        avatarURL: proxy_image
                    }).then()
                })
        })
    if (message.content.toLocaleLowerCase().indexOf(client.config.prefix) !== 0) return;

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!\n```' + error + '```');
    }
};