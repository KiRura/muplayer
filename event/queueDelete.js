/* eslint-disable no-unused-vars */
import { PermissionFlagsBits } from "discord.js";
import { GuildQueue } from "discord-player";
import fs from "fs";
import functions from "../functions.js";

export default {
  name: "queueDelete",
  /**
   * @param {GuildQueue} queue
   */
  execute(queue) {
    if (
      !queue.guild.members.me.permissions.has(
        PermissionFlagsBits.ChangeNickname
      )
    )
      return;
    let json = JSON.parse(fs.readFileSync("./data/nickname.json"));
    const guild = json.find(guild => guild.id === queue.guild.id);
    if (!guild) return queue.guild.members.me.setNickname(null);
    queue.guild.members.me.setNickname(guild.nickname);
    json = json.filter(guild => guild.id !== queue.guild.id);
    functions.writeFile("./data/nickname.json", json);
  }
};
