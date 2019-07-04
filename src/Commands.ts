import * as Discord from 'discord.js';
import Messages from './Messages';
import RoleReact from './RoleReact';
import * as Emoji from 'node-emoji';
import Settings from './Settings';

export interface Command
{
	name: string;
	permission: number;
	users?: string[];
	desc?: string;
	args?: CommandArg[];
	callback: (client: Discord.Client, args: CallbackArgs) => void;
};

export interface CommandArg
{
	name: string;
	required: boolean;
	type: string;
	default?: any;
	desc?: string;
};

export function stringifyCommandArg(arg: CommandArg): string
{
	let braces: string[] = (arg.required) ? ['<', '>'] : ['[', ']'];
	
	return `${braces[0]}${arg.name}: ${arg.type}${braces[1]}`;
};

export interface CallbackArgs
{
	msg: Discord.Message;
	argv: string[];
	argc: number;
	settings: Settings;
};

export default <Command[]>[
	{
		name: 'report',
		permission: 0,
		args: [
			{
				name: 'user',
				required: true,
				desc: 'The user to report',
				type: 'string (@their_username)'
			},
			{
				name: 'message',
				required: false,
				default: 'No message.',
				desc: 'The message to send staff with your report.',
				type: 'string'
			}
		],
		desc: 'Report a user to staff.',
		callback: (client: Discord.Client, args: CallbackArgs) => {
			if(args.argc < 1)
			{
				args.msg.channel.send(Messages.InvalidCommandArgs('report'));
				return;
			}
			// Get the arguments.
			let userhandle: string = args.argv[0];
			let message: string = args.argv.slice(2).join(' ') || 'No message given';
			
			// Get the user mentioned.
			let userID: string = /<@(\d+)>/.exec(userhandle)[1];
			// Get the user.
			let user: Discord.GuildMember = args.msg.guild.members.get(userID);
			
			// Get the staff role.
			let staff: Discord.Role | undefined =
				user.guild.roles.find((r: Discord.Role) => r.name === args.settings.reportrole);
			if(!staff)
			{
				args.msg.channel.send(Messages.InvalidStaffRole());
				return;
			}
			if(!staff.mentionable)
			{
				args.msg.channel.send(Messages.StaffNotMentionable());
				return;
			}
			
			// Delete the report message.
			if(args.msg.deletable)
			{
				args.msg.delete().catch(console.error);
			}
			
			// Respond that the report was successful.
			args.msg.channel.send(`<@&${staff.id}>`, Messages.SuccessfulReport());
		}
	},
	{
		name: 'role-react',
		permission: -1,
		users: [
			"295233589916991489"	
		],
		args: [
			{
				name: 'rolename',
				required: true,
				desc: 'The role to give/take',
				type: 'string'
			},
			{
				name: 'reaction',
				required: true,
				default: 'white-check-mark',
				desc: 'The reaction to click on to toggle the role.',
				type: 'string'
			},
			{
				name: 'message',
				required: true,
				desc: 'The message to send',
				type: 'string'
			}
		],
		desc: 'Create a message with reaction options to give / take away a role.',
		callback: (client: Discord.Client, args: CallbackArgs) => {
			if(args.argc < 3)
			{
				args.msg.channel.send(Messages.InvalidCommandArgs('role-react'));
				return;
			}
			if(args.msg.channel.type != 'text')
			{
				args.msg.channel.send(Messages.InvalidChannelType());
				return;
			}
			
			let roleName: string = args.argv[0];
			// Find the role in the message's guild.
			let guild: Discord.Guild | undefined = args.msg.guild;
			if(!guild)
			{
				args.msg.channel.send(Messages.InvalidChannelType());
				return;
			}
			let role: Discord.Role | undefined =
				guild.roles.find((r: Discord.Role) => r.name === roleName);
			if(!role)
			{
				args.msg.channel.send(Messages.InvalidRole(roleName));
				return;
			}
			
			// Find the emoji.
			let emoji: Discord.Emoji | string | undefined
				= client.emojis.find((e: Discord.Emoji) => e.name === args.argv[1]);
			if(!emoji)
			{
				emoji = Emoji.emojify(`:${args.argv[1]}:`);
				if(!emoji)
				{
					args.msg.channel.send(Messages.InvalidEmoji(args.argv[1]));
					return;
				}
			}
			
			// Create the new role-react message.
			args.msg.channel.send(Messages.RoleReactMessage(args.argv.slice(2).join(' '))).catch(console.error)
			.then((message: Discord.Message) => {
				// Add the role & message to the RoleReact tagger.
				RoleReact.tagMessage(message, role, emoji);
			});
			
			// Finally, delete the command message.
			if (args.msg.deletable)
			{
				args.msg.delete().catch(console.error);
			}
		}
	}
];