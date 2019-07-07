import * as Discord from 'discord.js';
import Settings, { LogChannel } from './Settings';
import CommandHandle from './CommandHandle';
import Messages from './Messages';
import SCPWatch from './SCPWatch';
import SCPLog from './SCPLog';
import RoleReact from './RoleReact';
import ReportHandler from './ReportHandler';

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
	private scpw: SCPWatch[];
	/// SCP loggers.
	private scpl: SCPLog[];
	
	/**
	 * @brief Init the bot
	 * 
	 * @param token The bot's token
	 * @param settings The bot's settings
	 */
	public constructor(token: string, settings: Settings)
	{
		RoleReact.init();
		ReportHandler.init(settings);
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
			this.cmdh.handleMessage(this.client, message);
		});
		
		// Pass message reaction updates to RoleReact.
		this.client.on('messageReactionAdd', (reaction: Discord.MessageReaction, user: Discord.User) => {
			// Ignore if it's the client's reaction.
			if (user.id === this.client.user.id)
			{
				return;
			}
			
			RoleReact.onMessageReactionAdd(reaction, user);
		});
		this.client.on('messageReactionRemove', (reaction: Discord.MessageReaction, user: Discord.User) => {
			// Ignore if it's the client's reaction.
			if (user.id === this.client.user.id)
			{
				return;
			}
			
			RoleReact.onMessageReactionRemove(reaction, user);
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
		
		// Init the SCP Loggers.
		this.client.on('ready', () => {
			let guild: Discord.Guild | undefined =
			this.client.guilds.find((g: Discord.Guild) => g.id === this.settings.guildid);
			if(!guild)
			{
				throw new Error('Could not find guild with ID ' + this.settings.guildid);
			}
			// Create the loggers.
			this.createLoggers(guild);
		});
	}
	
	/**
	 * @brief Initializes the loggers with the given config settings.
	 * 
	 * @param guild The bot's main guild.
	 */
	private createLoggers(guild: Discord.Guild)
	{
		this.scpw = new Array<SCPWatch>();
		this.scpl = new Array<SCPLog>();
		
		// Get the admin channel.
		let adminguildchannel: Discord.GuildChannel | undefined =
			guild.channels.find((c: Discord.GuildChannel) => c.name === this.settings.adminlogchannel);
		if(!adminguildchannel || adminguildchannel.type !== 'text')
		{
			throw new Error('Invalid admin log channel name! Fatal error, exiting.');
		}
		let adminchannel = <Discord.TextChannel>adminguildchannel;
		// Iterate over all log objcts.
		for(let log of this.settings.logs)
		{
			// Create the file watcher.
			let w = this.scpw[this.scpw.push(new SCPWatch(this.settings, log.port)) - 1];
			// Get the log channel.
			let guildchannel: Discord.GuildChannel | undefined =
				guild.channels.find(c => c.name === log.channel);
			if(!guildchannel || guildchannel.type !== 'text')
			{
				throw new Error('Invalid log channel for server port ' + log.port.toString());
			}
			let channel = <Discord.TextChannel>guildchannel;
			// Create the logger.
			let l = this.scpl[this.scpl.push(new SCPLog(this.settings, channel, adminchannel)) - 1];
			// Link the two.
			this.scpw[this.scpw.length - 1].onChange((type, filename) => {
				l.onLogFileChange(filename);
			});
		}
	}
};
