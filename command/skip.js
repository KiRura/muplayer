/* eslint-disable no-unused-vars */
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import functions from "../functions.js";
import data from "../data.js";
import { useQueue } from "discord-player";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("スキップ")
    .addIntegerOption(option =>
      option
        .setName("to")
        .setDescription("/queueで表示された番号の曲へスキップ")
        .setMinValue(2)
    )
    .addBooleanOption(option =>
      option
        .setName("hold")
        .setDescription(
          "再生が終了するまで待つ このオプションを使用する場合、toとの併用が必須です"
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!functions.isGuild(interaction)) return;
    const queue = useQueue(interaction.guild.id);
    if (!functions.isCorrectQueue(queue, interaction)) return;
    const to = interaction.options.getInteger("to");
    const hold = interaction.options.getBoolean("hold");
    if (functions.isAtaokaNumber(to > queue.getSize(), interaction)) return;

    let t;
    const isHolded = hold && to;
    if (queue.getSize() === 0) {
      return (await import("../command/leave.js")).default.execute(interaction);
    } else {
      if (isHolded) {
        t = queue.tracks.toArray()[to - 1];
        const beforeSize = queue.getSize();
        do {
          queue.node.remove(queue.tracks.toArray()[0]);
        } while (queue.getSize() !== beforeSize - (to - 1));
      } else if (to) {
        t = queue.tracks.toArray()[to - 1];
        queue.node.skipTo(t);
      } else {
        t = queue.tracks.toArray()[0];
        queue.node.skip();
      }
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            queue.getSize() !== 0
              ? `:file_cabinet: ${queue.estimatedDuration === 0 ? ":satellite: LIVE ONLY" : queue.durationFormatted} / ${queue.getSize()}曲`
              : null
          )
          .setDescription(
            `${isHolded ? ":label:" : ":track_next:"} ${t.title.length < 15 ? ` [${t.title}]` : `\n[${t.title}]`}(${t.url})\n:label: <@${t.requestedBy.id}>\n:timer: ${t.durationMS === 0 ? ":satellite: LIVE" : t.duration}`
          )
          .setColor(data.mutaoColor)
          .setAuthor({
            name: to
              ? `\n${to}曲目にスキップ${isHolded ? "予定です" : "しました"}`
              : null,
            iconURL: t.thumbnail
          })
      ]
    });
  }
};
