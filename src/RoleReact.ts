import * as Discord from 'discord.js';

export interface RoleReactMessage
{
	message: Discord.Message;
	role: Discord.Role;
	emoji: Discord.Emoji | string;
};

/**
 * @brief Tags messages for watching for reacts,
 * on a reaction gives / takes away a role.
 */
export default class RoleReact
{
	/// All messages tagged for watching.
	private static messages: RoleReactMessage[];
	
	/**
	 * @brief Called in Bot.ts's constructor.
	 */
	public static init()
	{
		this.messages = new Array<RoleReactMessage>();
	}
	
	/**
	 * @brief Tag a message for watching.
	 * 
	 * @param message The message to tag.
	 * @param role The role to give / take.
	 * @param emoji The emoji to use.
	 */
	public static tagMessage(message: Discord.Message, role: Discord.Role, emoji: Discord.Emoji | string)
	{
		// Add the checkmark / x reacts to the message.
		message.react(emoji).catch(console.error);
		
		// Append the message to the watchlist.
		this.messages.push(
			{
				message: message,
				role: role,
				emoji: emoji
			}
		);
	}
	
	/**
	 * @brief Called by the discord client's messageReactionAdd event.
	 * 
	 * @param reaction The reaction added.
	 * @param user The user who added the reaction.
	 */
	public static onMessageReactionAdd(reaction: Discord.MessageReaction, user: Discord.User)
	{
		// Make sure we're watching the updated message.
		let rrmsg: RoleReactMessage | undefined
			= this.messages.find((msg: RoleReactMessage) => msg.message.id === reaction.message.id);
		if(!rrmsg)
		{
			return;
		}
		
		// If the reaction isn't the message's assigned one...
		if(typeof rrmsg.emoji === 'string')
		{		
			if(reaction.emoji.name !== rrmsg.emoji)
			{
				return; // Exit
			}	
		}
		else
		{
			if(reaction.emoji.id !== rrmsg.emoji.id)
			{
				return;
			}
		}
		
		// Fetch the reaction creator.
		reaction.message.guild.fetchMember(user)
		.then((member: Discord.GuildMember) => {
			// Give them the role.
			member.addRole(rrmsg.role)
			.catch(console.error);
		}).catch(console.error);
	}
	
	public static onMessageReactionRemove(reaction: Discord.MessageReaction, user: Discord.User)
	{
		// Make sure we're watching the updated message.
		let rrmsg: RoleReactMessage | undefined
			= this.messages.find((msg: RoleReactMessage) => msg.message.id === reaction.message.id);
		if(!rrmsg)
		{
			return;
		}
		
		// If the reaction isn't the message's assigned one...
		if(typeof rrmsg.emoji === 'string')
		{		
			if(reaction.emoji.name !== rrmsg.emoji)
			{
				return; // Exit
			}	
		}
		else
		{
			if(reaction.emoji.id !== rrmsg.emoji.id)
			{
				return;
			}
		}
		
		// Fetch the guild user.
		reaction.message.guild.fetchMember(user)
		.catch(console.error)
		.then((member: Discord.GuildMember)=>{
			// Remove the role from them.
			member.removeRole(rrmsg.role)
			.catch(console.error);
		});
	}
};
