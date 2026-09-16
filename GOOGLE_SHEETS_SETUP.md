# Инструкция по подключению Google Sheets

## Вариант 1: Google Apps Script (рекомендуется)

Этот вариант не требует настройки OAuth и работает через простой HTTP API.

### 1. Создайте Google таблицу

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу с именем "МедУчёт"
3. Создайте следующие листы:

#### Лист "Сотрудники"
Колонки:
- A: id
- B: fullName
- C: personalNumber
- D: status (active/inactive/vacation/blocked)
- E: hireDate
- F: shifts
- G: income
- H: lastExpenseDate
- I: blocked

#### Лист "Номенклатура"
Колонки:
- A: id
- B: name
- C: category (medicine/equipment/consumable)
- D: unit
- E: price
- F: lastPriceChange

#### Лист "Расход"
Колонки:
- A: id
- B: date
- C: employeeId
- D: patientName
- E: patientDob
- F: nomenclatureId
- G: quantity
- H: priceAtMoment
- I: totalSum

#### Лист "Возвраты"
Колонки:
- A: id
- B: date
- C: employeeId
- D: nomenclatureId
- E: quantity
- F: status (pending/approved/adjusted)
- G: adjustedQuantity
- H: confirmedBy
- I: comment

#### Лист "Сообщения"
Колонки:
- A: id
- B: from
- C: fromRole
- D: to
- E: toRole
- F: text
- G: date
- H: read

#### Лист "Журнал"
Колонки:
- A: id
- B: timestamp
- C: userName
- D: role
- E: action
- F: objectType
- G: oldValue
- H: newValue
- I: comment

#### Лист "Уведомления"
Колонки:
- A: id
- B: type
- C: title
- D: text
- E: date
- F: read

#### Лист "Остатки"
Колонки:
- A: employeeId
- B: nomenclatureId
- C: quantity
- D: sumRub

### 2. Создайте Google Apps Script

1. В таблице откройте **Расширения** → **Apps Script**
2. Удалите весь код и вставьте следующий:

```javascript
const SPREADSHEET_ID = 'ВАШ_ID_ТАБЛИЦЫ'; // Замените на ID вашей таблицы

function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ws = ss.getSheetByName(sheet);
    
    if (action === 'read') {
      const data = ws.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: rows
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'write') {
      const rowData = JSON.parse(e.parameter.data);
      const headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];
      const row = headers.map(h => rowData[h] || '');
      ws.appendRow(row);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data written successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update') {
      const id = e.parameter.id;
      const idColumn = e.parameter.idColumn || 'id';
      const updateData = JSON.parse(e.parameter.data);
      
      const data = ws.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf(idColumn);
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === id) {
          headers.forEach((header, j) => {
            if (updateData[header] !== undefined) {
              ws.getRange(i + 1, j + 1).setValue(updateData[header]);
            }
          });
          break;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data updated successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'delete') {
      const id = e.parameter.id;
      const idColumn = e.parameter.idColumn || 'id';
      
      const data = ws.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf(idColumn);
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === id) {
          ws.deleteRow(i + 1);
          break;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data deleted successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}
```

3. Замените `ВАШ_ID_ТАБЛИЦЫ` на ID вашей таблицы (из URL)
4. Нажмите **Сохранить** (Ctrl+S)
5. Нажмите **Развернуть** → **Новое развертывание**
6. Выберите тип: **Веб-приложение**
7. Описание: "МедУчёт API"
8. Выполнять как: **Я**
9. Доступ: **Все**
10. Нажмите **Развернуть**
11. Скопируйте URL веб-приложения

### 3. Настройте приложение

1. Откройте приложение в браузере
2. Перейдите в настройки (иконка шестерёнки)
3. Вставьте URL веб-приложения
4. Нажмите "Сохранить"
5. Приложение начнёт синхронизироваться с Google Sheets

## Вариант 2: Google Sheets API с OAuth

Для более безопасного доступа можно использовать OAuth 2.0:

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект
3. Включите Google Sheets API
4. Создайте учётные данные (OAuth 2.0 Client ID)
5. Добавьте разрешённые URI
6. Скачайте client_secret.json
7. Используйте его в приложении

Этот вариант сложнее в настройке, но более безопасен.

## Структура данных

Все данные хранятся в Google Sheets в формате таблиц. Приложение автоматически:
- Читает данные при загрузке
- Записывает изменения в реальном времени
- Синхронизирует данные между клиентами
- Ведёт журнал изменений

## Безопасность

- Google Apps Script работает от имени владельца таблицы
- Доступ к данным контролируется через настройки Google Sheets
- Рекомендуется сделать таблицу приватной
- Используйте Google Apps Script для валидации данных

## Ограничения

- Google Sheets API имеет лимиты запросов (60 запросов в минуту)
- Максимальный размер таблицы: 10 миллионов ячеек
- Apps Script имеет лимит выполнения: 6 минут

Для больших объёмов данных рекомендуется использовать Google Cloud SQL или Firebase.
