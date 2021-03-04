class Command{
    /**
     *
     * @param {string} name
     * @param {string} description
     * @param {number} cooldown
     * @param {string[]} aliases
     */
    constructor(name, description, cooldown, aliases) {
        if (!cooldown) this.cooldown = 0;
        if (!typeof cooldown === "number") throw new Error("cooldown must be an number.")
        if (!description) this.description = null;
    }
    /**
     @abstract
     */
    execute(client, message, args){
        throw new Error("Abstract method not defined.")
    }
}

module.exports = Command;