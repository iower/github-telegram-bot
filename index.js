const IS_DEBUG = true;

console.log('Launch github-telegram-bot...');

const fs = require('fs');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {polling: true});

bot.on('message', (msg) => {
  console.log('message', msg);
  const chatId = msg.chat.id;
  if (chatId == config.TELEGRAM_OWNER_ID) {
    bot.sendMessage(chatId, 'Up!');
  }
});

// bot.sendMessage(config.TELEGRAM_OWNER_ID, 'Launched!');
console.log('Launched!');

const savedCommitsFileName = `saved-commits-${config.GITHUB_REPO_OWNER_NAME}-${config.GITHUB_REPO_NAME}`;
const savedCommitsFilePath = `./${savedCommitsFileName}.json`;

const process = async () => {
  try {
    const url = `https://api.github.com/repos/${config.GITHUB_REPO_OWNER_NAME}/${config.GITHUB_REPO_NAME}/commits`;
    const response = await fetch(url);
    const fetchedCommits = await response.json();

    if (fetchedCommits?.message?.includes('limit exceeded')) {
      console.error(fetchedCommits.message);
      return;
    }

    // read
    let savedCommits;
    try {
      savedCommits = JSON.parse(fs.readFileSync(savedCommitsFilePath, 'utf8'))
    } catch (e) {
      console.info(`Will be created: ${savedCommitsFilePath}`);
      saveCommits(fetchedCommits)
      return;
    }

    const newCommits = [];
    for (let i = 0; i < fetchedCommits.length; i++) {
      const fetchedCommit = fetchedCommits[i];
      if (savedCommits.find(savedCommit => savedCommit.sha === fetchedCommit.sha)) {
        break;
      } else {
        newCommits.push(fetchedCommit);
      }
    };

    if (newCommits.length) {
      console.log(`New commits! (${newCommits.length})`);
      for (let i = 0; i < newCommits.length; i++) {
        const newCommit = newCommits[i];
        await sendCommitSummary(newCommit);
      }
      saveCommits(fetchedCommits);
    }
  } catch (err) {
    console.error('process err |', err);
  }
}

process();
setInterval(() => {
  process();
}, config.UPDATE_INTERVAL_SEC * 1000);

const saveCommits = (commits) => {
  console.log(`Save commits to ${savedCommitsFilePath}`);
  fs.writeFileSync(savedCommitsFilePath, JSON.stringify(commits), (e) => {
    if (e) {
      console.error(`Cannot write ${savedCommitsFilePath}`);
      throw new Error(e)
    }
  });
}

const sendCommitSummary = (commit) => {
  const message = [
    `👤${commit?.author?.login || commit?.commit?.author?.name || comimt?.commit?.committer?.name || '?'}`,
    `📝${commit?.commit?.message || '?'}`,
    `🔗<a href='${commit?.html_url || '?'}'>${commit?.sha?.slice(0, 7) || '?'}</a>`
  ].join('\n')

  return bot.sendMessage(
    IS_DEBUG ? config.TELEGRAM_OWNER_ID : config.TELEGRAM_CHAT_ID,
    message,
    {
      reply_to_message_id:
        (!IS_DEBUG && Boolean(config.TELEGRAM_TOPIC_ID))
          ? config.TELEGRAM_TOPIC_ID
          : undefined,
      parse_mode : 'HTML',
      disable_web_page_preview: true,
    }
  );
}
