import * as Discord from 'discord.js';
import Commands, { Command, CallbackArgs, stringifyCommandArg } from './Commands';
import Settings from './Settings';

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
	public static Help(): Discord.RichEmbed
	{
		let embed = new Discord.RichEmbed()
					.setTitle('Available Commands: ')
					.setColor(8453219)
					.setTimestamp(new Date());
					
		// Iterate over all commands.
		for(let command of Commands)
		{
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
					.setTitle(`${this.settings.cmdprefix}${command.name}`)
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
}