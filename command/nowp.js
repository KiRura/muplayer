import { useQueue } from "discord-player";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import functions from "../functions.js";
import data from "../data.js";

export default {
  data: new SlashCommandBuilder()
    .setName("nowp")
    .setDescription("再生中の曲の詳細"),
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!functions.isGuild(interaction)) return;
    const queue = useQueue(interaction.guild.id);
    if (!functions.isCorrectQueue(queue, interaction)) return;

    const t = queue.currentTrack;
    let times = 0;
    for (const track of queue.history.tracks.toArray()) {
      console.log(track.durationMS);
      times += track.durationMS;
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t.title)
          .setDescription(
            `:bust_in_silhouette: ${t.author}\n:label: <@${t.requestedBy.id}>\n\n${t.durationMS === 0 ? ":satelite: LIVE" : queue.node.createProgressBar({ length: 7 })}`
          )
          .setColor(data.mutaoColor)
          .setURL(t.url)
          .setFooter({
            text: `音量: ${queue.node.volume}%・今までに${queue.history.getSize()}曲 (${functions.times(times / 1000)})再生しました`,
            iconURL: t.thumbnail
          })
      ]
    });
  }
};
