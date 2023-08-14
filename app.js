const { App } = require('@slack/bolt');
const Sentiment = require('sentiment');
const axios = require('axios');
require('dotenv').config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_LEVEL_TOKEN,
    socketMode: true, 
});

//Give a positive quote after a hello message
app.message('hello', async ({ message, say }) => {
    await say(`Hello, <@${message.user}>! The positivity quote of the day is: Keep your face always toward the sunshine, and shadows will fall behind you.`);
  });
  
//Response to a knock knock joke
app.event('app_mention', async ({ event, say }) => {
    if (event.text.toLowerCase().includes('knock knock')) {
        await say({
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'Why hello!',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: "Who's there?",
                    },
                },
            ],
        });
    }
});

//changing kelvins to fahrenehit, giving weather
function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9/5 + 32).toFixed(2);
  }
  
  app.command('/weather', async ({ command, ack, say }) => {
    await ack();
  
    const apiKey = process.env.OPENWEATHERMAP_API_KEY; 
    const cityName = command.text;
  
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
      );
  
      const weatherData = response.data;
      const description = weatherData.weather[0].description;
      const temperatureKelvin = weatherData.main.temp;
      const temperatureFahrenheit = kelvinToFahrenheit(temperatureKelvin);
  
      const message = `The current weather in ${cityName} is ${description} with a temperature of ${temperatureFahrenheit}°F. Make sure to wear sunscreen!`;
  
      await say(message);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      await say('Sorry, there was an error fetching weather data.');
    }
  });

  //giving compliments
  async function getCompliment() {
    try {
      const response = await axios.get('https://www.affirmations.dev/');
      return response.data.affirmation;
    } catch (error) {
      console.error('Error fetching compliment:', error);
      return 'Please try again!'; 
    }
  }
  
  app.message('Give me a positive affirmation', async ({ say }) => {
    const compliment = await getCompliment();
    await say(compliment);
  });

//NLP sentimentanalyzer, gives list of things to improve mood
const sentimentAnalyzer = new Sentiment();

const happinessSuggestions = [
  "Eat your favorite food! I personally love pizza, tacos, and sushi.",
  "Go for a walk while listening to your favorite music! I enjoy Clairo.",
  "Watch your comfort Netflix show! I love Gilmore Girls.",
  "Practice gratitude by writing down three things you're thankful for.",
  "Grab boba or a coffee with a close friend! I recommend Tastea.",
];

app.message(async ({ message, say }) => {
  const sentimentScore = sentimentAnalyzer.analyze(message.text).score;

  if (sentimentScore < 0) {
    const allSuggestions = happinessSuggestions.join('\n');
    await say(`Happiness is an important factor for a fulfilling life. Please consider doing these activities to boost your mood: \n${allSuggestions}`);
  }
  else if (sentimentScore > 0) {
    const positiveResponse = [
        "I am happy to see you happy!",
        "Sounds great! I am happy to hear that.",
    ];
    const randomPositiveResponse = positiveResponse[Math.floor(Math.random() * positiveResponse.length)];
    await say(randomPositiveResponse);
  }
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();

//"Eat your favorite food! I personally love pizza, tacos, and sushi.",
//"Go for a walk while listening to your favorite music",
//"Watch your comfort Netflix show! I love Gilmore Girls.",
//"Practice gratitude by writing down three things you're thankful for.",
//"Grab boba or a coffee with a close friend!",