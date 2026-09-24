const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 10000;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: FRONTEND_URL === "*" ? true : FRONTEND_URL,
  })
);

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Проверка работы сервера
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "TIa Connect Backend",
    time: new Date().toISOString(),
  });
});

// Проверка Telegram Mini App initData
function validateTelegramInitData(initData) {
  if (!initData || !process.env.TELEGRAM_BOT_TOKEN) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");

  if (!receivedHash) {
    return null;
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== receivedHash) {
    return null;
  }

  const userData = params.get("user");

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

// Авторизация пользователя Telegram
app.post("/api/auth/telegram", async (req, res) => {
  try {
    const { initData } = req.body;

    const telegramUser = validateTelegramInitData(initData);

    if (!telegramUser) {
      return res.status(401).json({
        ok: false,
        error: "Invalid Telegram authorization data",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users
        (telegram_id, username, first_name, last_name, language_code)
      VALUES
        ($1, $2, $3, $4, $5)
      ON CONFLICT (telegram_id)
      DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        language_code = EXCLUDED.language_code,
        updated_at = NOW()
      RETURNING id, telegram_id, username, first_name, last_name, language_code
      `,
      [
        telegramUser.id,
        telegramUser.username || null,
        telegramUser.first_name || null,
        telegramUser.last_name || null,
        telegramUser.language_code || "ru",
      ]
    );

    res.json({
      ok: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Server error",
    });
  }
});

// Получение VPN-серверов
app.get("/api/vpn/servers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        country_code,
        country_name,
        purpose_tag,
        description
      FROM vpn_servers
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, id ASC
    `);

    res.json({
      ok: true,
      servers: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Could not load VPN servers",
    });
  }
});

// Проверка подключения к базе данных
app.get("/api/database-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      ok: true,
      database: "connected",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      database: "connection failed",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TIa Connect Backend started on port ${PORT}`);
});
