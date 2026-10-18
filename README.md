# RW — ReallyWorld Community Platform

## Развёртывание на Render

### Шаг 1: Загрузка на GitHub

1. Создай репозиторий на [github.com](https://github.com)
2. Скопируй файлы из папки `reallyworld` в репозиторий:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ТВОЙ_НИК/reallyworld.git
   git push -u origin main
   ```

### Шаг 2: Деплой на Render

1. Зайди на [render.com](https://render.com) и зарегистрируйся
2. Нажми **"+ New"** → **"Web Service"**
3. Подключи свой GitHub репозиторий
4. Настрой:
   - **Name**: reallyworld
   - **Region**: выбирай ближайший (Oregon или Frankfurt)
   - **Root Directory**: оставь пустым
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free** (бесплатно)
5. Нажми **"Create Web Service"**

### Шаг 3: Дождись деплоя

Render автоматически:
- Установит зависимости (`npm install`)
- Запустит сервер (`node server.js`)
- Даст тебе URL вида: `https://reallyworld-xxxx.onrender.com`

Подожди 2-5 минут. Готово! 🎉

## Использование

1. Открой полученный URL в браузере
2. Войди как админ:
   - Логин: `RW`
   - Пароль: `RW.RCON912398%#$#`
3. MAC адрес будет работать!

## Локальный запуск

```bash
npm install
npm start
```

Открой: http://localhost:3000

## Структура

```
reallyworld/
├── index.html      # Основной файл приложения
├── server.js       # Node.js сервер (Express + MAC API)
├── package.json    # Зависимости
└── .gitignore
```

## Возможности

- ✅ Регистрация и авторизация
- ✅ Чат с комнатами
- ✅ Форум с разделами
- ✅ Админ-панель
- ✅ Система банов (IP + MAC)
- ✅ Роли: Owner, Admin, Moderator, User
- ✅ Получение MAC-адреса через сервер

## Устранение проблем

### Сайт не загружается
- Проверь логи в панели Render (Logs)
- Убедись что `server.js` существует

### MAC не работает
- Сервер работает на том же порту
- MAC определяется через `ipconfig /all`

### Free tier замораживается
- На Render free сервисы "засыпают" после 15 мин простоя
- Первый запрос занимает ~30 секунд
- Для 24/7 нужен paid plan ($7/мес)
