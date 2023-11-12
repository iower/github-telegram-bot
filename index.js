console.log('Launch github-telegram-bot...')

const fetch = require('node-fetch')
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json')

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {polling: true});

bot.on('message', (msg) => {
  console.log('message', msg)
  const chatId = msg.chat.id;
  if (chatId == config.TELEGRAM_OWNER_ID) {
    bot.sendMessage(chatId, 'Up!');
  }
});

// bot.sendMessage(config.TELEGRAM_OWNER_ID, 'Launched!');
console.log('Launched!');

const send = async () => {
  const url = `https://api.github.com/repos/${config.GITHUB_REPO_OWNER_NAME}/${config.GITHUB_REPO_NAME}/commits`
  const response = await fetch(url);
  const commits = await response.json();
  const commit = commits[1];

  const message = [
    `👤${commit?.author?.login || commit?.commit?.author?.name || comimt?.commit?.committer?.name || '?'}`,
    `📝${commit?.commit?.message || '?'}`,
    `🔗<a href='${commit?.html_url || '?'}'>${commit?.sha?.slice(0, 7) || '?'}</a>`
  ].join('\n')

  console.log(commit)
  console.log(message)

  bot.sendMessage(config.TELEGRAM_OWNER_ID, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  /*
  bot.sendMessage(
    config.TELEGRAM_CHAT_ID,
    message,
    {
      reply_to_message_id: config.TELEGRAM_TOPIC_ID || undefined,
      parse_mode : 'HTML',
      disable_web_page_preview: true
    }
  );
  */
}
send();

