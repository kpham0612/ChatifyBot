const { App } = require('@slack/bolt');

const app = new App ({
    token: 'xoxb-5682548999299-5736544765280-Eqq0pDfcaH1TQ5XtTujXyqJ2',
    signingSecret: '51dbb851fed8f75e43cd14f260d9a3aa',
});

app.message('hello', async ({ message, say }) => {
    await say('Hey there, <@${message.user)>!');
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();