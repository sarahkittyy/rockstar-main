import watch from 'node-watch';
import Settings from './Settings';
import * as fs from 'fs';

/**
 * @brief Watches in standard SCP server log folders, emitting events
 * when a file is changed.
 */
export default class SCPWatch
{
	/// The port of the server to watch.
	private port: number;
	/// The app settings.
	private settings: Settings;
	/// The watcher to attach events to.
	private watcher: fs.FSWatcher;
	
	/**
	 * @brief Init the SCPWatcher
	 */
	public constructor(settings: Settings, port: number)
	{
		this.port = port;
		this.settings = settings;
		
		// Create the watcher
		this.watcher = watch(this.settings.serverpath + this.port.toString(),
		{
			recursive: true,
			// Example file: Round_2019-06-29_19.21.25.txt
			filter: (f: string) => !/^Round.*\.txt$/.test(f)
		}, (type: 'update' | 'remove', filename: string) => {
			// No default update handler.
		});
		
		// Error handler
		this.watcher.on('error', console.error);
	}
	
	/**
	 * @brief Attaches callbacks to file modification events.
	 * 
	 * @param callback The callback to be called on an update.
	 */
	public onChange(callback: (type: string, filename: string) => void)
	{
		this.watcher.on('change', (type: string, filename: string) => {
			callback(type, filename);
		});
	}
};