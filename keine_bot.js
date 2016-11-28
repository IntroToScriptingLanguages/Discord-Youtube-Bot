var Discord = require('discord.js');
var google = require('googleapis');
var youtube = google.youtube('v3');

var fs = require('fs');
var ytdl = require('ytdl-core');
var client = new Discord.Client();


//This bot is designed for a single server's use only!
//Authorization URL:  https://discordapp.com/oauth2/authorize?client_id=235043766090727424&scope=bot&permissions=0
var API_KEY = 'AIzaSyDeoIH0u1e72AtfpwSKKOSy3IPp2UHzqi4';

client.on('ready', () => {
  console.log('I am ready!');
});

//Joins a voice channel
function join_voice(channels, message)
{
	var voice_channel = channels.find('type', 'voice');
	return voice_channel.join();
}

//Leaves all voice channels
function leave_voice(channels, message)
{
	var voice_channels = channels.findAll('type', 'voice');
	voice_channels.forEach(function(voice_channel, index, array)
	{
		voice_channel.leave();
	});
}

function play_video(id, title, channels, message)
{
	var streamOptions = { seek: 0, volume: 1 };
	message.reply('Playing video "'+title+'"');
						
	join_voice(channels, message)
						.then(connection => {
							var stream = ytdl('https:\\www.youtube.com\watch?v='+id, { quality : 'highest' });
							var dispatcher = connection.playStream(stream, streamOptions);
							
							dispatcher.once('end', function(){
								message.reply('Play finished');
							})
						});
}


//Returns the server name on ping
client.on('message', function(message) {
	var guilds = client.guilds;
	if (guilds.size == 1)
	{
		var server = message.channel.guild;//guilds.values().next().value;
		var channels = server.channels;
		/* Gets the number of channels on the server */
		if (message.content === '!channels') {
			message.reply("Number of channels in this server: "+server.channels.size);
		}
		/* Joins a voice channel */
		else if (message.content == '!join voice')
		{
			join_voice(channels, message);
		}
		/* Leaves all voice channels */
		else if (message.content === '!leave voice')
		{
			leave_voice(channels, message);
		}
		else if (message.content === '!video')
		{
			var params = {
				part: "snippet",
				q: "touhou music",
				auth: API_KEY
			};
			
			message.reply("Performing Youtube request...");
			
			youtube.search.list(params, function(error, response){
				if (!error)
				{
					var items = response.items;
					var video = items[0];
					var video_snippet = video.snippet;
					
					
					if (video.id.playlistId)
					{
						message.reply('Playing playlist "'+video_snippet.title+'" at playlist id = '+video.id.playlistId);
						
						var playlist_params = {
							part: "snippet",
							playlistID: video.id.playlistID,
							maxResults: 50,
							auth: API_KEY
						};
						
						youtube.playlistItems.list(playlist_params, function(pl_error, pl_response){
							if (!pl_error)
							{
								var playlistItems = pl_response.items;
								var num_items = playlistItems.length;
								message.reply(num_items+' videos retrieved and queued!');
								for (var i=0; i<num_items; i++)
								{
									play_video(playlistItems[0].contentDetails.videoID, playlistItems[0].snippet.title, channels, message);
									
								}
							}
							else
							{
								message.reply("Failed to retrieve playlist items from playlist!  "+error);
							}
						
						});
						
						
					}
					else
					{
					    play_video(video.id.videoId, video_snippet.title, channels, message)
					}
				}
				else
				{
					message.reply("Failed to retrieve video!  "+error);
				}
			});
			
			/*request.execute(function(response){
			    var request_str = JSON.stringify(response.result);
			});*/
		}
	}
	else
	{
		message.reply("Error: the bot is on more than one server!  Number of servers: "+guilds.size)
	}
  
});

//Announces any nickname changes in botspam
client.on('userUpdate', function(oldUser, newUser)
{
	var channel = client.channels.find('type', 'text');
	channel.sendMessage("User updated!");
	if (oldUser.username != newUser.username)
	{
		channel.sendMessage(oldUser.username+" changed his username to "+newUser.username+"!");
	}
}
);



client.login('MjM1MDQzNzY2MDkwNzI3NDI0.Ct01XQ.yxX5JYji2FTScqXfoOAiakVRl6s');