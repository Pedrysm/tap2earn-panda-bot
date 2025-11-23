import os
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = "https://crypto-panda.pages.dev"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(" JUGAR CRYPTO PANDA 2025 ", web_app=WebAppInfo(url=WEBAPP_URL))
    ]])
    await message.answer(
        " BIENVENIDO!\n\n"
        " El tap-to-earn que va a ROMPER TON en 2025\n"
        " Token $PANDA · Airdrop masivo confirmado\n\n"
        "¡Toca el panda y conviértete en leyenda!",
        reply_markup=keyboard
    )

async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
