use crate::{Context, Error};
use poise::serenity_prelude::{self as serenity, Mentionable};
use songbird::{Event, EventContext, EventHandler as VoiceEventHandler,TrackEvent};

#[derive(Debug, poise::ChoiceParameter)]
pub enum SpeakerChoice {
	Show,
	Haruka,
	Hikari,
	Takeru,
	Santa,
	Bear,
}

/// Show this help menu
#[poise::command(
	prefix_command,
	track_edits,
	aliases("へるぷ", "ヘルプ", "使い方", "使いかた", "つかいかた"),
	slash_command
)]
pub async fn help(
	ctx: Context<'_>,
	#[description = "Specific command to show help about"]
	#[autocomplete = "poise::builtins::autocomplete_command"]
	command: Option<String>,
) -> Result<(), Error> {
	poise::builtins::help(
        ctx,
        command.as_deref(),
        poise::builtins::HelpConfiguration {
            extra_text_at_bottom: "This is an example bot made to showcase features of my custom Discord bot framework",
            ..Default::default()
        },
    )
    .await?;
	Ok(())
}

/// ボイスチャンネルに参加します。
#[poise::command(slash_command, guild_only)]
pub async fn join(ctx: Context<'_>) -> Result<(), Error> {
	let (guild_id, channel_id) = {
		let guild = ctx.guild().unwrap();
		let channel_id = guild
			.voice_states
			.get(&ctx.author().id)
			.and_then(|voice_state| voice_state.channel_id);

		(guild.id, channel_id)
	};
    let connect_to = match channel_id {
        Some(channel) => channel,
        None => {
            ctx.say("Not in a voice channel").await?;

            return Ok(());
        },
    };

    let manager = songbird::get(ctx.serenity_context())
        .await
        .expect("Songbird Voice client placed in at initialisation.")
        .clone();

    if let Ok(handler_lock) = manager.join(guild_id, connect_to).await {
        // Attach an event handler to see notifications of all track errors.
        let mut handler = handler_lock.lock().await;
        handler.add_global_event(TrackEvent::Error.into(), TrackErrorNotifier);
    }

    Ok(())
}

struct TrackErrorNotifier;

#[serenity::async_trait]
impl VoiceEventHandler for TrackErrorNotifier {
    async fn act(&self, ctx: &EventContext<'_>) -> Option<Event> {
        if let EventContext::Track(track_list) = ctx {
            for (state, handle) in *track_list {
                println!(
                    "Track {:?} encountered an error: {:?}",
                    handle.uuid(),
                    state.playing
                );
            }
        }

        None
    }
}

/// ボイスチャンネルから退出します。
#[poise::command(slash_command, guild_only)]
pub async fn leave(
	ctx: Context<'_>,
	#[description = "Choice to retrieve votes for"] choice: Option<String>,
) -> Result<(), Error> {
    let guild_id = ctx.guild_id().unwrap();

    let manager = songbird::get(ctx.serenity_context())
        .await
        .expect("Songbird Voice client placed in at initialisation.")
        .clone();
    let has_handler = manager.get(guild_id).is_some();

    if has_handler {
        if let Err(e) = manager.remove(guild_id).await {
            ctx.say(format!("Failed: {:?}", e))
                    .await?;
        }

        ctx.say("Left voice channel").await?;
    } else {
        ctx.say("Not in a voice channel").await?;
    }

    Ok(())
}

/// 読み上げのキューリストを空にして、読み上げを中断します。
#[poise::command(slash_command, guild_only)]
pub async fn purge(ctx: Context<'_>) -> Result<(), Error> {
	Ok(())
}

/// 引数に渡されたメッセージを読み上げます。
#[poise::command(slash_command, guild_only)]
pub async fn read(
	ctx: Context<'_>,
	#[description = "声の話者を変更できます。"] speaker: Option<SpeakerChoice>,
	#[description = "声の高さを変更できます。(指定できる範囲: 50〜200)"]
	#[min = 50]
	#[max = 200]
	pitch: Option<u32>,
	#[description = "声の速度を変更できます。(指定できる範囲: 50〜400)"]
	#[min = 50]
	#[max = 400]
	speed: Option<u32>,
) -> Result<(), Error> {
	Ok(())
}

/// メッセージを一時的に読み上げないようにします。
#[poise::command(slash_command, guild_only)]
pub async fn ttsmute(
	ctx: Context<'_>,
	#[description = "Choice to retrieve votes for"] choice: Option<String>,
) -> Result<(), Error> {
	Ok(())
}

/// 今読み上げている内容をスキップします。
#[poise::command(slash_command, guild_only)]
pub async fn skip(
	ctx: Context<'_>,
	#[description = "Choice to retrieve votes for"] choice: Option<String>,
) -> Result<(), Error> {
	Ok(())
}

/// ユーザーごとの設定を調整できます。
#[poise::command(slash_command, rename = "user-settings", subcommands("view", "voice"))]
pub async fn user_settings(
	ctx: Context<'_>,
	#[description = "Choice to retrieve votes for"] choice: Option<String>,
) -> Result<(), Error> {
	Ok(())
}

/// 現在の声の設定を確認します。
#[poise::command(slash_command)]
pub async fn view(
	ctx: Context<'_>,
	#[description = "ユーザーの声の設定を確認できます。"] user: Option<serenity::Member>,
) -> Result<(), Error> {
	ctx.say("You invoked the first child command!").await?;
	Ok(())
}

/// 声の設定を変更します。
#[poise::command(slash_command)]
pub async fn voice(
	ctx: Context<'_>,
	#[description = "声の設定をランダムにします。"] random: Option<bool>,
	#[description = "声の話者を変更できます。"] speaker: Option<SpeakerChoice>,
	#[description = "声の高さを変更できます。(指定できる範囲: 50〜200)"]
	#[min = 50]
	#[max = 200]
	pitch: Option<u32>,
	#[description = "声の速度を変更できます。(指定できる範囲: 50〜400)"]
	#[min = 50]
	#[max = 400]
	speed: Option<u32>,
) -> Result<(), Error> {
	ctx.say("You invoked the second child command!").await?;
	Ok(())
}

/// このサーバーでの参加状態を初期化します。(⚠VCからBOTが退出します。)
#[poise::command(slash_command, guild_only)]
pub async fn reset(
	ctx: Context<'_>,
	#[description = "Choice to retrieve votes for"] choice: Option<String>,
) -> Result<(), Error> {
	Ok(())
}

fn check_msg(result: serenity::Result<serenity::Message>) {
	if let Err(why) = result {
		println!("Error sending message: {:?}", why);
	}
}
