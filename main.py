import os
import logging
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = "https://crypto-panda.pages.dev"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

def webapp_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(" JUGAR CRYPTO PANDA 2025 ", web_app=types.WebAppInfo(url=WEBAPP_URL))
    ]])

@dp.message(Command("start"))
async def start(message: Message):
    user = message.from_user
    welcome = f""" BIENVENIDO <b>{user.first_name or "Panda"}</b>!

 El tap-to-earn que va a ROMPER TON en 2025
 Token $PANDA con airdrop masivo confirmado
 Los primeros ya tienen +100 MILLONES

¡Toca el panda y conviértete en leyenda!"""
    await message.answer(welcome, reply_markup=webapp_keyboard())

async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
