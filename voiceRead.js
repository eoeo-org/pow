const debug__GuildContext = require("debug")("voiceRead.js:GuildContext");
const debug__initialize   = require("debug")("voiceRead.js:initialize");

const axios = require("axios");
const fs = require("fs");

const mariadb = require("mariadb");
const pool = mariadb.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

const { Queue, awaitEvent, getProperty } = require("./utils");

let client;

class GuildContext {
  constructor(guild) {
    this.guild = client.guilds.resolve(guild);
    this.readQueue = new Queue(this._readMessage.bind(this));
    this.cleanChannels();
  }

  async _readMessage({ audioStream, message, convertedMessage }) {
    if (this.connection === null) return;
    const dispatcher = this.connection.play(audioStream);
    debug__GuildContext("read started");
    await awaitEvent(dispatcher, "speaking", state => state === 0);
    debug__GuildContext("read finished");
  }

  cleanChannels() {
    this.textChannel  = null;
    this.voiceChannel = null;
    this.connection   = null;
  }

  isJoined() {
    return this.textChannel  !== null
        && this.voiceChannel !== null
        && this.connection   !== null
        && this.connection.status !== 4;
  }

  async join(textChannel, voiceChannel) {
    if (this.isJoined()) return;
    this.textChannel = this.guild.channels.resolve(textChannel);
    this.voiceChannel = this.guild.channels.resolve(voiceChannel);
    this.connection = await this.voiceChannel.join();

    this.connection.once("disconnect", () => {
      this.leave();
    });
  }

  leave() {
    this.readQueue.purge();
    this.voiceChannel.leave();
    this.cleanChannels();
  }

  async _getUserSetting(id) {
    var conn, rows;
    try {
      conn = await pool.getConnection();
      rows = await conn.query("SELECT * FROM userSetting WHERE id = ?", [ id ])
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
      delete rows[0].id;
      return rows[0];
    }
  }

  async _randomUserSetting(id) {
    var conn, rows;
    const allowedVoiceList = ["show", "haruka", "hikari", "takeru", "santa", "bear"];
    try {
      conn = await pool.getConnection();
      await conn.query(`UPDATE userSetting SET
                          speaker='${allowedVoiceList[Math.floor(Math.random()*allowedVoiceList.length)]}',
                          pitch=${Math.floor(Math.random() * (200 + 1 - 50)) + 50},
                          speed=${Math.floor(Math.random() * (400 + 1 - 50)) + 50}
                        WHERE id = ?`, [ id ])
      rows = await conn.query("SELECT * FROM userSetting WHERE id = ?", [ id ])
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
      delete rows[0].id;
      return rows[0];
    }
  }

  async _setUserSetting(id, key, value) {
    var conn, rows;
    try {
      conn = await pool.getConnection();
      rows = await conn.query(`UPDATE userSetting SET ${key}=${value} WHERE id = ?`, [ id ])
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
      delete rows[0].id;
      return rows[0];
    }
  }

  async addMessage(message, convertedMessage) {
    if (!this.isJoined()) return false;

    const userSetting = await this._getUserSetting(message.author.id);
    try {
      debug__GuildContext("fetching audio");
      const audioStream = await this._fetchAudioStream({
        text: convertedMessage,
        ...userSetting
      });

      debug__GuildContext("got response, adding to queue");
      this.readQueue.add({ message, convertedMessage, audioStream });
    } catch(error) {
      debug__GuildContext(`Request error: ${error.response.status}: ${error.response.statusText}`);
      this.textChannel.send(`リクエストエラー：${error.response.status}: ${error.response.statusText}`);
    }
  }

  async _fetchAudioStream(params) {
    return await axios
      .post("https://api.voicetext.jp/v1/tts", new URLSearchParams({ ...params, format: "mp3" }), {
        auth: { username: process.env.VOICETEXT_API_KEY },
        responseType: 'stream'
      })
      .then(getProperty("data"));
  }
}

class GuildCtxManager extends Map {
  get(guild) {
    guild = client.guilds.resolve(guild);
    if (this.has(guild.id)) return super.get(guild.id);

    const guildContext = new GuildContext(guild);
    if (!guildContext.guild) return;
    this.set(guild.id, guildContext);
    return guildContext;
  }
}

exports.initialize = c => {
  debug__initialize("initializing GuildCtxManager");
  client = c;
  exports.guilds = new GuildCtxManager();
};
