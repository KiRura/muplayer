import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import functions from "../functions.js";
import { useQueue } from "discord-player";
import data from "../data.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("VCから退出せずにキュー内をまっさらにする"),
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!functions.isGuild(interaction)) return;
    const queue = useQueue(interaction.guild.id);
    if (!functions.isCorrectQueue(queue, interaction)) return;
    if (queue.getSize() === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("キュー内は既にまっさらです。")
            .setColor(data.redColor)
        ],
        ephemeral: true
      });
    }

    queue.clear();
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${queue.getSize()}曲をまっさらにしました！`)
          .setColor(data.greenColor)
      ]
    });
  }
};
