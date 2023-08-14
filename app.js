const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_LEVEL_TOKEN,
    socketMode: true, 
});

app.message('hello', async ({ message, say }) => {
    await say(`Hello, <@${message.user}>! The positivity quote of the day is: Keep your face always toward the sunshine, and shadows will fall behind you.`);
  });
  

app.event('app_mention', async ({ event, say }) => {
    if (event.text.toLowerCase().includes('knock knock')) {
        // Respond with a knock-knock joke
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


function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9/5 + 32).toFixed(2);
  }
  
  app.command('/weather', async ({ command, ack, say }) => {
    await ack();
  
    // Retrieve weather data from the API
    const apiKey = process.env.OPENWEATHERMAP_API_KEY; // Read API key from .env
    const cityName = command.text;
  
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
      );
  
      const weatherData = response.data;
      // Process the weather data and compose a response message
      const description = weatherData.weather[0].description;
      const temperatureKelvin = weatherData.main.temp;
      const temperatureFahrenheit = kelvinToFahrenheit(temperatureKelvin);
  
      const message = `The current weather in ${cityName} is ${description} with a temperature of ${temperatureFahrenheit}°F. Make sure to wear sunscreen!`;
  
      // Send the weather information to the Slack channel
      await say(message);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      await say('Sorry, there was an error fetching weather data.');
    }
  });



(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running!');
})();