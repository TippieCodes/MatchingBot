const fs = require("fs");
module.exports = (client, message) => {
    console.log(`Logged in as ${client.user.tag}`);
    if (!fs.existsSync(process.cwd()+'/data/')){
        console.log("Data folder did not exist... Making it now!")
        fs.mkdir(process.cwd()+'\\data', error => {
            if (error) {
                console.error(error);
            } else {
                console.log("Data folder created at '" + process.cwd() + "\\data\\'")
            }
        })
    }
    const guilds = client.guilds.cache.array();
    guilds.forEach(guild => {
        if (guild.id === undefined) return;
        if(!fs.existsSync(process.cwd()+'/data/'+guild.id+'.json')) {
            console.log('Config for guild with ID:' + guild.id + " did not exist... Making it now!")
            fs.writeFile(process.cwd()+'/data/'+guild.id+'.json', "{}", error => {
                if (error) {
                    console.error(error);
                } else {
                    console.log("Data file created at '" + process.cwd() + "\\data\\"+guild.id+".json'" )
                }
            })
        }
    })
};