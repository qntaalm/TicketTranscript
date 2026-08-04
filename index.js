const { Client, Intents, MessageEmbed, Collection, MessageActionRow, MessageAttachment, MessageButton, Modal, TextInputComponent, showModal, InteractionCollector, SelectMenuComponent, MessageSelectMenu, PermissionFlagsBits } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.MESSAGE_CONTENT] });
const db = require('pro.db')
//====================================


client.on('ready', () => {
  console.clear()
console.log(`${client.user.tag} is Online 🟢`);
    client.user.setStatus("idle")
    let status =
        [
        `${client.user.username} System`,
        `My Dev M7md6565`,
        `My Prefix ${prefix} | Mention Me`,
        ]
    setInterval(()=>{
        client.user.setActivity(status[Math.floor(Math.random()*status.length)]);
        },8000)
});

process.on("uncaughtException" , err => {
  return console.log(err)
});

process.on("unhandledRejection" , err => {
  return console.log(err)
});

process.on("rejectionHandled", err => {
  return console.log(err)
});


//====================================
//التعريفات

const line = "https://cdn.discordapp.com/attachments/1141839616954073119/1142543137919729855/standard_1.gif" //رابط الخط
const prefix = "!" //برفكس
const owners = ["996652813268557834", "590828897374044181"]; // اونرات البوت

//====================================
//Categories
const closedSup = '1265034427273318442'; //كاتجوري اغلاق سبورت
const SupportCate = '1265034318103973918'; //كاتجوري فتح سبورت
//====================================
//Rooms
const TicketsLog = '1274039840408731719'; //روم لوق التكتات
//====================================
const Support_Role = '1265042776240816250'; //رتبة سبورت

//====================================
//ارسال التكت (سيت اب)

client.on('messageCreate', async message => {
  if (message.content.toLowerCase() === prefix + 'setup') {
  if (!message.member.permissions.has('ADMINISTRATOR')) return
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('Support')
          .setLabel('Support Ticket')
          .setStyle('PRIMARY')
          .setEmoji('🛠')
      );

    const embed = new MessageEmbed()
      .setColor('DARK_PURPLE')
      .setTitle('Open Ticket')
      .setDescription('Click the button to create a ticket.\n\n> **To create a Support Ticket 🛠**')
    .setThumbnail(message.guild.iconURL({dynamic: true}))
.setFooter({text: `${message.guild.name}`, iconURL: message.guild.iconURL({dynamic: true})})
.setTimestamp()

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
if (interaction.customId === "closeSupport" && interaction.channel.name.startsWith("closed-")) {
    return interaction.reply({
        content: "❌ التذكرة مغلقة بالفعل",
        ephemeral: true
    });
}

  const { customId, guild, user } = interaction;
const logChannel = guild.channels.cache.get(TicketsLog);
  if (customId === 'Support') {

    let havesupp = db.get(`Support_ticket_${interaction.user.id}`);

const channell = havesupp ? guild.channels.cache.get(havesupp) : null;
if (channell) {
const permissions = channell.permissionsFor(interaction.user)
let havesup = permissions.has('VIEW_CHANNEL')
    if (havesup) {
      return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
    }} else if (!channell) {



    const ticketChannel = await guild.channels.create(`support-${user.username}`, {
      type: 'text',
      parent: SupportCate,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: user.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
        },
        {
          id: Support_Role,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
        }
      ]
    });
db.set(`Support_ticket_${interaction.user.id}`, ticketChannel.id);
db.set(`TicketOwner_${ticketChannel.id}`, interaction.user.id);

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('closeSupport')
          .setLabel('Close')
          .setStyle('DANGER')
          .setEmoji('🔒')
      );

    const embed = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('Ticket Created')
      .setDescription(`Support ticket has been Created ${ticketChannel} 🛠`);

    await interaction.reply({ embeds: [embed], ephemeral: true });

    ticketChannel.send({
      content: `> <@${user.id}>\n> <@&${Support_Role}>`,
      embeds: [new MessageEmbed()
  .setTitle(interaction.guild.name)
  .setColor('DARK_PURPLE')
  .setDescription('**__Please Wait a SupportTeam .__**')
  .setThumbnail(interaction.guild.iconURL({dynamic: true}))
  .setFooter({text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({dynamic: true})})
.setTimestamp()
],
      components: [row]
    });
  }

 } else if (customId === 'closeSupport') {

await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;
    const logChannel = guild.channels.cache.get(TicketsLog);

    // إخفاء التذكرة عن صاحبها
    await channel.permissionOverwrites.edit(Support_Role, {
        VIEW_CHANNEL: true,
    });

    await channel.permissionOverwrites.edit(interaction.user.id, {
        VIEW_CHANNEL: false,
    });

    // زر الحذف
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('deleteTicketS')
                .setLabel('Delete')
                .setStyle('DANGER')
                .setEmoji('🗑')
        );

    const moveEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Ticket Closed')
        .setDescription(`Done Closed Ticket by <@${interaction.user.id}>`)
        .setTimestamp();

    await channel.send({
        embeds: [moveEmbed],
        components: [row],
    });

    // نقل التذكرة
    await channel.setParent(closedSup);
    await channel.setName(`closed-${channel.name}`);

   const ticketOwner = db.get(`TicketOwner_${channel.id}`);

if (ticketOwner) {
    db.delete(`Support_ticket_${ticketOwner}`);
    db.delete(`TicketOwner_${channel.id}`);
}

    // إنشاء الترانسكربت
    const attachment = await discordTranscripts.createTranscript(channel, {
        limit: -1,
        returnType: "attachment"
    });
    attachment.setName(`${channel.name.replace("closed-", "")}.html`);

    const closedTicket = new MessageEmbed()
        .setColor("RED")
        .setDescription(`**<#${channel.id}>** closed by **<@${interaction.user.id}> 🔒**`)

    if (logChannel) {
        await logChannel.send({
            embeds: [closedTicket],
            files: [attachment],
        });

        await logChannel.send(line);
    }

    await interaction.editReply({
    content: "✅ تم إغلاق التذكرة وحفظ الترانسكربت"
});

    } else if (customId === 'deleteTicketS') {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;
    await interaction.editReply({content: 'This ticket will be deleted in 5 seconds...'});
    setTimeout(() => channel.delete(), 5000);
  }
});

client.login(process.env.token)
