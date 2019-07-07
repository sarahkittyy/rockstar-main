export default interface Settings
{
	cmdprefix: string; // The prefix to use before commands
	cmdnotifybad: boolean; // Whether or not to notify if a command isn't valid.
	serverpath: string; // The base path to the port-indexed servers.
	logs: LogChannel[]; // Where all the 
	guildid: string; // The main guild this bot will be run in, where logs will be placed.
	adminlogchannel: string; // The name of the text channel in the guild where admin logs will be sent.
	reportrole: string; // The name of the role to @ in reports.
	reportwait: number; // Seconds to wait until a report is ticketed.
	reportchannel: string; // The channel to send archived reports to.
	reporthandledchannel: string; // Channel where handled reports go to.
	standardevents: string[]; // Event names logged to the standard channel.
	adminevents: string[]; // Events logged to the admin channels.
};

export interface LogChannel
{
	port: number; // The server's port.
	channel: string; // The name of the channel where this port's user logs will be sent to.
};