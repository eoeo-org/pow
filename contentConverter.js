const RFC_URL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;
const { parse } = require("twemoji-parser");
const emoji = require("node-emoji");

module.exports = (message) => {
  if (!message) throw new Error("There is no first argument.");

  function parseContent (a, b, c) {
    const gm = message.guild.members;
    const gr = message.guild.roles;
    const gc = message.guild.channels;

    console.log(a, b, c)

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

  let result = message.content
    .replace(/<(@[!&]?|#)!?([\d]+)>/g, parseContent)
    .replaceAll(RFC_URL, "");
  
  const entities = parse(result);
  entities.map(e => {
    result = result.replaceAll(e.text, emoji.which(e.text))
  })
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