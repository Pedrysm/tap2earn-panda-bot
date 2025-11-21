import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web
from supabase import create_client
import os
from datetime import datetime

# Configuración para Railway - LAS VARIABLES SE OBTIENEN DE ENTORNO
BOT_TOKEN = os.getenv("BOT_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ADMIN_ID = os.getenv("ADMIN_ID")

# Configuración del webhook
WEBHOOK_PATH = f"/webhook/{BOT_TOKEN}"
WEBHOOK_URL = os.getenv("RAILWAY_STATIC_URL", "") + WEBHOOK_PATH

# Configuración del servidor
HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", 3000))

# Inicialización de bot y servicios
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def menu():
    kb = [
        [InlineKeyboardButton(text="🐼 TAP", callback_data="tap")],
        [InlineKeyboardButton(text="⚡️ Energía", callback_data="stats"), InlineKeyboardButton(text="🏆 Liga", callback_data="top")],
        [InlineKeyboardButton(text="🚀 Boosts", callback_data="boost"), InlineKeyboardButton(text="👥 Referidos", callback_data="ref")],
        [InlineKeyboardButton(text="🧾 Tareas", callback_data="tasks"), InlineKeyboardButton(text="🎁 Bonus Diario", callback_data="daily")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=kb)

@dp.message(Command("start"))
async def start(message: Message):
    user_id = message.from_user.id
    args = message.text.split()
    ref_by = int(args[1]) if len(args) > 1 and args[1].isdigit() else None

    data = supabase.table("users").select("*").eq("id", user_id).execute()
    if not data.data:
        new_user = {
            "id": user_id,
            "coins": 0.0,
            "energy": 5000,
            "max_energy": 5000,
            "multitap": 5,
            "recharge_speed": 3,
            "daily_streak": 0,
            "last_daily": None,
            "last_energy_update": datetime.utcnow().isoformat()
        }
        if ref_by:
            new_user["ref_by"] = ref_by
        supabase.table("users").insert(new_user).execute()
        if ref_by:
            await reward_referrals(ref_by, 1)

    await message.answer(
        "🐼 ¡BIENVENIDO A CRYPTOPANDA CLICKER!\n\n"
        "💥 El nuevo rey del tap-to-earn 2025\n"
        "🔥 Los primeros usuarios se están llevando MILLONES\n"
        "🚀 Token $PANDA en TON · Airdrop masivo confirmado\n\n"
        "¡Toca el panda y conviértete en millonario!",
        reply_markup=menu()
    )

async def reward_referrals(inviter_id: int, level: int = 1):
    rewards = [20000, 10000, 5000, 3000, 2000]
    if level > 5: return

    user = supabase.table("users").select("coins").eq("id", inviter_id).execute()
    if user.data:
        new_coins = user.data[0]["coins"] + rewards[level-1]
        supabase.table("users").update({"coins": new_coins}).eq("id", inviter_id).execute()

        parent = supabase.table("users").select("ref_by").eq("id", inviter_id).execute()
        if parent.data and parent.data[0]["ref_by"]:
            await reward_referrals(parent.data[0]["ref_by"], level + 1)

async def energy_loop():
    while True:
        await asyncio.sleep(2)
        users = supabase.table("users").select("id,energy,max_energy,recharge_speed,last_energy_update").execute().data
        now = datetime.utcnow()
        for u in users:
            if u["energy"] < u["max_energy"]:
                secs = (now - datetime.fromisoformat(u["last_energy_update"])).total_seconds()
                add = int(secs * u["recharge_speed"])
                new_e = min(u["energy"] + add, u["max_energy"])
                supabase.table("users").update({
                    "energy": new_e,
                    "last_energy_update": now.isoformat()
                }).eq("id", u["id"]).execute()

@dp.callback_query(F.data == "tap")
async def tap(cb: CallbackQuery):
    user = supabase.table("users").select("*").eq("id", cb.from_user.id).execute().data[0]
    if user["energy"] < 1:
        await cb.answer("⚡️ Sin energía, espera que se recargue", show_alert=True)
        return

    earn = user["multitap"]
    supabase.table("users").update({
        "coins": user["coins"] + earn,
        "energy": user["energy"] - 1,
        "last_energy_update": datetime.utcnow().isoformat()
    }).eq("id", cb.from_user.id).execute()

    await cb.message.edit_text(
        f"🐼 ¡PANDAZO! +{earn:,}\n\n"
        f"💰 Total: {user['coins'] + earn:,.0f} $PANDA\n"
        f"⚡️ Energía: {max(0, user['energy']-1)}/{user['max_energy']}",
        reply_markup=menu()
    )

@dp.callback_query(F.data == "stats")
async def stats(cb: CallbackQuery):
    u = supabase.table("users").select("*").eq("id", cb.from_user.id).execute().data[0]
    await cb.message.edit_text(
        f"🐼 Tus estadísticas:\n\n"
        f"💰 Monedas: {u['coins']:,.0f}\n"
        f"⚡️ Energía: {u['energy']}/{u['max_energy']}\n"
        f"🔥 Multitap: x{u['multitap']}\n"
        f"⏩ Recarga: {u['recharge_speed']}/seg\n",
        reply_markup=menu()
    )

@dp.callback_query(F.data == "ref")
async def ref(cb: CallbackQuery):
    link = f"https://t.me/{(await bot.get_me()).username}?start={cb.from_user.id}"
    count = supabase.table("users").select("id", count="exact").eq("ref_by", cb.from_user.id).execute().count or 0
    await cb.message.edit_text(
        f"👥 REFERIDOS – Gana en 5 niveles:\n\n"
        f"1º → 20k | 2º → 10k | 3º → 5k | 4º → 3k | 5º → 2k\n\n"
        f"Tus referidos directos: {count}\n\n"
        f"🔗 Tu enlace mágico:\n{link}",
        reply_markup=menu()
    )

@dp.callback_query(F.data.in_(["boost", "tasks", "daily", "top"]))
async def soon(cb: CallbackQuery):
    await cb.answer("🚀 ¡En las próximas 24h! Prepárate...", show_alert=True)

async def on_startup(bot: Bot):
    # Configurar webhook para Railway
    if os.getenv("RAILWAY_STATIC_URL"):
        await bot.set_webhook(WEBHOOK_URL)
        logging.info(f"Webhook configured: {WEBHOOK_URL}")
    else:
        # Para desarrollo local, eliminar webhook
        await bot.delete_webhook()
        logging.info("Webhook deleted for local development")

async def main():
    # Iniciar el bucle de energía
    asyncio.create_task(energy_loop())
    
    # Si estamos en Railway, usamos webhook, sino polling
    if os.getenv("RAILWAY_STATIC_URL"):
        # Configurar aplicación web para Railway
        app = web.Application()
        webhook_requests_handler = SimpleRequestHandler(
            dispatcher=dp,
            bot=bot,
        )
        webhook_requests_handler.register(app, path=WEBHOOK_PATH)
        
        # Configurar startup
        app.on_startup.append(on_startup)
        
        # Configurar la aplicación
        setup_application(app, dp, bot=bot)
        
        # Ejecutar la aplicación
        return app
    else:
        # Para desarrollo local: usar polling
        await on_startup(bot)
        await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Para Railway: iniciar servidor web
    if os.getenv("RAILWAY_STATIC_URL"):
        app = asyncio.run(main())
        web.run_app(app, host=HOST, port=PORT)
    else:
        # Para desarrollo local: usar polling
        asyncio.run(main())
