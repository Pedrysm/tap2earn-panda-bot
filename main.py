import os
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web
from supabase import create_client

# ===== CONFIG =====
BOT_TOKEN = os.getenv("BOT_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://crypto-panda.vercel.app")  # Cambia esto cuando tengas la web

WEBHOOK_PATH = f"/webhook/{BOT_TOKEN.split(':')[1]}"
WEBHOOK_URL = f"https://{os.getenv('RAILWAY_STATIC_URL') or os.getenv('RENDER_EXTERNAL_URL') or 'tu-dominio.onrender.com'}{WEBHOOK_PATH}"

bot = Bot(token=BOT_TOKEN, parse_mode="HTML")
dp = Dispatcher()
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Botón para abrir la WebApp (esto es lo que hará que sea como Hamster Kombat)
def webapp_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton("🐼 JUGAR CRYPTO PANDA 🐼", web_app=types.WebAppInfo(url=WEBAPP_URL))
    ]])

@dp.message(Command("start"))
async def start(message: Message):
    user = message.from_user
    ref_id = None
    if len(message.text.split()) > 1:
        try:
            ref_id = int(message.text.split()[1])
            if ref_id == user.id:
                ref_id = None
        except:
            ref_id = None

    # Crear o actualizar usuario
    supabase.table("users").upsert({
        "id": user.id,
        "username": user.username or "",
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "ref_by": ref_id,
        "coins": 0,
        "energy": 5000,
        "max_energy": 5000,
        "multitap": 1,
        "recharge_speed": 1
    }, on_conflict="id").execute()

    # Bonus automático al referidor (usando función de Supabase)
    if ref_id:
        supabase.rpc("add_referral_bonus", {"inviter_id": ref_id}).execute()

    await message.answer(
        f"🐼 ¡BIENVENIDO <b>{user.first_name}</b> a Crypto Panda!\n\n"
        "🚀 El tap-to-earn más ÉPICO de TON 2025\n"
        "💎 Airdrop $PANDA confirmado\n"
        "🔥 Ya hay usuarios con +100 MILLONES de coins\n\n"
        "¡Abre la app y conviértete en millonario!",
        reply_markup=webapp_keyboard()
    )

async def on_startup(app):
    await bot.set_webhook(WEBHOOK_URL)
    logging.info(f"Webhook activado: {WEBHOOK_URL}")

def main():
    app = web.Application()
    handler = SimpleRequestHandler(dispatcher=dp, bot=bot)
    handler.register(app, path=WEBHOOK_PATH)
    app.on_startup.append(on_startup)
    setup_application(app, dp, bot=bot)
    return app

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    web.run_app(main(), host="0.0.0.0", port=int(os.getenv("PORT", 3000)))
