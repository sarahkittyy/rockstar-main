import * as Discord from 'discord.js';
import Settings from './Settings';

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
	/// The channel to log to.
	private channel: Discord.TextChannel;
	
	/**
	 * @brief Init the logger.
	 * 
	 * @param settings The app settings.
	 * @param channel The channel to log to.
	 */
	public constructor(settings: Settings, channel: Discord.TextChannel)
	{
		this.settings = settings;
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
		
	}
};