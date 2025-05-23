const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { formatMessage, buttonStyle } = require('./utils');
const events = require('events');
const cu = "GroBot";


module.exports = class Approve extends events {
  constructor(options = {}) {

    if (!options.embed) options.embed = {};
    if (!options.embed.requestTitle) options.embed.requestTitle = options.embed.title;
    if (!options.embed.requestColor) options.embed.requestColor = options.embed.color;
    if (!options.embed.rejectTitle) options.embed.rejectTitle = options.embed.title;
    if (!options.embed.rejectColor) options.embed.rejectColor = options.embed.color;

    if (!options.buttons) options.buttons = {};
    if (!options.buttons.accept) options.buttons.accept = 'Accept';
    if (!options.buttons.reject) options.buttons.reject = 'Reject';

    if (!options.reqTimeoutTime) options.reqTimeoutTime = 30000;
    if (!options.requestMessage) options.requestMessage = '{opponent}, {player} Has Invited You For Game.';
    if (!options.rejectMessage) options.rejectMessage = 'The Player Rejected To Play With You.';
    if (!options.reqTimeoutMessage) options.reqTimeoutMessage = `Game Canceled As Player Didn't Respond.`;

    super();
    this.options = options;
    this.message = options.message;
    this.opponent = options.opponent;
  }

  
  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }


  async approve() {
    return new Promise(async resolve => {

      const embed = new EmbedBuilder()
      .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
.setFooter({ text: `${cu} - ${process.env.year} ©`, iconURL: process.env.iconurl })
      .setColor(this.options.embed.requestColor)
      .setTitle(this.options.embed.requestTitle)
      .setDescription(formatMessage(this.options, 'requestMessage'));

      const btn1 = new ButtonBuilder().setLabel(this.options.buttons.accept).setCustomId('approve_accept').setStyle(buttonStyle('SUCCESS'));
      const btn2 = new ButtonBuilder().setLabel(this.options.buttons.reject).setCustomId('approve_reject').setStyle(buttonStyle('DANGER'));
      const row = new ActionRowBuilder().addComponents(btn1, btn2);

      const msg = await this.sendMessage({ content: `${this.opponent}`,embeds: [embed], components: [row] });
      const collector = msg.createMessageComponentCollector({ time: this.options.reqTimeoutTime });


      collector.on('collect', async btn => {
        await btn.deferUpdate().catch(e => {});
        if (btn.user.id === this.opponent.id) collector.stop(btn.customId.split('_')[1]);
      })

      collector.on('end', async (_, reason) => {
        if (reason === 'accept') return resolve(msg);

        const embed = new EmbedBuilder()
        .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
.setFooter({ text: `${cu} - ${process.env.year} ©`, iconURL: process.env.iconurl })
        .setColor(this.options.embed.rejectColor)
        .setTitle(this.options.embed.rejectTitle)
        .setDescription(formatMessage(this.options, 'rejectMessage'))

        if (reason === 'time') embed.setDescription(formatMessage(this.options, 'reqTimeoutMessage'));
        this.emit('gameOver', { result: reason, player: this.message.author, opponent: this.opponent });
        await msg.edit({ content: null, embeds: [embed], components: [] });
        return resolve(false);
      })
    })
  }
}

