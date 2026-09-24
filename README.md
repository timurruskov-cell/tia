# TIa Connect — Telegram Mini App starter

Это стартовый фронтенд Mini App для TIa Connect.

## Что уже есть
- Главная
- VPN / список серверов
- Теги серверов: SPEED / PRIVACY / STABLE / GLOBAL
- Оплата зарубежных сервисов
- Туристические SIM / eSIM
- Новости проекта в Telegram
- Профиль пользователя Telegram
- Адаптивный интерфейс под Mini App
- Telegram WebApp SDK
- Заготовка для подключения через Happ / INCY

## Что нужно подключить перед запуском
1. Домен с HTTPS.
2. Telegram Bot + настройка Mini App URL.
3. Backend с базой пользователей/подписок.
4. Реальные subscription/deep-link данные для Happ и INCY.
5. Платёжного провайдера для раздела оплаты.
6. Поставщика eSIM для каталога и выдачи eSIM.
7. Реальную ссылку Telegram-канала.

## Архитектура
Telegram → Mini App → Backend → VPN subscription / Happ / INCY
                         ├→ Payments provider
                         └→ eSIM provider

Важно: секреты, токены и URL подписок пользователей нельзя хранить в JS фронтенда.
