import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils import executor

API_TOKEN = '7221470497:AAEFZSWmdewKJuNC_i89umxZZpUfVat0mmA'
WEB_APP_URL = 'https://ommicang.onrender.com'

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize bot and dispatcher
bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    keyboard = InlineKeyboardMarkup()
    button = InlineKeyboardButton("Open SolarFrens", url=WEB_APP_URL)
    keyboard.add(button)
    await message.reply("Welcome to SolarFrens! Click the button below to open the app.", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
