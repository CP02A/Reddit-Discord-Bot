const Discord = require('discord.js');
const fetch = require("node-fetch");
const colors = require("colors");
const client = new Discord.Client();

const channels = [];
const postsUsed = [];
var lastmsg = [];
var index = 0;
var posts;

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

fetch('https://www.reddit.com/r/memes.json').then(
	u => { return u.json();}
).then(json => {
	posts = json;
});

setInterval(() => {
	var date = new Date();
	var reply;
	var max = 0;
	if(index > 5){
		fetch('https://www.reddit.com/r/memes.json').then(
			u => { return u.json();}
		).then(json => {
			posts = json;
		});
		index = 0;
	}
	index++;
	do{
		var rand = Math.floor(Math.random() * posts.data.children.length);
		reply = posts.data.children[rand];
		max++;
	} while(max < 100 && postsUsed.includes(reply.data.url));
	postsUsed.push(reply.data.url);
	lastmsg.forEach(obj => obj.delete());
	lastmsg = [];
	channels.forEach(obj => {
		if(obj.type === 'meme'){
			sendRedditPicToChannel(reply, obj.channel);
			setTimeout(() => obj.channel.send("Next post will be sent in 7 minutes (:" + ((date.getMinutes()+7)%60) + ")").then(messg => lastmsg.push(messg)), 5000);
		}
	});
}, 420000);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.forEach(obj => {
	  if(obj.id == 645738914732310588)
		  channels.push({"type": "meme", "channel": obj});
  });
});

client.on('message', msg => {
	if (msg.content.toLowerCase().split(' ')[0] === 'reddit-test') {
		msg.channel.send("test").then(messg => setTimeout(() => messg.delete(),5000));
	}
	if (msg.content.toLowerCase().split(' ')[0] === 'reddit-all' || msg.content.toLowerCase().split(' ')[0] === 'reddita') {
		if(msg.content.toLowerCase().split(' ').length === 2)
			fetch('https://www.reddit.com/r/' + msg.content.split(' ')[1] + '.json').then(
				u => { return u.json();}
			).then(json => {
				if(typeof json.data === "undefined" || json.data.children.length === 0)
					msg.channel.send("The subreddit \"" + msg.content.split(" ")[1] + "\" does not exist!");
				else {
					msg.channel.send("Listing all the posts of r/" + msg.content.split(' ')[1] + "...");
					json.data.children.forEach(obj => sendRedditPicToChannel(obj, msg.channel));
				}
			});
		else
			msg.channel.send('```markdown\nusage: reddit-all <subreddit>```');
	}
	if (msg.content.toLowerCase().split(' ')[0] === 'reddit' || msg.content.toLowerCase().split(' ')[0] === 'reddit') {
		if(msg.content.toLowerCase().split(' ').length === 2)
			fetch('https://www.reddit.com/r/' + msg.content.split(' ')[1] + '.json').then(
				u => { return u.json();}
			).then(json => {
				var rand = 0;
				var max = 0;
				if(typeof json.data === "undefined" || json.data.children.length === 0)
					msg.channel.send("The subreddit \"" + msg.content.split(" ")[1] + "\" does not exist!");
				else {
					do {
						max++;
						rand = Math.floor(Math.random()*json.data.children.length);
					} while(max < 100 && json.data.children[rand].data.url.includes('comments'));
					if(max === 0)
						msg.channel.send("no picture found!");
					else 
						sendRedditPicToChannel(json.data.children[rand], msg.channel);
				}
			});
		else
			msg.channel.send('```markdown\nusage: reddit-get <subreddit>```');
	}
	if (msg.content.toLowerCase().split(' ')[0] === 'reddit-help') {
		if(msg.content.toLowerCase().split(' ').length === 1)
			msg.channel.send('Commands available: ```markdown\nreddit\nreddit-help\nreddit-get <subreddit>\n  Aliases: redditg\nreddit-all <subreddit>\n  Aliases: reddita\nreddit-test (for dev)```');
		else
			msg.channel.send('```markdown\nusage: reddit-help```');
	}
	if (msg.content.toLowerCase().split(' ')[0] === 'reddit-info' || msg.content.toLowerCase().split(' ')[0] === 'redditi') {
		if(msg.content.toLowerCase().split(' ').length === 1)
			msg.channel.send('This Bot is by @CP02A#9955\nIt is currently under developement.\nFor a list of available commands, use ```markdown\nreddit-help```');
		else
			msg.channel.send('```markdown\nusage: reddit```');
	}
});

function getgfycatLink(link, callback){
	fetch('https://api.gfycat.com/v1/gfycats/' + link.substr(19)).then(
		json => { return json.json();}
	).then(json => {
		callback(json.gfyItem.gifUrl);
	});
}

function resolveLink(link, callback){
	if(link.startsWith('https://gfycat.com/'))
		fetch('https://api.gfycat.com/v1/gfycats/' + link.substr(19)).then(
			json => { return json.json();}
		).then(json => {
			callback(json.gfyItem.gifUrl);
		});
	else callback(link);
}

function sendRedditPicToChannel(redditPostJSON, channel){
	resolveLink(redditPostJSON.data.url, url => {
		console.log("Sending " + url + " to " + channel.name);
		if(redditPostJSON.data.over_18){
			channel.send({files: [{attachment: url, name: 'SPOILER_picture.' + url.split('.')[url.split('.').length - 1]}] });
		} else {
			fetch('https://reddit.com/user/' + redditPostJSON.data.author + '/about.json').then(
				json => { return json.json();}
			).then(json => {
				channel.send({
				  "embed": {
					"title": redditPostJSON.data.title,
					"url": "https://www.reddit.com" + redditPostJSON.data.permalink,
					"color": 7579773,
					"image": {
					  "name": "image." + url.split('.')[url.split('.').length - 1],
					  "url": url
					},
					"author": {
					  "name": redditPostJSON.data.author,
					  "url": "https://www.reddit.com/user/" + redditPostJSON.data.author,
					  "icon_url": json.data.icon_img
					}
				  }
				});
			});
		}
	});
	/*if(url.startsWith('https://gfycat.com/')){
		if(spoiler)
			getgfycatLink(url, link => channel.send({files: [{attachment: link, name: 'SPOILER_picture.gif'}] }));
		else
			getgfycatLink(url, link => channel.send({files: [{attachment: link, name: 'picture.gif'}] }));
	} else {
		if(spoiler)
			channel.send({files: [{attachment: url, name: 'SPOILER_picture.' + url.split('.')[url.split('.').length - 1]}] });
		else
			channel.send({files: [{attachment: url, name: 'picture.' + url.split('.')[url.split('.').length - 1]}] });
	}*/
}

client.login(''); // I removed it before uploading it
