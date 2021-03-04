const {clean, postProfile, fetchMessageByIds, loginProfile, checkMatches, newMatch} = require("../utils");
const {conn} = require("../database")
module.exports = {
    name: 'eval',
    description: 'Debug Command',
    execute(client, message, args) {
        if(message.author.id !== client.config.ownerID) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), {code: "xl"}).then();
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    },
};