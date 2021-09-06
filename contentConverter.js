const RFC_URL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;

module.exports = (message) => {
  if (!message) throw new Error("There is no first argument.");

  function parseContent (a, b, c) {
    if (a.match(/(<a?)?:\w+:(\d{18}>)?/g)) return "";
    if (a.match(/[!$%^&*()_|~`{}\[\]:";'<>?,.\/]/gu)) return "";

    const gm = message.guild.members;
    const gr = message.guild.roles;
    const gc = message.guild.channels;

    switch (b) {
      case "@":
      case "@!":
        return gm.resolve(c) ? gm.resolve(c).displayName : "";
      case "@&":
        return gr.resolve(c) ? gr.resolve(c).name : "";
      case "#":
        return gc.resolve(c) ? gc.resolve(c).name : "";
    }
  };

  const result = message.content
    .replace(/<(@[!&]?|#)!?([\d]+)>/g, parseContent)
    .replace(RFC_URL, "");
  return result.match(/(<a?)?:\w+:(\d{18}>)?/) ? "" : result;
};

// .replace(/<(@[!&]?|#)!?([\d]+)>/g, contentParser);
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