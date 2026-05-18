import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, Message } from 'discord.js';
interface Page { embeds: EmbedBuilder[]; components?: ActionRowBuilder<any>[]; }
export class Pagination {
  private pages: Page[];
  private currentPage = 0;
  private timeout: number;
  constructor(pages: Page[], timeout=300000) { this.pages = pages; this.timeout = timeout; }
  async start(interaction:any) {
    if(!this.pages.length) return;
    if(this.pages.length===1) { await interaction.reply({embeds:this.pages[0].embeds, components:this.pages[0].components||[]}); return; }
    const getRow = () => new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('pagination_prev').setEmoji('◀️').setStyle(ButtonStyle.Primary).setDisabled(this.currentPage===0),
      new ButtonBuilder().setCustomId('pagination_page').setLabel('Page '+(this.currentPage+1)+'/'+this.pages.length).setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId('pagination_next').setEmoji('▶️').setStyle(ButtonStyle.Primary).setDisabled(this.currentPage===this.pages.length-1)
    );
    const msg = await interaction.reply({embeds:this.pages[this.currentPage].embeds, components:[...(this.pages[this.currentPage].components||[]), getRow()], fetchReply:true}) as Message;
    const collector = msg.createMessageComponentCollector({componentType:ComponentType.Button, time:this.timeout});
    collector.on('collect', async (i:any) => {
      if(i.user.id!==interaction.user.id) return i.reply({content:'❌ Not your menu.', ephemeral:true});
      const act = i.customId.split('_')[1];
      if(act==='prev') this.currentPage--;
      else if(act==='next') this.currentPage++;
      await i.update({embeds:this.pages[this.currentPage].embeds, components:[...(this.pages[this.currentPage].components||[]), getRow()]});
    });
    collector.on('end', async () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('p1').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('p2').setLabel('Expired').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('p3').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(true)
      );
      await msg.edit({components:[...(this.pages[this.currentPage].components||[]), disabled]}).catch(()=>{});
    });
  }
}
export default Pagination;