import * as Discord from 'discord.js';
import Settings from './Settings';
import Commands, { Command, CallbackArgs } from './Commands';
import Messages from './Messages';

export default class CommandHandle
{
	/// The bot settings
	private settings: Settings;
	
	/**
	 * @brief Init the command handler.
	 * 
	 * @param settings The bot settings
	 */
	public constructor(settings: Settings)
	{
		this.settings = settings;
	}
	
	/**
	 * @brief Handle a message
	 * 
	 * @param client The discord client.
	 * @param message The message to handle
	 */
	public handleMessage(client: Discord.Client, message: Discord.Message)
	{
		let prefix: string = this.settings.cmdprefix;
		// Starts with prefix, and a word character immediately after.
		if(message.content.startsWith(prefix) && /.\w.*/.test(message.content))
		{
			// It's a command.
			// Split the command
			let cmd: string[] = message.content.split(' ');
			cmd[0] = cmd[0].substr(1);
			
			// If it's a help command...
			if(cmd[0] === 'help')
			{
				// If we need help with a specific command..
				if(cmd.length != 1)
				{
					let command: Command | undefined = this.getCommand(cmd[1]);
					if(command)
					{
						message.channel.send(Messages.HelpCommand(command));
					}
					else
					{
						message.channel.send(Messages.InvalidHelpCommand(cmd[1]));
					}
				}
				// Otherwise, use the generic help.
				else
				{
					// If we have admin perms, use the admin help.
					this.hasPermissions(message, 0x8).then((value: boolean) => {
						message.channel.send(Messages.Help(value));
					});
				}
			}
			else
			{
				// Create the command args interface.
				let args: CallbackArgs = {
					msg: message,
					argc: cmd.length - 1,
					argv: cmd.slice(1)
				};
				
				// Run the command.
				this.runCommand(client, cmd[0], args);
			}
		}
	}
	
	/**
	 * @brief Tries to run a command
	 * 
	 * @param client The discord client.
	 * @param command The command to run
	 * @param args The command extra arguments.
	 * 
	 * @returns true if successful, false otherwise.
	 */
	private runCommand(client: Discord.Client, command: string, args: CallbackArgs): boolean
	{
		// If the command exists...
		let found: Command | undefined = this.getCommand(command);
		if(found)
		{
			// Check that we have the permissions to run this command.
			this.hasPermissions(args.msg, found.permission).catch(console.error)
			.then((value: boolean) => {
				if(value)
				{
					found.callback(client, args);
				}
				else
				{
					args.msg.channel.send(Messages.NoPermissions());
				}		
			});
		}
		else
		{
			// Check if we should reply that the comand wasn't found.
			if(this.settings.cmdnotifybad)
			{
				// Reply
				args.msg.channel.send(Messages.InvalidCommand(command))
			}
		}
		return true;
	}
	
	/**
	 * @brief Try to find the command with the given name.
	 * 
	 * @param command The name of the command
	 * 
	 * @returns Command | undefined Undefined if we can't find it, otherwise the command found.
	 */
	private getCommand(command: string): Command | undefined
	{
		let found = Commands.find((value: Command) => value.name === command);
		return found;
	}
	
	/**
	 * @brief Checks if the author of a message has sufficient permissions.
	 * 
	 * @param message The message sent.
	 * @param permission The permissions integer to check against.
	 */
	private async hasPermissions(message: Discord.Message, permission: number): Promise<boolean>
	{
		return await message.guild.fetchMember(message).catch(console.error)
					.then((member: Discord.GuildMember) => {
						return member.hasPermission(permission);
					});
	}
};
