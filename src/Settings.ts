export default interface Settings
{
	cmdprefix: string; // The prefix to use before commands
	cmdnotifybad: boolean; // Whether or not to notify if a command isn't valid.
	serverpath: string; // The base path to the port-indexed servers.
	ports: Array<number>; // All the SCP Server ports to log events from.
	guildid: string; // The main guild this bot will be run in, where logs will be placed.
	logchannel: string; // The name of the text channel in the guild where logs will be sent.
};