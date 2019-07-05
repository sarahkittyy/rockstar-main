import * as Discord from 'discord.js';
import Commands, { Command, CallbackArgs, stringifyCommandArg } from './Commands';
import Settings from './Settings';
import { Report } from './ReportHandler';

export default class Messages
{
	/// The program settings
	private static settings: Settings;
	
	/**
	 * @brief Initialize the client settings.
	 */
	public static InitSettings(settings: Settings)
	{
		this.settings = settings;
	}
	
	/**
	 * @brief Generic help command
	 */
	public static Help(showAdmin: boolean = false): Discord.RichEmbed
	{
		let embed = new Discord.RichEmbed()
					.setTitle('Available Commands: ')
					.setColor(8453219)
					.setTimestamp(new Date());
					
		// Iterate over all commands.
		for(let command of Commands)
		{
			// If the permissions integer isn't 0, ignore.
			if(command.permission !== 0 && !showAdmin)
			{
				continue;
			}
			// Build the string of args if the command has any.
			let args: string | undefined = undefined;
			if(command.args)
			{	
				args = '';
				for(let arg of command.args)
				{
					args += ' ';
					args += stringifyCommandArg(arg);
				}	
			}
			embed.addField(this.settings.cmdprefix + command.name + (args || ''),
				 			(command.desc || 'Generic Command Description') + '\n--------------------');
		}
			
		embed.setFooter('See ' + this.settings.cmdprefix + 'help {command} for a specific command.');
		return embed;
	}
	
	/**
	 * @brief Help with a specific command.
	 * 
	 * @param command The command to get help with.
	 */
	public static HelpCommand(command: Command): Discord.RichEmbed
	{
		let embed = new Discord.RichEmbed()
					.setTitle(`${this.settings.cmdprefix}${command.name}${command.permission !== 0 ? ' [ADMIN ONLY]' : ''}`)
					.setColor(8453219)
					.setTimestamp(new Date())
					.setFooter('See ' + this.settings.cmdprefix + 'help for general help.');
				
		if(command.desc)
		{
			embed.setDescription(command.desc);
		}
					
		// Build the string of args if the command has any.
		let args: string | undefined = undefined;
		if(command.args)
		{	
			args = '';
			for(let arg of command.args)
			{
				args += ' ';
				args += stringifyCommandArg(arg);
			}	
		}
		
		embed.addField('Format', `${this.settings.cmdprefix}${command.name}${args}`);
		
		// Iterate over all args...
		if(command.args)
		{
			for(let arg of command.args)
			{
				let braces: string[] = (arg.required) ? ['<', '>'] : ['[', ']'];
				
				embed.addField(`${braces[0]}${arg.name}${braces[1]}`, 
					`${arg.desc}\n` +
					`Type: ${arg.type}\n` +
					(arg.default ? `Default Value: ${arg.default}\n` : '') +
					`Required: ${arg.required}`
				);
			}
		}
					
		return embed;
	}
	
	/**
	 * @brief Invalid command passed to /help
	 * 
	 * @param command The command attempted to be used.
	 */
	public static InvalidHelpCommand(command: string): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Command not found: ' + command + '.')
					.setFooter(`See ${this.settings.cmdprefix}help for help.`);
	}
	
	/**
	 * @brief Invalid command.
	 * 
	 * @param command The command attempted to be used.
	 */
	public static InvalidCommand(command: string): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Invalid command ' + command + '.')
					.setFooter(`See ${this.settings.cmdprefix}help for help.`);
	}
	
	/**
	 * @brief Invalid command arguments
	 * 
	 * @param command The incorrectly used command.
	 */
	public static InvalidCommandArgs(command: string): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Invalid command arguments for command ' + command + '.')
					.setDescription(`See ${this.settings.cmdprefix}help ${command} for more help.`);
	}
	
	/**
	 * @brief Invalid channel type.
	 */
	public static InvalidChannelType(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('This is not a valid channel? Please use this command in a guild.')
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Invalid role.
	 * 
	 * @param role The role that was attempted to be used.
	 */
	public static InvalidRole(role: string): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle(`Invalid role "${role}".`)
					.setTimestamp(new Date())
					.setDescription('Please check that the name of the role is correct.');
	}
	
	/**
	 * @brief Invalid emoji
	 * 
	 * @param name The name of the emoji.
	 */
	public static InvalidEmoji(name: string): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle(`Could not find/access emoji ${name}.`)
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief User has invalid permissions.
	 */
	public static NoPermissions(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('You do not have permission to run that command.')
					.setTimestamp(new Date())
					.setFooter(`See ${this.settings.cmdprefix}help for help.`);
	}
	
	/**
	 * @brief For RoleReact messages.
	 * 
	 * @param message The custom message to attach.
	 */
	public static RoleReactMessage(message: string): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle(`${message}`)
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Successful report.
	 */
	public static SuccessfulReport(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Thank you for your report!')
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Archived report.
	 * 
	 * @param user The user who sent the report.
	 */
	public static ArchivedReport(user: Discord.User): string
	{
		return `Sorry, <@${user.id}>, there are no staff online at the moment. Your report was sent to staff.`;
	}
	
	/**
	 * @brief User never submitted a report.
	 * 
	 * @param member The member with no reports.
	 */
	public static NoOutstandingReports(member: Discord.GuildMember): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle(`User ${member.user.username}#${member.user.discriminator} has no outstanding reports.`)
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Invalid report archive channel.
	 */
	public static InvalidReportChannel(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('The server has not configured a proper report / report handling channel.')
					.setDescription('Please contact this bot\'s manager.')
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Could not find a given user.
	 */
	public static UserNotFound(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Could not find user!')
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Notification for an archived report.
	 * 
	 * @param report The report data.
	 */
	public static ReportArchive(report: Report): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle(`Report from user ${report.sender.user.username}#${report.sender.user.discriminator}`)
					.setDescription(`User reported: ${report.member.user.username}#${report.member.user.discriminator}`)
					.addField('Note', report.message)
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Staff role couldn't be found.
	 */
	public static InvalidStaffRole(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Could not find suitable staff role. Please contact the bot\'s manager.')
					.setTimestamp(new Date());
	}
	
	/**
	 * @brief Staff role isn't mentionable.
	 */
	public static StaffNotMentionable(): Discord.RichEmbed
	{
		return new Discord.RichEmbed()
					.setTitle('Could not mention staff. This is an issue, contact the bot manager.')
					.setTimestamp(new Date());
	}
}