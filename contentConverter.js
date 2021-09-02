module.exports = (message) => {
    if (!message) throw new Error("There is no first argument.");

    const contentParser = (a, b, c) => {
        if (a.match(/https?|s?ftp/g)) return "";
        if (a.match(/(<a?)?:\w+:(\d{18}>)?/g)) return "";
        if (a.match(/[!$%^&*()_|~`{}\[\]:";'<>?,.\/]/g)) return "";

        const gm = message.guild.members;
        const gr = message.guild.roles;
        const gc = message.guild.channels;

        switch(b) {
            case "@":
                return gm.resolve(c) ? gm.resolve(c).displayName : "";
            case "@!":
                return gm.resolve(c) ? gm.resolve(c).displayName : "";
            case "@&":  
                return gr.resolve(c) ? gr.resolve(c).name : "";
            case "#":
                return gc.resolve(c) ? gc.resolve(c).name : "";
        }
    };

    let res = message.content.replace(/<(@[!&]?|#)!?([\d]+)>|((https?|s?ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, contentParser);
    if (res.match(/(<a?)?:\w+:(\d{18}>)?/)) return "";
    return res;
};

/*
  require: Discord.js message(v12) or messageCreate(v13) event argument

  example:
    const contentParser = require("./contentParser.js");
    contentParser(message);

  url: https://google.com
  user: @ced#0180
  channel: #1
  role: @ぽット 
*/