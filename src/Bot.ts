import * as Discord from 'discord.js';
import Settings from './Settings';
import CommandHandle from './CommandHandle';
import Messages from './Messages';
import SCPWatch from './SCPWatch';
import SCPLog from './SCPLog';

/**
 * Main discord bot class
 */
export default class Bot
{
	/// The bot's settings.
	private settings: Settings;
	/// The bot's token.
	private token: string;
	/// The discord client.
	private client: Discord.Client;
	/// Command handler.
	private cmdh: CommandHandle;
	/// SCP watcher.
	private scpw: SCPWatch;
	/// SCP logger.
	private scpl: SCPLog;
	
	/**
	 * @brief Init the bot
	 * 
	 * @param token The bot's token
	 * @param settings The bot's settings
	 */
	public constructor(token: string, settings: Settings)
	{
		this.token = token;
		this.settings = settings;
		Messages.InitSettings(this.settings);
		this.cmdh = new CommandHandle(settings);
		
		// Init the client.
		this.client = new Discord.Client();
		// On every message
		this.client.on('message', (message: Discord.Message) => {
			if (message.author.id === this.client.user.id)
			{
				return;
			}

			// Pass the message to the command handler.
			this.cmdh.handleMessage(message);
		});
		// On disconnect.
		this.client.on('disconnect', (event: any) => {
			console.log('Bot disconnected, trying to reconnect...');
			// Try to log in again
			this.client.login(this.token)
			.then((value: string) => {
				console.log('Reconnected Successfully.');
			})
			.catch(console.error);
		});
		// Log the bot in.
		this.client.login(this.token)
		.then((value: string) => {
			console.log('Logged in successfully...');
		})
		.catch(console.error);
		
		// Init the SCP Logger.
		this.client.on('ready', () => {
			let guild: Discord.Guild | undefined =
			this.client.guilds.find((g: Discord.Guild) => g.id === this.settings.guildid);
			if(!guild)
			{
				throw new Error('Could not find guild with ID ' + this.settings.guildid);
			}
			let channel: Discord.GuildChannel | undefined =
				guild.channels.find((c: Discord.GuildChannel) => (c.name == this.settings.logchannel) && (c.type === 'text'));
			if(!channel)
			{
				throw new Error('Could not find channel with name ' + this.settings.logchannel + '!');
			}
			this.scpl = new SCPLog(this.settings, <Discord.TextChannel>channel);
			
			// Init the SCP file log watcher.
			this.scpw = new SCPWatch(this.settings, this.settings.ports[0]);
			this.scpw.onChange((type: string, filename: string) => { this.scpl.onLogFileChange(filename); });
		});
	}
};
