/* eslint-disable no-unused-vars */
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits
} from "discord.js";
import functions from "../functions.js";
import data from "../data.js";
import { QueryType, useMainPlayer, useQueue } from "discord-player";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("音楽を再生・キューに追加")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("URLか検索ワード")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("volume")
        .setDescription("音量 管理者無は1~50%、有は100%まで | デフォルトは30%")
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addChannelOption(option =>
      option
        .setName("vc")
        .setDescription("再生先のVC")
        .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!functions.isGuild(interaction)) return;

    // 再生先のVCを取得
    const vc =
      interaction.options.getChannel("vc") ||
      interaction.member.voice.channel ||
      interaction.guild.members.me.voice.channel;
    if (!vc) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("再生先のVCがありません。")
            .setDescription(
              "- 再生先のVCが指定されている\n- 実行者がVCに接続済み\n- BOTが既にVCに接続済み\n上記3つのいずれかを満たす必要があります。"
            )
            .setColor(data.redColor)
        ],
        ephemeral: true
      });
    } else if (!vc.viewable) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("再生先のVCが見えません。")
            .setDescription(`<#${vc.id}> が見えません。権限を確認して下さい。`)
            .setColor(data.redColor)
        ],
        ephemeral: true
      });
    } else if (!vc.joinable) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("再生先のVCに接続できません。")
            .setDescription(
              `<#${vc.id}> に接続できません。権限を確認して下さい。`
            )
            .setColor(data.redColor)
        ],
        ephemeral: true
      });
    }

    const query = interaction.options.getString("query", true);
    let volume = interaction.options.getInteger("volume") || 30;
    if (
      volume > 50 &&
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    )
      volume = 50; // 鼓膜破壊を防ぐため

    const player = useMainPlayer();
    // URL, 検索ワードをもとに検索
    const track = await player.search(query, {
      searchEngine: QueryType.AUTO,
      requestedBy: interaction.member
    });
    if (!track.hasTracks()) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("検索結果がありませんでした。")
            .setDescription(
              "URLの余計な部分や検索ワードを変えて再度お試し下さい。"
            )
            .setColor(data.redColor)
        ]
      });
    }

    const currentQueue = useQueue(interaction.guild.id); // ニックネームの一時保存、及びdiscord-playerのhistoryあたりのバグ(後述)を回避するため再生前にキューの状態を確認する
    if (!currentQueue) {
      const currentNickname = interaction.guild.members.me.nickname;
      if (currentNickname !== null) {
        const json = JSON.parse(fs.readFileSync("./data/nickname.json"));
        if (!json.find(guild => guild.id === interaction.guild.id)) {
          json.push({
            id: interaction.guild.id,
            nickname: currentNickname
          });
        }
        functions.writeFile("./data/nickname.json", json);
      }
    }

    const isUrl = query.startsWith("http://") || query.startsWith("https://");
    const queueNumber = currentQueue
      ? `${currentQueue.getSize() + 1}番目に追加｜キュー内合計: ${isUrl ? (currentQueue ? currentQueue.getSize() : 0) + track.tracks.length : (currentQueue ? currentQueue.getSize() : 0) + 1}曲`
      : "再生開始";

    let queue;
    try {
      queue = await player.play(vc, track, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild.members.me,
            requestedBy: interaction.user
          },
          volume
        }
      });
    } catch (error) {
      const queue = useQueue(interaction.guild.id);
      if (queue) queue.delete();
      interaction.reply("処理中にエラーが発生しました。");
      throw new Error(error);
    }

    let t;
    let description;
    let thumbnail;

    if (track.hasPlaylist() && track.playlist.tracks.length !== 1) {
      t = track.playlist;
      thumbnail = t.tracks[0].thumbnail;
      description = `:timer: ${t.estimatedDuration === 0 ? ":satellite: LIVE ONLY" : t.durationFormatted}\n:minidisc: ${t.tracks.length}曲`;
    } else {
      t = track.hasPlaylist() ? track.playlist.tracks[0] : track.tracks[0];
      thumbnail = t.thumbnail;
      description = `:bust_in_silhouette: ${t.author}\n:timer: ${t.durationMS === 0 ? ":satellite: LIVE" : t.duration}`;
    }
    if (!(query.startsWith("http://") || query.startsWith("https://")))
      description = `${description}\n:mag_right: ${query.substring(0, 15)}${query.length > 15 ? "..." : ""}`;

    if (!currentQueue) queue.queue.history.push(queue.queue.currentTrack); // 1曲目が履歴に保存されないバグの回避
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t.title)
          .setDescription(description)
          .setFooter({ text: queueNumber, iconURL: thumbnail })
          .setURL(t.url)
          .setColor(data.mutaoColor)
      ]
    });
  }
};
