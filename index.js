const { Telegraf } = require('telegraf');
const { WeatherClient } = require('theweatherapi')
const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'locationiq',
  apiKey: 'YOUR NODE-GEOCODER API KEY SHOULD BE HERE', // in this example, I am using LocationIQ service. You can get API key with signing up on their service https://locationiq.com/
  formatting: null
}

const geocoder = NodeGeocoder(options);

const bot = new Telegraf('YOUR TELEGRAM BOT KEY SHOULD BE HERE'); //you can get key for your bot from Bot-Father in Telegram
const client = new WeatherClient({
  apiKey: 'YOUR WEATHER API KEY SHOULD BE HERE', //input your weather api key here, you can get it from https://www.weatherapi.com/
  language: 'RUSSIAN',
  defaultLocation: 'Odesa'
});


bot.start( ctx => ctx.reply(
`Привет ${ctx.from.first_name}!
Давай узнаем, какая сегодня погода в твоем городе?
Просто напиши команду /location.`

  ))

bot.hears("/location", (ctx) => {
    bot.telegram.sendMessage(ctx.chat.id, "Подтверди отправку своего местоположения?", requestLocationKeyboard);
    coord_y = ctx.message.location;
})


const requestLocationKeyboard = {
      "reply_markup": {
          "one_time_keyboard": true,
          "keyboard": [
              [
                {
                  text: "Отправить",
                  request_location: true,
                  one_time_keyboard: true,
                }
              ],
              ["Отменить"]
          ]
      } 
  }

bot.on('location', ({from, message}) => {
	let user = from.id;
	let location = message.location;
  let locationLat = location.latitude;
  let locationLon = location.longitude;
	console.log(user, location, locationLat, locationLon);
  async function cityChosen() {
    const res = await geocoder.reverse({ lat: locationLat, lon: locationLon })
    console.log(res[0].city)
    console.log(`Current Weather of ${res[0].city}:`, client.current.weather);
    bot.telegram.sendMessage(user, `Погода в ${res[0].city}:
Температура воздуха: ${client.current.weather.temp_c} °C
Ощущается как: ${client.current.weather.feelslike_c} °C
Сила ветра: ${(client.current.weather.wind_kph / 3.6).toFixed(2)} м/с
Влажность: ${client.current.weather.humidity}% 

`
);
  };
  cityChosen();
})

bot.launch() // bot launch, obviously =)