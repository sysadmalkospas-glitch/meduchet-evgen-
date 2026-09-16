# 🏥 План развёртывания приложения «МедУчёт» на VDS с ISPManager

## 📋 Содержание

1. [Обзор архитектуры](#1-обзор-архитектуры)
2. [Подготовка VDS](#2-подготовка-vds)
3. [Настройка ISPManager](#3-настройка-ispmanager)
4. [Размещение приложения](#4-размещение-приложения)
5. [Настройка домена и DNS](#5-настройка-домена-и-dns)
6. [SSL-сертификат (HTTPS)](#6-ssl-сертификат-https)
7. [Настройка Nginx](#7-настройка-nginx)
8. [Безопасность](#8-безопасность)
9. [Интеграция с Google Sheets](#9-интеграция-с-google-sheets)
10. [Мониторинг и логирование](#10-мониторинг-и-логирование)
11. [Резервное копирование](#11-резервное-копирование)
12. [Обновление приложения](#12-обновление-приложения)
13. [Траблшутинг](#13-траблшутинг)

---

## 1. Обзор архитектуры

```
┌──────────────────────────────────────────────────────────────┐
│                        VDS (ISPManager)                       │
│                                                               │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │   Nginx     │───▶│  Статические │    │  Google Sheets  │ │
│  │  (порт 80)  │    │   файлы      │    │     API         │ │
│  │  (порт 443) │    │  /var/www/   │    │  (внешний API)  │ │
│  └─────────────┘    │  meduchet/   │    └─────────────────┘ │
│         │           └──────────────┘           ▲             │
│         │                                      │             │
│         └──────────────────────────────────────┘             │
│                    (fetch через JS)                           │
└──────────────────────────────────────────────────────────────┘
         ▲
         │ HTTPS
         │
    ┌────┴────┐
    │ Браузер │
    │ пользователя│
    └─────────┘
```

### Компоненты:
| Компонент | Описание |
|-----------|----------|
| **VDS** | Виртуальный выделенный сервер с ISPManager |
| **Nginx** | Веб-сервер для раздачи статики |
| **Приложение** | Статический HTML + JS + CSS (папка `dist/`) |
| **Google Sheets** | Хранилище данных (через Apps Script API) |
| **Let's Encrypt** | Бесплатный SSL-сертификат |

---

## 2. Подготовка VDS

### 2.1. Минимальные требования к серверу

| Параметр | Значение |
|----------|----------|
| CPU | 1 ядро |
| RAM | 512 МБ (минимум), 1 ГБ (рекомендуется) |
| Диск | 10 ГБ SSD |
| ОС | Ubuntu 22.04 / Debian 12 / AlmaLinux 9 |
| Сеть | Белый IP-адрес |

### 2.2. Первоначальная настройка сервера

Подключитесь к серверу по SSH:

```bash
ssh root@ВАШ_IP
```

Обновите систему:

```bash
# Для Ubuntu/Debian
apt update && apt upgrade -y

# Для AlmaLinux/CentOS
dnf update -y
```

Создайте пользователя для работы (не работайте под root):

```bash
adduser meduchet
usermod -aG sudo meduchet    # Ubuntu/Debian
# или
usermod -aG wheel meduchet   # AlmaLinux/CentOS
```

Настройте базовый firewall:

```bash
# Ubuntu/Debian (UFW)
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 1111/tcp   # ISPManager (если нестандартный порт)
ufw enable

# AlmaLinux (firewalld)
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=1111/tcp
firewall-cmd --reload
```

### 2.3. Установка ISPManager

Если ISPManager ещё не установлен:

```bash
# Скачайте установочный скрипт с официального сайта
# https://ispsystem.com/

# Для Ubuntu/Debian:
wget https://download.ispsystem.com/install.sh
chmod +x install.sh
./install.sh

# Следуйте инструкциям установщика
# Выберите версию: ISPmanager Lite (бесплатная) или Pro
```

После установки панель будет доступна по адресу:
```
https://ВАШ_IP:1111/ispmanager
```

---

## 3. Настройка ISPManager

### 3.1. Вход в панель

1. Откройте `https://ВАШ_IP:1111/ispmanager`
2. Войдите под пользователем `root` (или тем, что указали при установке)
3. Смените пароль при первом входе

### 3.2. Создание WWW-пользователя

1. Перейдите: **Учётные записи** → **Пользователи**
2. Нажмите **Создать**
3. Заполните:
   - Имя: `meduchet`
   - Пароль: (надёжный, минимум 16 символов)
   - Домашний каталог: `/var/www/meduchet`
4. Нажмите **OK**

### 3.3. Создание домена

1. Перейдите: **WWW-домены** → **Создать**
2. Заполните:
   - Имя домена: `meduchet.ВАШ_ДОМЕН.ru` (или ваш домен)
   - WWW-пользователь: `meduchet`
   - Документ root: `/var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru`
   - Веб-сервер: **Nginx**
3. Включите опции:
   - ✅ SSL
   - ✅ Поддержка PHP (не нужна, но можно оставить)
4. Нажмите **OK**

### 3.4. Проверка структуры папок

После создания домена ISPManager автоматически создаст структуру:

```
/var/www/meduchet/
└── meduchet.ВАШ_ДОМЕН.ru/
    └── public_html/     ← сюда загрузим файлы
```

Проверьте через SSH:

```bash
ls -la /var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/
```

---

## 4. Размещение приложения

### 4.1. Подготовка файлов

На локальном компьютере упакуйте файлы:

```bash
# В папке проекта
cd dist
zip -r meduchet.zip .
```

### 4.2. Загрузка на сервер

**Вариант А: Через SCP**

```bash
scp meduchet.zip meduchet@ВАШ_IP:/var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/
```

**Вариант Б: Через ISPManager File Manager**

1. В ISPManager перейдите: **Менеджер файлов**
2. Перейдите в `/var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/`
3. Нажмите **Загрузить**
4. Выберите `meduchet.zip`
5. Распакуйте архив

**Вариант В: Через Git**

```bash
# На сервере
cd /var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/
git clone https://github.com/ВАШ_ЛОГИН/meduchet.git .
```

### 4.3. Распаковка и настройка прав

```bash
# Подключитесь по SSH
ssh meduchet@ВАШ_IP

# Перейдите в папку
cd /var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/

# Распакуйте (если загружали zip)
unzip meduchet.zip

# Удалите архив
rm meduchet.zip

# Установите правильные права
chmod -R 755 .
chown -R meduchet:meduchet .
```

### 4.4. Проверка структуры

Должно получиться:

```
/var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/
├── index.html              ← главный файл
└── google-sheets-api.js    ← модуль API (если используется)
```

### 4.5. Проверка работы

Откройте в браузере:
```
http://meduchet.ВАШ_ДОМЕН.ru
```

Если видите приложение — всё работает!

---

## 5. Настройка домена и DNS

### 5.1. Покупка домена

Если домен ещё не куплен, рекомендуемые регистраторы:
- [reg.ru](https://reg.ru) — Россия
- [namecheap.com](https://namecheap.com) — Международный
- [cloudflare.com](https://cloudflare.com) — С бесплатным CDN

### 5.2. Настройка DNS-записей

В панели управления доменом создайте записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| **A** | `@` | `ВАШ_IP` | 3600 |
| **A** | `www` | `ВАШ_IP` | 3600 |
| **CNAME** | `meduchet` | `meduchet.ВАШ_ДОМЕН.ru` | 3600 |

### 5.3. Проверка DNS

```bash
# Проверьте разрешение домена
nslookup meduchet.ВАШ_ДОМЕН.ru

# Или
dig meduchet.ВАШ_ДОМЕН.ru

# Должен показать ваш IP
```

DNS обновляется от 15 минут до 24 часов.

### 5.4. Настройка в ISPManager

1. Перейдите: **WWW-домены**
2. Выберите ваш домен → **Изменить**
3. Убедитесь, что указано правильное имя домена
4. Проверьте, что включены алиасы: `www.meduchet.ВАШ_ДОМЕН.ru`

---

## 6. SSL-сертификат (HTTPS)

### 6.1. Установка Let's Encrypt через ISPManager

1. Перейдите: **WWW-домены** → выберите домен → **SSL**
2. Нажмите **Установить SSL-сертификат**
3. Выберите: **Let's Encrypt**
4. Отметьте:
   - ✅ Домен: `meduchet.ВАШ_ДОМЕН.ru`
   - ✅ Поддомен: `www.meduchet.ВАШ_ДОМЕН.ru`
5. Нажмите **Установить**
6. Дождитесь выпуска сертификата (1-5 минут)

### 6.2. Автоматическое обновление

ISPManager автоматически обновляет сертификаты Let's Encrypt. Проверьте:

1. Перейдите: **Инструменты** → **Планировщик (cron)**
2. Убедитесь, что есть задача обновления SSL

Если нет, создайте вручную:

```bash
# Откройте crontab
crontab -e

# Добавьте строку (обновление каждый день в 3:00)
0 3 * * * /usr/local/mgr5/sbin/letsencrypt --renew
```

### 6.3. Проверка HTTPS

Откройте:
```
https://meduchet.ВАШ_ДОМЕН.ru
```

Должен быть замочек 🔒 в адресной строке.

Проверьте на [SSL Labs](https://www.ssllabs.com/ssltest/):
- Должна быть оценка **A** или **A+**

---

## 7. Настройка Nginx

### 7.1. Дополнительная конфигурация Nginx

ISPManager создаёт базовый конфиг. Для улучшения добавьте:

1. В ISPManager: **WWW-домены** → выберите домен → **Изменить**
2. Перейдите на вкладку **Дополнительно**
3. В поле **Nginx конфигурация** добавьте:

```nginx
# Кэширование статики
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Gzip-сжатие
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
gzip_min_length 1000;

# Безопасность заголовки
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Редирект с www на без www
if ($host = www.meduchet.ВАШ_ДОМЕН.ru) {
    return 301 https://meduchet.ВАШ_ДОМЕН.ru$request_uri;
}
```

### 7.2. Перезагрузка Nginx

После изменения конфигурации:

```bash
# Через ISPManager: WWW-домены → применить изменения
# Или через SSH:
nginx -t                    # Проверка конфигурации
systemctl reload nginx      # Перезагрузка
```

### 7.3. Проверка

```bash
# Проверьте заголовки
curl -I https://meduchet.ВАШ_ДОМЕН.ru

# Должны увидеть:
# HTTP/2 200
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# ...
```

---

## 8. Безопасность

### 8.1. Защита SSH

Отредактируйте `/etc/ssh/sshd_config`:

```bash
nano /etc/ssh/sshd_config
```

Измените:

```
# Запрет входа под root
PermitRootLogin no

# Смените стандартный порт (опционально)
Port 2222

# Только ключевая аутентификация (рекомендуется)
PasswordAuthentication no
PubkeyAuthentication yes

# Ограничение попыток
MaxAuthTries 3

# Таймаут
ClientAliveInterval 300
ClientAliveCountMax 2
```

Перезапустите SSH:

```bash
systemctl restart sshd
```

⚠️ **Важно**: перед отключением парольной аутентификации настройте SSH-ключи!

### 8.2. Настройка SSH-ключей

На локальном компьютере:

```bash
# Генерация ключа
ssh-keygen -t ed25519 -C "meduchet-server"

# Копирование на сервер
ssh-copy-id -p 2222 meduchet@ВАШ_IP
```

### 8.3. Установка Fail2Ban

Защита от брутфорса:

```bash
# Ubuntu/Debian
apt install fail2ban -y

# AlmaLinux
dnf install epel-release -y
dnf install fail2ban -y

# Настройка
nano /etc/fail2ban/jail.local
```

Содержимое `jail.local`:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22,2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
```

Запустите:

```bash
systemctl enable fail2ban
systemctl start fail2ban
```

### 8.4. Базовая авторизация (опционально)

Если приложение доступно только внутренним пользователям, добавьте HTTP-авторизацию:

```bash
# Создайте файл паролей
htpasswd -c /var/www/meduchet/.htpasswd admin

# Введите пароль при запросе
```

Добавьте в конфигурацию Nginx:

```nginx
location / {
    auth_basic "МедУчёт — Авторизация";
    auth_basic_user_file /var/www/meduchet/.htpasswd;
    
    root /var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html;
    index index.html;
}
```

### 8.5. Защита папок

Создайте файл `.htaccess` (если Apache) или настройте Nginx:

```nginx
# Запрет доступа к служебным файлам
location ~ /\. {
    deny all;
}

location ~* \.(md|txt|log|sql|bak)$ {
    deny all;
}
```

### 8.6. Контрольный список безопасности

- [ ] SSH: отключён вход под root
- [ ] SSH: ключевая аутентификация
- [ ] SSH: нестандартный порт
- [ ] Firewall: открыты только нужные порты
- [ ] Fail2Ban: установлен и запущен
- [ ] SSL: сертификат Let's Encrypt
- [ ] HTTPS: принудительный редирект
- [ ] Заголовки безопасности: X-Frame-Options, XSS-Protection
- [ ] ISPManager: обновлён до последней версии
- [ ] Система: автоматические обновления безопасности

---

## 9. Интеграция с Google Sheets

### 9.1. Создание Google таблицы

1. Откройте [sheets.google.com](https://sheets.google.com)
2. Создайте таблицу **«МедУчёт»**
3. Скопируйте ID из URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
                                                          ↑
                                                     ЭТО ID
   ```

### 9.2. Создание листов

Создайте 8 листов (вкладок внизу):

**Лист «Сотрудники»** — первая строка (заголовки):
```
id | fullName | personalNumber | status | hireDate | shifts | income | lastExpenseDate | blocked
```

**Лист «Номенклатура»**:
```
id | name | category | unit | price | lastPriceChange
```

**Лист «Расход»**:
```
id | date | employeeId | patientName | patientDob | nomenclatureId | quantity | priceAtMoment | totalSum
```

**Лист «Возвраты»**:
```
id | date | employeeId | nomenclatureId | quantity | status | adjustedQuantity | confirmedBy | comment
```

**Лист «Сообщения»**:
```
id | from | fromRole | to | toRole | text | date | read
```

**Лист «Журнал»**:
```
id | timestamp | userName | role | action | objectType | oldValue | newValue | comment
```

**Лист «Уведомления»**:
```
id | type | title | text | date | read
```

**Лист «Остатки»**:
```
employeeId | nomenclatureId | quantity | sumRub
```

### 9.3. Создание Apps Script

1. В таблице: **Расширения** → **Apps Script**
2. Удалите весь код
3. Вставьте:

```javascript
const SPREADSHEET_ID = 'ВАШ_ID_ТАБЛИЦЫ';

function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ws = ss.getSheetByName(sheet);
    
    if (!ws) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Sheet not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Чтение данных
    if (action === 'read') {
      const data = ws.getDataRange().getValues();
      if (data.length < 2) {
        return ContentService.createTextOutput(
          JSON.stringify({ success: true,  [] })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[String(h).trim()] = row[i];
        });
        return obj;
      });
      return ContentService.createTextOutput(
        JSON.stringify({ success: true,  rows })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Запись данных
    if (action === 'write') {
      const rowData = JSON.parse(e.parameter.data);
      const headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];
      const row = headers.map(h => rowData[String(h).trim()] || '');
      ws.appendRow(row);
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Written' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Обновление данных
    if (action === 'update') {
      const id = String(e.parameter.id);
      const idCol = String(e.parameter.idColumn || 'id');
      const updateData = JSON.parse(e.parameter.data);
      const data = ws.getDataRange().getValues();
      const headers = data[0].map(h => String(h).trim());
      const idIdx = headers.indexOf(idCol);
      
      if (idIdx === -1) {
        return ContentService.createTextOutput(
          JSON.stringify({ success: false, error: 'ID column not found' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idIdx]) === id) {
          headers.forEach((h, j) => {
            if (updateData[h] !== undefined) {
              ws.getRange(i + 1, j + 1).setValue(updateData[h]);
            }
          });
          return ContentService.createTextOutput(
            JSON.stringify({ success: true, message: 'Updated' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Record not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Удаление данных
    if (action === 'delete') {
      const id = String(e.parameter.id);
      const idCol = String(e.parameter.idColumn || 'id');
      const data = ws.getDataRange().getValues();
      const headers = data[0].map(h => String(h).trim());
      const idIdx = headers.indexOf(idCol);
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idIdx]) === id) {
          ws.deleteRow(i + 1);
          return ContentService.createTextOutput(
            JSON.stringify({ success: true, message: 'Deleted' })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Record not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Unknown action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}
```

4. Замените `ВАШ_ID_ТАБЛИЦЫ` на ваш ID
5. Нажмите **Сохранить** (💾) или `Ctrl+S`

### 9.4. Развёртывание Apps Script

1. Нажмите **Развернуть** → **Новое развертывание**
2. Заполните:
   - ⚙️ Тип: **Веб-приложение**
   - 📝 Описание: `МедУчёт API v1`
   - 👤 Выполнять как: **Я (ваш email)**
   - 🌐 Доступ: **Все** (важно!)
3. Нажмите **Развернуть**
4. **Авторизуйте** доступ к Google Sheets
5. **Скопируйте URL** вида:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```

### 9.5. Подключение в приложении

1. Откройте `https://meduchet.ВАШ_ДОМЕН.ru`
2. Перейдите в раздел **⚙️ Настройки**
3. Вставьте скопированный URL Apps Script
4. Нажмите **💾 Сохранить**
5. Индикатор покажет ✅ **Подключено**
6. URL сохранится в `localStorage` браузера

### 9.6. Проверка работы

1. Добавьте сотрудника → проверьте, что он появился в Google таблице
2. Измените цену → проверьте изменение в таблице
3. Откройте таблицу через другой браузер → данные должны синхронизироваться

### 9.7. Безопасность Google Sheets

- Таблицу сделайте **приватной** (доступ только по ссылке — выключен)
- Apps Script работает от вашего аккаунта Google
- Доступ к данным контролируется через настройки Google
- Рекомендуется включить **двухфакторную аутентификацию** Google-аккаунта

---

## 10. Мониторинг и логирование

### 10.1. Логи Nginx

```bash
# Логи доступа
tail -f /var/www/httpd-logs/meduchet.ВАШ_ДОМЕН.ru.access.log

# Логи ошибок
tail -f /var/www/httpd-logs/meduchet.ВАШ_ДОМЕН.ru.error.log
```

### 10.2. Ротация логов

Создайте `/etc/logrotate.d/meduchet`:

```
/var/www/httpd-logs/meduchet.*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 644 meduchet meduchet
}
```

### 10.3. Мониторинг доступности

**Вариант А: UptimeRobot (бесплатно)**

1. Зарегистрируйтесь на [uptimerobot.com](https://uptimerobot.com)
2. Добавьте мониторинг: `https://meduchet.ВАШ_ДОМЕН.ru`
3. Интервал: 5 минут
4. Настройте уведомления (email, Telegram)

**Вариант Б: Простой скрипт**

Создайте `/usr/local/bin/check-meduchet.sh`:

```bash
#!/bin/bash
URL="https://meduchet.ВАШ_ДОМЕН.ru"
EMAIL="admin@ВАШ_ДОМЕН.ru"

HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$URL")

if [ "$HTTP_CODE" != "200" ]; then
    echo "МедУчёт недоступен! HTTP код: $HTTP_CODE" | \
    mail -s "⚠️ МедУчёт: сбой" "$EMAIL"
fi
```

Добавьте в cron:

```bash
chmod +x /usr/local/bin/check-meduchet.sh
crontab -e
# Добавьте:
*/5 * * * * /usr/local/bin/check-meduchet.sh
```

### 10.4. Мониторинг ресурсов

Установите **htop** для мониторинга:

```bash
# Ubuntu/Debian
apt install htop -y

# AlmaLinux
dnf install htop -y

# Запуск
htop
```

### 10.5. Контрольный список мониторинга

- [ ] Логи Nginx настроены и ротируются
- [ ] Мониторинг доступности (UptimeRobot или скрипт)
- [ ] Уведомления о сбоях (email/Telegram)
- [ ] Мониторинг ресурсов (CPU, RAM, диск)
- [ ] Просмотр логов через ISPManager

---

## 11. Резервное копирование

### 11.1. Автоматический бэкап через ISPManager

1. Перейдите: **Инструменты** → **Резервные копии**
2. Настройте:
   - Расписание: **ежедневно в 3:00**
   - Хранить: **7 копий**
   - Что копировать: WWW-домены, базы данных, почту

### 11.2. Бэкап на внешний сервер

Создайте скрипт `/usr/local/bin/backup-meduchet.sh`:

```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/meduchet"
REMOTE_USER="backup"
REMOTE_HOST="backup.ВАШ_ДОМЕН.ru"
REMOTE_DIR="/backups/meduchet"

# Создайте папку для бэкапов
mkdir -p $BACKUP_DIR

# Архивируйте файлы
tar -czf $BACKUP_DIR/meduchet_$DATE.tar.gz \
    /var/www/meduchet/ \
    /etc/nginx/sites-enabled/ \
    2>/dev/null

# Отправьте на удалённый сервер
rsync -avz -e "ssh -p 22" \
    $BACKUP_DIR/meduchet_$DATE.tar.gz \
    $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# Удалите старые локальные бэкапы (оставьте 7)
find $BACKUP_DIR -name "meduchet_*.tar.gz" -mtime +7 -delete

echo "Бэкап создан: meduchet_$DATE.tar.gz"
```

Настройте cron:

```bash
chmod +x /usr/local/bin/backup-meduchet.sh
crontab -e

# Добавьте:
0 2 * * * /usr/local/bin/backup-meduchet.sh >> /var/log/backup-meduchet.log 2>&1
```

### 11.3. Бэкап Google Sheets

Google Sheets автоматически хранит историю версий:
1. Откройте таблицу
2. **Файл** → **История версий** → **Смотреть историю версий**
3. Можно откатиться к любой предыдущей версии

### 11.4. Контрольный список бэкапов

- [ ] Ежедневный бэкап через ISPManager
- [ ] Еженедельный бэкап на внешний сервер
- [ ] Проверка восстановления из бэкапа (раз в месяц)
- [ ] Google Sheets: история версий включена
- [ ] Конфигурация Nginx сохранена отдельно

---

## 12. Обновление приложения

### 12.1. Обновление файлов

```bash
# Подключитесь к серверу
ssh meduchet@ВАШ_IP

# Перейдите в папку
cd /var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/

# Создайте бэкап текущей версии
cp -r . ../backup_$(date +%Y%m%d)

# Загрузите новые файлы (через SCP)
# На локальном компьютере:
scp dist/index.html meduchet@ВАШ_IP:/var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/

# Или через Git
git pull origin main
```

### 12.2. Обновление через ISPManager

1. Перейдите: **Менеджер файлов**
2. Перейдите в `public_html/`
3. Загрузите новый `index.html`
4. Перезапишите существующий

### 12.3. Очистка кэша браузера

После обновления пользователи могут видеть старую версию. Добавьте версию в URL:

```html
<!-- В index.html -->
<link rel="stylesheet" href="styles.css?v=1.2.0">
<script src="app.js?v=1.2.0"></script>
```

Или добавьте в Nginx:

```nginx
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### 12.4. Чек-лист обновления

- [ ] Создан бэкап текущей версии
- [ ] Новые файлы загружены
- [ ] Права доступа корректны (`chmod 755`)
- [ ] Приложение работает после обновления
- [ ] Кэш браузера очищен
- [ ] Google Sheets синхронизация работает

---

## 13. Траблшутинг

### 13.1. Белый экран

**Причина**: Ошибка JavaScript

**Решение**:
1. Откройте консоль браузера (F12)
2. Посмотрите ошибки
3. Проверьте, что все файлы загружены:
   ```bash
   curl -I https://meduchet.ВАШ_ДОМЕН.ru/index.html
   ```

### 13.2. Ошибка 403 Forbidden

**Причина**: Неправильные права доступа

**Решение**:
```bash
chown -R meduchet:meduchet /var/www/meduchet/
chmod -R 755 /var/www/meduchet/
chmod 644 /var/www/meduchet/meduchet.ВАШ_ДОМЕН.ru/public_html/index.html
```

### 13.3. Ошибка 502 Bad Gateway

**Причина**: Nginx не может подключиться к backend

**Решение**:
```bash
# Проверьте статус Nginx
systemctl status nginx

# Проверьте логи
tail -50 /var/log/nginx/error.log

# Перезапустите
systemctl restart nginx
```

### 13.4. Не работает SSL

**Причина**: Сертификат не выпущен или истёк

**Решение**:
1. В ISPManager: **WWW-домены** → SSL → переустановите
2. Проверьте, что домен разрешается в IP сервера
3. Проверьте, что порт 80 открыт (для проверки Let's Encrypt)

### 13.5. Не работает Google Sheets

**Причина**: CORS или неправильный URL

**Решение**:
1. Проверьте URL Apps Script в настройках приложения
2. Убедитесь, что Apps Script развёрнут с доступом «Все»
3. Проверьте в консоли браузера (F12) ошибки CORS
4. Проверьте, что Google таблица не удалена

### 13.6. Медленная работа

**Причина**: Недостаточно ресурсов или проблемы с сетью

**Решение**:
```bash
# Проверьте нагрузку
htop

# Проверьте диск
df -h

# Проверьте память
free -h

# Проверьте сеть
ping google.com
```

### 13.7. Полезные команды

```bash
# Перезапуск Nginx
systemctl restart nginx

# Проверка конфигурации Nginx
nginx -t

# Просмотр логов в реальном времени
tail -f /var/log/nginx/error.log

# Проверка портов
ss -tlnp

# Проверка процессов
ps aux | grep nginx

# Очистка кэша DNS
systemd-resolve --flush-caches
```

---

## 📞 Экстренные контакты

| Служба | Контакт |
|--------|---------|
| Поддержка хостинга | (укажите телефон/Email) |
| Администратор | (укажите контакт) |
| Google Workspace | support.google.com |

---

## ✅ Финальный чек-лист развёртывания

### Сервер
- [ ] VDS настроен и обновлён
- [ ] ISPManager установлен и работает
- [ ] Firewall настроен
- [ ] SSH защищён (ключи, нестандартный порт)
- [ ] Fail2Ban установлен

### Домен
- [ ] Домен куплен
- [ ] DNS-записи настроены
- [ ] Домен разрешается в IP сервера

### Приложение
- [ ] Файлы загружены на сервер
- [ ] Права доступа корректны
- [ ] Приложение открывается по HTTP
- [ ] Приложение открывается по HTTPS
- [ ] SSL-сертификат установлен

### Google Sheets
- [ ] Google таблица создана
- [ ] Листы созданы с правильными заголовками
- [ ] Apps Script развёрнут
- [ ] URL подключён в приложении
- [ ] Синхронизация работает

### Безопасность
- [ ] HTTPS работает
- [ ] Заголовки безопасности настроены
- [ ] HTTP-авторизация (опционально)
- [ ] Резервное копирование настроено
- [ ] Мониторинг доступности настроен

### Тестирование
- [ ] Добавление сотрудника работает
- [ ] Изменение цен работает
- [ ] Чат работает
- [ ] Данные синхронизируются с Google Sheets
- [ ] Приложение доступно с разных устройств

---

**Версия документа**: 1.0  
**Дата**: 2024  
**Автор**: Система учёта «МедУчёт»
