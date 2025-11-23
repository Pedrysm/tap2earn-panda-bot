import os
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web

# ====== CONFIG 2025 ======
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = "https://crypto-panda.pages.dev"  # TU WEBAPP VIVA

# Webhook para Railway
WEBHOOK_HOST = os.getenv("RAILWAY_STATIC_URL", "localhost")
WEBHOOK_PATH = f"/webhook/{BOT_TOKEN.split(':')[1]}"
WEBHOOK_URL = f"https://{WEBHOOK_HOST}{WEBHOOK_PATH}"

bot = Bot(token=BOT_TOKEN)  # Sin parse_mode obsoleto
dp = Dispatcher()

# Botón épico
def webapp_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton("🐼 JUGAR CRYPTO PANDA 2025 🐼", web_app=types.WebAppInfo(url=WEBAPP_URL))
    ]])

@dp.message(Command("start"))
async def start(message: Message):
    user = message.from_user
    welcome = f"""🐼 ¡BIENVENIDO <b>{user.first_name or "Panda"}</b>!

🚀 El tap-to-earn que va a ROMPER TON en 2025
💎 Token $PANDA con airdrop masivo confirmado
🔥 Los primeros ya tienen +100 MILLONES

¡Toca el panda y conviértete en leyenda!"""
    await message.answer(welcome, reply_markup=webapp_keyboard(), disable_web_page_preview=True)

async def on_startup(app):
    await bot.set_webhook(WEBHOOK_URL)
    logging.info(f"Webhook activo: {WEBHOOK_URL}")

def create_app():
    app = web.Application()
    handler = SimpleRequestHandler(dispatcher=dp, bot=bot)
    handler.register(app, path=WEBHOOK_PATH)
    app.on_startup.append(on_startup)
    setup_application(app, dp, bot=bot)
    return app

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    web.run_app(create_app(), host="0.0.0.0", port=int(os.getenv("PORT", 3000)))
