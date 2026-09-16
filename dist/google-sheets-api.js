// Google Sheets API модуль
class GoogleSheetsAPI {
  constructor(webAppUrl) {
    this.webAppUrl = webAppUrl;
    this.cache = new Map();
    this.syncQueue = [];
    this.isSyncing = false;
  }

  async read(sheetName) {
    try {
      const url = `${this.webAppUrl}?action=read&sheet=${encodeURIComponent(sheetName)}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        this.cache.set(sheetName, result.data);
        return result.data;
      }
      throw new Error(result.error || 'Failed to read');
    } catch (error) {
      console.error(`Error reading ${sheetName}:`, error);
      return this.cache.get(sheetName) || [];
    }
  }

  async write(sheetName, data) {
    try {
      const url = `${this.webAppUrl}?action=write&sheet=${encodeURIComponent(sheetName)}&data=${encodeURIComponent(JSON.stringify(data))}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        const cached = this.cache.get(sheetName) || [];
        cached.push(data);
        this.cache.set(sheetName, cached);
        return true;
      }
      throw new Error(result.error || 'Failed to write');
    } catch (error) {
      console.error(`Error writing to ${sheetName}:`, error);
      this.syncQueue.push({ action: 'write', sheet: sheetName, data });
      return false;
    }
  }

  async update(sheetName, id, data, idColumn = 'id') {
    try {
      const url = `${this.webAppUrl}?action=update&sheet=${encodeURIComponent(sheetName)}&id=${encodeURIComponent(id)}&idColumn=${encodeURIComponent(idColumn)}&data=${encodeURIComponent(JSON.stringify(data))}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        const cached = this.cache.get(sheetName) || [];
        const index = cached.findIndex(item => item[idColumn] === id);
        if (index !== -1) {
          cached[index] = { ...cached[index], ...data };
          this.cache.set(sheetName, cached);
        }
        return true;
      }
      throw new Error(result.error || 'Failed to update');
    } catch (error) {
      console.error(`Error updating ${sheetName}:`, error);
      this.syncQueue.push({ action: 'update', sheet: sheetName, id, data, idColumn });
      return false;
    }
  }

  async delete(sheetName, id, idColumn = 'id') {
    try {
      const url = `${this.webAppUrl}?action=delete&sheet=${encodeURIComponent(sheetName)}&id=${encodeURIComponent(id)}&idColumn=${encodeURIComponent(idColumn)}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        const cached = this.cache.get(sheetName) || [];
        const filtered = cached.filter(item => item[idColumn] !== id);
        this.cache.set(sheetName, filtered);
        return true;
      }
      throw new Error(result.error || 'Failed to delete');
    } catch (error) {
      console.error(`Error deleting from ${sheetName}:`, error);
      this.syncQueue.push({ action: 'delete', sheet: sheetName, id, idColumn });
      return false;
    }
  }

  async syncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;
    this.isSyncing = true;
    console.log(`Syncing ${this.syncQueue.length} pending changes...`);
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    for (const item of queue) {
      try {
        if (item.action === 'write') await this.write(item.sheet, item.data);
        else if (item.action === 'update') await this.update(item.sheet, item.id, item.data, item.idColumn);
        else if (item.action === 'delete') await this.delete(item.sheet, item.id, item.idColumn);
      } catch (error) {
        console.error('Sync failed:', item, error);
        this.syncQueue.push(item);
      }
    }
    this.isSyncing = false;
    if (this.syncQueue.length > 0) setTimeout(() => this.syncQueue(), 5000);
  }

  async loadAllData() {
    const sheets = ['Сотрудники','Номенклатура','Расход','Возвраты','Сообщения','Журнал','Уведомления','Остатки'];
    const results = {};
    for (const sheet of sheets) {
      results[sheet] = await this.read(sheet);
    }
    return results;
  }

  async testConnection() {
    try {
      const url = `${this.webAppUrl}?action=read&sheet=Сотрудники`;
      const response = await fetch(url);
      const result = await response.json();
      return result.success;
    } catch (error) {
      return false;
    }
  }

  getQueueSize() {
    return this.syncQueue.length;
  }
}

window.GoogleSheetsAPI = GoogleSheetsAPI;
