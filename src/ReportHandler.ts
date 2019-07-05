import * as Discord from 'discord.js';
import Settings from './Settings';
import Messages from './Messages';

/**
 * @brief A report, storing data to be watched.
 */
export interface Report
{
	timestamp: Date;
	member: Discord.GuildMember;
	sender: Discord.GuildMember;
	staffRole: Discord.Role;
	handled: boolean; 	//< Set to true when the report is handled,
						// so that the report timeout doesn't archive it. 
	message: string;
	archiveMsg?: Discord.Message;
};

/**
 * @brief Fully static class encapsulating report management and storage.
 */
export default class ReportHandler
{
	/// The app settings.
	private static settings: Settings;
	/// Unhandled reports.
	private static reports: Report[];
	
	/**
	 * @brief Called when the app initializes.
	 */
	public static init(settings: Settings)
	{
		// Init vars.
		this.settings = settings;
		this.reports = new Array<Report>();
	}
	
	/**
	 * @brief Handle a user's report.
	 * 
	 * @param member The user who sent the report.
	 * @param message The /handle command that was sent.
	 */
	public static handleReport(member: Discord.GuildMember, message: Discord.Message)
	{
		// Check if the report is unhandled.
		let report: Report | undefined = this.reports.find((r: Report) => r.sender.id === member.user.id);
		if(!report)
		{
			message.channel.send(Messages.NoOutstandingReports(member));
			return;
		}
		
		// Mark the report as handled.
		report.handled = true;
		
		// Delete the archive message if it exists.
		if(report.archiveMsg && report.archiveMsg.deletable)
		{
			report.archiveMsg.delete();
		}
		
		// Find the archive channel.
		let guildchannel: Discord.GuildChannel | undefined = 
			member.guild.channels.find((c: Discord.GuildChannel) => c.name === this.settings.reporthandledchannel);
		if(!guildchannel || guildchannel.type !== 'text')
		{
			message.channel.send(Messages.InvalidReportChannel());
			return;
		}
		let channel: Discord.TextChannel = <Discord.TextChannel>guildchannel;
		
		// Send the archived report.
		channel.send('`[ARCHIVED]`', Messages.ReportArchive(report));
		// Filter handled reports.
		this.reports = this.reports.filter((r: Report) => !r.handled);
	}
	
	/**
	 * @brief Report a user.
	 * 
	 * @param client The discord client.
	 * @param member The member to report.
	 * @param message The /report message. 
	 * @param note The message associated with the report.
	 */
	public static reportUser(	client: Discord.Client,
							 	member: Discord.GuildMember,
								message: Discord.Message,
								note: string)
	{
		// Get the staff role.
		let staff: Discord.Role | undefined =
			member.guild.roles.find((r: Discord.Role) => r.name === this.settings.reportrole);
		if(!staff)
		{
			message.channel.send(Messages.InvalidStaffRole());
			return;
		}
		if(!staff.mentionable)
		{
			message.channel.send(Messages.StaffNotMentionable());
			return;
		}
		
		// Respond that the report was successful.
		message.channel.send(`<@&${staff.id}>`, Messages.SuccessfulReport())
		.catch(console.error)
		.then((rmsg: Discord.Message) => {
			// Create the report object.
			let report: Report = {
				handled: false,
				member: member,
				sender: message.guild.members.get(message.author.id),
				staffRole: staff,
				timestamp: new Date(),
				message: note
			};
				
			// Save the report.
			this.reports.push(report);
			
			// Create a async callback, so that in a given amount of time
			// the report will be ticketed.
			setTimeout(()=>{
				// If we handled the report already, just return...
				if(report && report.handled)
				{
					return;
				}
				
				// Send the notification.
				rmsg.channel.send(Messages.ArchivedReport(report.sender.user))
				.catch(console.error);
				
				// Get the report channel.
				let rGuildChannel: Discord.GuildChannel | undefined =
					report.member.guild.channels.find((c: Discord.GuildChannel) => c.name === this.settings.reportchannel);
				if(!rGuildChannel)
				{
					rmsg.channel.send(Messages.InvalidReportChannel());
					return;
				}
				// Assert it's a text channel
				if(rGuildChannel.type !== 'text')
				{
					rmsg.channel.send(Messages.InvalidReportChannel());
					return;
				}
				// Get the text channel.
				let rchannel: Discord.TextChannel = <Discord.TextChannel>rGuildChannel;
				
				// Send the report.
				rchannel.send(Messages.ReportArchive(report))
				.catch(console.error)
				.then((msg: Discord.Message) => {
					// Save the archive message in the report, marking it as archived as well.
					report.archiveMsg = msg;
				});
				
				// Delete the original report message.
				if(rmsg.deletable)
				{
					rmsg.delete();
				}
								
			}, this.settings.reportwait * 1000);
			
			//? If the /report command should be deleted, uncomment.
			// Delete the original /report command.
			////if(message.deletable)
			////{
			////	message.delete();
			////}
		});
	}
};
