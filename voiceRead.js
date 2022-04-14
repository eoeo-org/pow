const debug__GuildContext = require("debug")("voiceRead.js:GuildContext");
const debug__initialize   = require("debug")("voiceRead.js:initialize");
const debug__ErrorHandler = require("debug")("voiceRead.js:ErrorHandler");

const axios = require("axios");
const { joinVoiceChannel, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");

const mariadb = require("mariadb");
const pool = mariadb.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

const { Queue, getProperty } = require("./utils");

let client;

class GuildContext {
  constructor(guild) {
    this.guild = client.guilds.resolve(guild);
    this.readQueue = new Queue(this._readMessage.bind(this));
    this.cleanChannels();
  }

  async _readMessage({ audioStream }) {
    if (this.connection === null) return;
    this.player = createAudioPlayer();
    const resource = createAudioResource(audioStream,
    {
      inputType: StreamType.Arbitrary
    });
    this.connection.subscribe(this.player);
    this.player.play(resource);
    await entersState(this.player, AudioPlayerStatus.Playing, 5e3);
    debug__GuildContext("read started");
    await entersState(this.player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
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
    this.connection = await joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator
    })
    this.connection.once("disconnect", () => {
      this.leave();
    });
  }

  leave() {
    this.readQueue.purge();
    this.connection.destroy();
    this.cleanChannels();
  }

  async _getUserSetting(id) {
    let conn, rows;
    try {
      conn = await pool.getConnection();
      rows = await conn.query("SELECT * FROM userSetting WHERE id = ?", [ id ]);
      if (!rows[0]) {
        await this._randomizeUserSetting(id);
        rows = await conn.query("SELECT * FROM userSetting WHERE id = ?", [ id ]);
      }
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
      delete rows[0].id;
      return rows[0];
    }
  }

  async _randomizeUserSetting(id) {
    let conn, rows;
    const voiceList = ["show", "haruka", "hikari", "takeru", "santa", "bear"];
    try {
      conn = await pool.getConnection();
      await conn.query(`INSERT IGNORE INTO userSetting VALUES (?, ?, ?, ?)`, [id, 0, 0, 0]);
      await conn.query(`UPDATE userSetting SET
                          speaker='${voiceList[Math.floor(Math.random()*voiceList.length)]}',
                          pitch=${Math.floor(Math.random() * (200 + 1 - 50)) + 50},
                          speed=${Math.floor(Math.random() * (400 + 1 - 50)) + 50}
                        WHERE id = ?`, [ id ]);
      rows = await conn.query("SELECT * FROM userSetting WHERE id = ?", [ id ]);
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
      if (rows[0]) delete rows[0].id;
      return rows[0];
    }
  }

  async _setUserSetting(id, key, value) {
    let conn, rows;
    try {
      conn = await pool.getConnection();
      rows = await conn.query(`UPDATE userSetting SET ${key}=${isNaN(value) ? value : Number(value)} WHERE id = ?`, [ id ]);
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }

  async addMessage(message, id) {
    if (!this.isJoined()) return false;

    const userSetting = await this._getUserSetting(id);
    try {
      debug__GuildContext("fetching audio");
      const audioStream = await this._fetchAudioStream({
        text: message,
        ...userSetting
      });

      debug__GuildContext("got response, adding to queue");
      this.readQueue.add({ audioStream });
    } catch(error) {
      debug__GuildContext(`Request error: ${error.response.status}: ${error.response.statusText}`);
      message.reply(
        {embeds: [{
          color: 0xFF0000,
          title: "APIリクエストエラー",
          description: `${error.response.status}: ${error.response.statusText}`
        }]}
      );
    }
  }

  async _fetchAudioStream(params) {
    return await axios
      .post("https://api.voicetext.jp/v1/tts", new URLSearchParams({ ...params, format: "mp3" }), {
        auth: { username: process.env.VOICETEXT_API_KEY },
        responseType: "stream"
      })
      .then(getProperty("data"))
      .catch(err => {
        debug__ErrorHandler(`Error while requesting audio: ${err.status} ${err.statusText}`)
        throw err;
      });
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
