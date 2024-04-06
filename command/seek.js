import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import functions from "../functions.js";
import { useQueue } from "discord-player";
import data from "../data.js";

export default {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription(
      "h: 時間・m: 分・s: 秒で指定します。空の場合はデフォルトで0になります。"
    )
    .addIntegerOption(option =>
      option.setName("h").setDescription("時間").setMinValue(0)
    )
    .addIntegerOption(option =>
      option.setName("m").setDescription("分").setMinValue(0)
    )
    .addIntegerOption(option =>
      option.setName("s").setDescription("秒").setMinValue(0)
    ),
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!functions.isGuild(interaction)) return;
    const queue = useQueue(interaction.guild.id);
    if (!functions.isCorrectQueue(queue, interaction)) return;

    const h = interaction.options.getInteger("h") || 0;
    const m = interaction.options.getInteger("m") || 0;
    const s = interaction.options.getInteger("s") || 0;
    const msec = (h * 60 * 60 + m * 60 + s) * 1000;
    const formatted = functions.times(msec / 1000);

    if (queue.currentTrack.durationMS < msec) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("あたおかナンバー")
            .setDescription(
              "`" +
                queue.currentTrack.duration +
                "`より短い時間に指定する必要があります。\n指定された時間: `" +
                formatted +
                "`"
            )
            .setColor(data.redColor)
        ],
        ephemeral: true
      });
    }

    await interaction.deferReply();
    (await queue.node.seek(msec))
      ? interaction.followUp(`${formatted} に移動しました。`)
      : interaction.followUp("何故かできませんでした。");
  }
};
