import * as Discord from 'discord.js';
import Settings from './Settings';
import * as Log from './Logs';
import * as fs from 'fs';

/**
 * @brief The content in a single line of the logs.
 */
export interface LogContent
{
	date: Date;
	event: string;
	subevent: string;
	data: string;
};

/**
 * @brief Logs SCP round log file changes.
 * Best if used on only a single log file.
 * Logs each line, and after every log stores the date of the last log message.
 * This way, there won't be any logging repeats.
 */
export default class SCPLog
{
	/// The app settings.
	private settings: Settings;
	/// The date of the last logged event.
	private date: Date;
	/// The user channel to log to.
	private channel: Discord.TextChannel;
	/// The admin channel to log to.
	private adminchannel: Discord.TextChannel;
	
	/**
	 * @brief Init the logger.
	 * 
	 * @param settings The app settings.
	 * @param channel The channel to log to.
	 * @param adminchannel The admin channel to log to.
	 */
	public constructor(settings: Settings, channel: Discord.TextChannel, adminchannel: Discord.TextChannel)
	{
		this.settings = settings;
		this.adminchannel = adminchannel;
		this.date = new Date();
		this.channel = channel;
	}
	
	/**
	 * @brief Call this every time a log file changes. 
	 * 
	 * @param filename The file that changed.
	 */
	public onLogFileChange(filename: string)
	{
		// Read the file contents.
		let contents: string = fs.readFileSync(filename).toString();
		// Get all lines.
		let lines: string[] = contents.split('\n');
		// Convert the lines to LogContent objects.
		let content: LogContent[] = lines.map((line: string) => this.splitLine(line)).filter((content: LogContent) => !!content);
		// Filter all content before the last logged event date.
		content = content.filter((content: LogContent) => content.date > this.date);
		if(!content || content.length === 0)
		{
			return;
		}
		// Set our new last date to the most recent content date.
		this.date = content.reduce((a: LogContent, b: LogContent) => {
			return a.date > b.date ? a : b;
		}).date;
		// Handle all log content.
		content.forEach((c: LogContent) => this.sendLogContent(c));
	}
	
	/**
	 * @brief Logs the content to the necessary channel (or just ignores it.)
	 * 
	 * @param content The content to log.
	 */
	private sendLogContent(content: LogContent)
	{
		// Check if it's a user event.
		if(this.settings.standardevents.find((s: string) => s === content.event))
		{
			this.channel.send(Log.event(content));
		}
		else if(this.settings.adminevents.find((s: string) => s === content.event))
		{
			this.adminchannel.send(Log.event(content));
		}
	}
	
	/**
	 * @brief Split a line of the log file into a LogContent object.
	 * 
	 * @param line The line to convert.
	 */
	private splitLine(line: string): LogContent | undefined
	{
		// Split at the | character.
		let sections: string[] = /(.*?)\|(.*?)\|(.*?)\|(.*)$/gm.exec(line);
		if(!sections)
		{
			return undefined;
		}
		sections = sections.slice(1);
		if(sections.length != 4)
		{
			return undefined;
		}
		sections = sections.map((s: string) => s.trim());
		// Get the date from section 0.
		let date: Date = this.getDate(sections[0]);
		// Get the event and subevent
		let event: string = sections[1];
		let subevent: string = sections[2];
		// Get the event data.
		let data: string = sections[3];
		
		// Return the logcontent object.
		return {
			date: date,
			event: event,
			subevent: subevent,
			data: data	
		};
	}
	
	/**
	 * @brief Get the date from a date string from the logs.
	 * 
	 * @param str The string representing the date from the logs.
	 */
	private getDate(str: string): Date
	{
		let res: string[] = 
		/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3}).*$/g.exec(str).slice(1);
		// Separate date components.
		let year = parseInt(res[0]);
		let month = parseInt(res[1]) - 1;
		let day = parseInt(res[2]);
		let hours = parseInt(res[3]);
		let minutes = parseInt(res[4]);
		let seconds = parseInt(res[5]);
		let milli = parseInt(res[6]);
		return new Date(year, month, day, hours, minutes, seconds, milli);
	}
};