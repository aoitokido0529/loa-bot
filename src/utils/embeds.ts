import { EmbedBuilder, ColorResolvable } from 'discord.js';
export class EmbedUtils {
  static readonly Colors = { SUCCESS:0x57F287, ERROR:0xED4245, WARNING:0xFEE75C, INFO:0x5865F2, NEUTRAL:0x2F3136 };
  static createEmbed(opts:{title?:string,description?:string,color?:ColorResolvable,fields?:Array<{name:string,value:string,inline?:boolean}>,footer?:{text:string,iconURL?:string},timestamp?:boolean}) {
    const embed = new EmbedBuilder();
    if(opts.title) embed.setTitle(opts.title);
    if(opts.description) embed.setDescription(opts.description);
    if(opts.color) embed.setColor(opts.color);
    if(opts.fields) embed.addFields(opts.fields);
    if(opts.footer) embed.setFooter(opts.footer);
    if(opts.timestamp!==false) embed.setTimestamp();
    return embed;
  }
  static success(title:string, desc?:string) { return this.createEmbed({title:'✅ '+title, description:desc, color:this.Colors.SUCCESS}); }
  static error(title:string, desc?:string) { return this.createEmbed({title:'❌ '+title, description:desc, color:this.Colors.ERROR}); }
  static warning(title:string, desc?:string) { return this.createEmbed({title:'⚠️ '+title, description:desc, color:this.Colors.WARNING}); }
  static info(title:string, desc?:string) { return this.createEmbed({title:'ℹ️ '+title, description:desc, color:this.Colors.INFO}); }
}
export default EmbedUtils;