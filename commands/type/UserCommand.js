const Command = require("./Command");
const storage = require ("node-sessionstorage")

class UserCommand extends Command {
    /**
     *
     * @param {string} name
     * @param {string} description
     * @param {number} cooldown
     * @param {string[]} aliases
     */
    constructor(name, description, cooldown, aliases) {
        super(name, description, cooldown, aliases);
    }


    /**
     * @define
     */
    execute(client, message, args) {
        const id = storage.getItem(message.author.id)
        if (id == null) {
            message.channel.send(`You are not logged in! Use \`profile!login\` to login`)
            return;
        }
        this.id = id;
        this.executeUser(client, message, args, id);
    }
    /**
     * @abstract
     */
    executeUser(client, message, args, id){
        throw new Error("Abstract method not defined.")
    }

}

module.exports = UserCommand;