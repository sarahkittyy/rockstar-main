import * as Discord from 'discord.js';

export interface Command
{
	name: string;
	desc?: string;
	args?: CommandArg[];
	callback: (args: CallbackArgs) => void;
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
};

export default <Command[]>[
	{
		name: 'report',
		args: [
			{
				name: 'message',
				default: 'test',
				required: false,
				desc: 'The message to report',
				type: 'string'
			}	
		],
		desc: 'report a message',
		callback: (args: CallbackArgs) => {
			args.msg.channel.send('report test');
		}
	}
];