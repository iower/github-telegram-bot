console.log('Launch github-telegram-bot...')

const config = require('./config.json')
console.log('config', config)

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {polling: true});

bot.on('message', (msg) => {
  console.log('message', msg)
  const chatId = msg.chat.id;
  if (chatId == config.TELEGRAM_OWNER_ID) {
    bot.sendMessage(chatId, 'Up!');
  }
});

bot.sendMessage(config.TELEGRAM_OWNER_ID, 'Launched!');
console.log('Launched!');

const message = 'Hello world'

bot.sendMessage(
  config.TELEGRAM_CHAT_ID,
  message,
  config.TELEGRAM_TOPIC_ID
    ? { reply_to_message_id: config.TELEGRAM_TOPIC_ID }
    : undefined
);
