export default interface Settings
{
	cmdprefix: string; // The prefix to use before commands
	cmdnotifybad: boolean; // Whether or not to notify if a command isn't valid.
	serverpath: string; // The base path to the port-indexed servers.
	ports: Array<number>; // All the SCP Server ports to log events from.
};