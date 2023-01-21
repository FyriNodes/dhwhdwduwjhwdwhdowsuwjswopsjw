const fs = require('fs');
const child = require('child_process');
const chalk = require('chalk');
const yaml = require('js-yaml');

if (Number(process.version.split('.')[0]) < 16) {
	console.log('Invalid NodeJS Version!, Please use NodeJS 16.x or upper')
	process.exit()
}
if (fs.existsSync('./node_modules')) {
	const check = require('./node_modules/discord.js/package.json')
	if (Number(check.version.split('.')[0]) !== 14) {
		console.log('Invalid Discord.JS Version!, Please use Discord.JS 14.x')
		process.exit()
	}
} else {
	console.log('You didn\'t install the required node packages first!')
	console.log('Please wait... starting to install all required node packages using child process')
	try {
		child.execSync('npm i')
		console.log('Install complete!, please run "node index" command again!')
		process.exit()
	} catch (err) {
		console.log('Error! ', err)
		console.log('Support Server: https://discord.gg/zv6maQRah3')
		process.exit()
	}
}

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.config = yaml.load(fs.readFileSync('./config.yml', 'utf8'));

if (client.config.panel.adminkey || client.config.resource || client.config.message.image) {
	console.log(chalk.cyan('[PteroStats] ') + chalk.red('You are using old config file, please update your config file at ') + chalk.green('https://github.com/HirziDevs/PteroStats/blob/main/config.yml'))
	process.exit()
}
if (client.config.token.startsWith('Put') || !client.config.token.length) {
	console.log(chalk.cyan('[PteroStats] ') + chalk.red('Error! Invalid Discord Bot Token'))
	process.exit()
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(client.config.token);