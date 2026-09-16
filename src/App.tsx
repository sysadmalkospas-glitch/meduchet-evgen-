import React, { useState } from 'react';

// ====== ТИПЫ ======
type EmployeeStatus = 'active' | 'inactive' | 'vacation' | 'blocked';

interface Employee {
  id: string; fullName: string; personalNumber: string; status: EmployeeStatus;
  hireDate: string; shifts: number; income: number; lastExpenseDate: string | null; blocked: boolean;
}
interface NomenclatureItem {
  id: string; name: string; category: 'medicine' | 'equipment' | 'consumable';
  unit: string; price: number; lastPriceChange: string;
}
interface ExpenseRecord {
  id: string; date: string; employeeId: string; patientName: string;
  patientDob: string; nomenclatureId: string; quantity: number; priceAtMoment: number; totalSum: number;
}
interface ReturnRecord {
  id: string; date: string; employeeId: string; nomenclatureId: string;
  quantity: number; status: 'pending' | 'approved' | 'adjusted';
  adjustedQuantity?: number; confirmedBy?: string; comment?: string;
}
interface Message {
  id: string; from: string; fromRole: string; to: string; toRole: string;
  text: string; date: string; read: boolean;
}
interface LogEntry {
  id: string; timestamp: string; userName: string; role: string;
  action: string; objectType: string; oldValue: string; newValue: string; comment?: string;
}
interface Notification {
  id: string; type: string; title: string; text: string; date: string; read: boolean;
}
interface EmployeeRemnant {
  employeeId: string; nomenclatureId: string; quantity: number; sumRub: number;
}

// ====== ДАННЫЕ ======
const initialEmployees: Employee[] = [
  { id: 'emp001', fullName: 'Иванов Иван Иванович', personalNumber: '1001', status: 'active', hireDate: '2023-01-15', shifts: 22, income: 45000, lastExpenseDate: '2024-03-28', blocked: false },
  { id: 'emp002', fullName: 'Петров Пётр Сергеевич', personalNumber: '1002', status: 'active', hireDate: '2023-03-01', shifts: 20, income: 42000, lastExpenseDate: '2024-03-27', blocked: false },
  { id: 'emp003', fullName: 'Сидорова Анна Михайловна', personalNumber: '1003', status: 'active', hireDate: '2023-05-10', shifts: 18, income: 38000, lastExpenseDate: '2024-03-28', blocked: false },
  { id: 'emp004', fullName: 'Козлов Дмитрий Алексеевич', personalNumber: '1004', status: 'vacation', hireDate: '2022-11-20', shifts: 0, income: 0, lastExpenseDate: '2024-03-15', blocked: false },
  { id: 'emp005', fullName: 'Морозова Елена Викторовна', personalNumber: '1005', status: 'active', hireDate: '2023-08-01', shifts: 21, income: 44000, lastExpenseDate: '2024-03-26', blocked: false },
  { id: 'emp006', fullName: 'Волков Андрей Николаевич', personalNumber: '1006', status: 'active', hireDate: '2024-01-10', shifts: 19, income: 40000, lastExpenseDate: '2024-03-28', blocked: false },
  { id: 'emp007', fullName: 'Новикова Ольга Дмитриевна', personalNumber: '1007', status: 'inactive', hireDate: '2022-06-15', shifts: 0, income: 0, lastExpenseDate: '2024-02-28', blocked: false },
  { id: 'emp008', fullName: 'Федоров Максим Игоревич', personalNumber: '1008', status: 'active', hireDate: '2023-09-01', shifts: 22, income: 46000, lastExpenseDate: '2024-03-28', blocked: false },
  { id: 'emp009', fullName: 'Соколова Мария Андреевна', personalNumber: '1009', status: 'active', hireDate: '2023-04-20', shifts: 17, income: 36000, lastExpenseDate: '2024-03-25', blocked: false },
  { id: 'emp010', fullName: 'Лебедев Сергей Павлович', personalNumber: '1010', status: 'blocked', hireDate: '2022-12-01', shifts: 0, income: 0, lastExpenseDate: '2024-03-01', blocked: true },
];

const initialNomenclature: NomenclatureItem[] = [
  { id: 'nom001', name: 'Анальгин', category: 'medicine', unit: 'ампулы', price: 45, lastPriceChange: '2024-03-15' },
  { id: 'nom002', name: 'Дротаверин', category: 'medicine', unit: 'ампулы', price: 32, lastPriceChange: '2024-03-10' },
  { id: 'nom003', name: 'Дексаметазон', category: 'medicine', unit: 'ампулы', price: 78, lastPriceChange: '2024-02-20' },
  { id: 'nom004', name: 'Физраствор 0.9%', category: 'medicine', unit: 'флаконы', price: 55, lastPriceChange: '2024-03-01' },
  { id: 'nom005', name: 'Шприц 5мл', category: 'consumable', unit: 'штуки', price: 12, lastPriceChange: '2024-01-15' },
  { id: 'nom006', name: 'Шприц 10мл', category: 'consumable', unit: 'штуки', price: 15, lastPriceChange: '2024-01-15' },
  { id: 'nom007', name: 'Бинт стерильный', category: 'consumable', unit: 'штуки', price: 28, lastPriceChange: '2024-02-01' },
  { id: 'nom008', name: 'Вата', category: 'consumable', unit: 'штуки', price: 35, lastPriceChange: '2024-02-01' },
  { id: 'nom009', name: 'Тонометр', category: 'equipment', unit: 'штуки', price: 3500, lastPriceChange: '2024-01-01' },
  { id: 'nom010', name: 'Пульсоксиметр', category: 'equipment', unit: 'штуки', price: 4200, lastPriceChange: '2024-01-01' },
  { id: 'nom011', name: 'Сумка-холодильник', category: 'equipment', unit: 'штуки', price: 2800, lastPriceChange: '2024-01-01' },
  { id: 'nom012', name: 'Димедрол', category: 'medicine', unit: 'ампулы', price: 38, lastPriceChange: '2024-03-05' },
];

const initialExpenses: ExpenseRecord[] = [
  { id: 'exp001', date: '2024-03-28', employeeId: 'emp001', patientName: 'Жуков Виктор Петрович', patientDob: '1980-05-12', nomenclatureId: 'nom001', quantity: 2, priceAtMoment: 45, totalSum: 90 },
  { id: 'exp002', date: '2024-03-28', employeeId: 'emp001', patientName: 'Жуков Виктор Петрович', patientDob: '1980-05-12', nomenclatureId: 'nom005', quantity: 3, priceAtMoment: 12, totalSum: 36 },
  { id: 'exp003', date: '2024-03-28', employeeId: 'emp001', patientName: 'Белова Наталья Сергеевна', patientDob: '1975-08-23', nomenclatureId: 'nom002', quantity: 1, priceAtMoment: 32, totalSum: 32 },
  { id: 'exp004', date: '2024-03-27', employeeId: 'emp002', patientName: 'Кузнецов Олег Дмитриевич', patientDob: '1990-03-15', nomenclatureId: 'nom001', quantity: 4, priceAtMoment: 45, totalSum: 180 },
  { id: 'exp005', date: '2024-03-27', employeeId: 'emp002', patientName: 'Кузнецов Олег Дмитриевич', patientDob: '1990-03-15', nomenclatureId: 'nom003', quantity: 2, priceAtMoment: 78, totalSum: 156 },
  { id: 'exp006', date: '2024-03-27', employeeId: 'emp003', patientName: 'Тихонова Ирина Павловна', patientDob: '1965-11-04', nomenclatureId: 'nom004', quantity: 1, priceAtMoment: 55, totalSum: 55 },
  { id: 'exp007', date: '2024-03-26', employeeId: 'emp005', patientName: 'Григорьев Алексей Васильевич', patientDob: '1988-07-19', nomenclatureId: 'nom001', quantity: 3, priceAtMoment: 45, totalSum: 135 },
  { id: 'exp008', date: '2024-03-25', employeeId: 'emp006', patientName: 'Орлова Светлана Юрьевна', patientDob: '1972-02-28', nomenclatureId: 'nom007', quantity: 5, priceAtMoment: 28, totalSum: 140 },
  { id: 'exp009', date: '2024-03-25', employeeId: 'emp008', patientName: 'Макаров Дмитрий Олегович', patientDob: '1995-09-10', nomenclatureId: 'nom012', quantity: 2, priceAtMoment: 38, totalSum: 76 },
  { id: 'exp010', date: '2024-03-24', employeeId: 'emp001', patientName: 'Смирнова Людмила Ивановна', patientDob: '1958-04-17', nomenclatureId: 'nom001', quantity: 2, priceAtMoment: 45, totalSum: 90 },
];

const initialReturns: ReturnRecord[] = [
  { id: 'ret001', date: '2024-03-27', employeeId: 'emp002', nomenclatureId: 'nom001', quantity: 10, status: 'pending' },
  { id: 'ret002', date: '2024-03-26', employeeId: 'emp005', nomenclatureId: 'nom005', quantity: 20, status: 'approved', confirmedBy: 'Руководитель' },
  { id: 'ret003', date: '2024-03-25', employeeId: 'emp001', nomenclatureId: 'nom002', quantity: 5, status: 'adjusted', adjustedQuantity: 4, confirmedBy: 'Кладовщик' },
];

const initialMessages: Message[] = [
  { id: 'msg001', from: 'emp001', fromRole: 'employee', to: 'manager', toRole: 'manager', text: 'Здравствуйте! Прошу пополнить запас Анальгина, осталось 5 ампул.', date: '2024-03-28 09:15', read: false },
  { id: 'msg002', from: 'manager', fromRole: 'manager', to: 'emp001', toRole: 'employee', text: 'Принято. Завтра будет доставлено.', date: '2024-03-28 09:30', read: true },
  { id: 'msg003', from: 'emp005', fromRole: 'employee', to: 'manager', toRole: 'manager', text: 'Возникла проблема с тонометром, не работает.', date: '2024-03-26 11:45', read: false },
];

const initialLog: LogEntry[] = [
  { id: 'log001', timestamp: '2024-03-28 09:30', userName: 'Руководитель', role: 'Руководитель', action: 'Отправка сообщения', objectType: 'Сообщение', oldValue: '—', newValue: 'Сообщение для emp001' },
  { id: 'log002', timestamp: '2024-03-15 14:30', userName: 'Руководитель', role: 'Руководитель', action: 'Изменение цены', objectType: 'Номенклатура nom001', oldValue: '40 ₽', newValue: '45 ₽' },
  { id: 'log003', timestamp: '2024-03-01 09:00', userName: 'Руководитель', role: 'Руководитель', action: 'Начисление прихода', objectType: 'Сотрудник emp001', oldValue: '0 ₽', newValue: '45 000 ₽' },
];

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'overexpense', title: 'Перерасход!', text: 'Петров П.С. — расход превышает приход на 1 200 ₽', date: '2024-03-28 10:00', read: false },
  { id: 'n2', type: 'inactivity', title: 'Неактивность', text: 'Новикова О.Д. не вносит расход более 7 дней', date: '2024-03-27 08:00', read: false },
  { id: 'n3', type: 'return', title: 'Новый возврат', text: 'Иванов И.И. оформил возврат: Дротаверин × 5 ампул', date: '2024-03-25 14:00', read: true },
  { id: 'n4', type: 'message', title: 'Новое сообщение', text: 'Морозова Е.В.: Возникла проблема с тонометром', date: '2024-03-26 11:45', read: false },
];

const initialRemnants: EmployeeRemnant[] = [
  { employeeId: 'emp001', nomenclatureId: 'nom001', quantity: 45, sumRub: 2025 },
  { employeeId: 'emp001', nomenclatureId: 'nom002', quantity: 20, sumRub: 640 },
  { employeeId: 'emp001', nomenclatureId: 'nom005', quantity: 100, sumRub: 1200 },
  { employeeId: 'emp002', nomenclatureId: 'nom001', quantity: 30, sumRub: 1350 },
  { employeeId: 'emp002', nomenclatureId: 'nom003', quantity: 10, sumRub: 780 },
  { employeeId: 'emp003', nomenclatureId: 'nom001', quantity: 55, sumRub: 2475 },
  { employeeId: 'emp003', nomenclatureId: 'nom004', quantity: 8, sumRub: 440 },
  { employeeId: 'emp005', nomenclatureId: 'nom001', quantity: 40, sumRub: 1800 },
  { employeeId: 'emp005', nomenclatureId: 'nom009', quantity: 1, sumRub: 3500 },
  { employeeId: 'emp006', nomenclatureId: 'nom001', quantity: 35, sumRub: 1575 },
  { employeeId: 'emp006', nomenclatureId: 'nom007', quantity: 30, sumRub: 840 },
  { employeeId: 'emp008', nomenclatureId: 'nom001', quantity: 60, sumRub: 2700 },
  { employeeId: 'emp008', nomenclatureId: 'nom012', quantity: 25, sumRub: 950 },
];

// ====== ИКОНКИ (SVG) ======
const Icon = ({ d, size = 18, className = '' }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  package: 'M16.5 9.4l-9-5.19 M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
  dollar: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  archive: 'M21 8v13H3V8 M1 3h22v5H1z M10 12h4',
  arrows: 'M7 16V4m0 0L3 8m4-4l4 4 M17 8v12m0 0l4-4m-4 4l-4-4',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  scroll: 'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  chevron: 'M9 18l6-6-6-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  plus: 'M12 5v14 M5 12h14',
  x: 'M18 6L6 18 M6 6l12 12',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  unlock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 9.9-1',
  check: 'M20 6L9 17l-5-5',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  history: 'M12 8v4l3 3 M3.05 11a9 9 0 1 1 .5 4m-.5-4H8 M3.05 11H8',
};

// ====== ОСНОВНОЕ ПРИЛОЖЕНИЕ ======
function App() {
  const [page, setPage] = useState('dashboard');
  const [employees, setEmployees] = useState(initialEmployees);
  const [nomenclature, setNomenclature] = useState(initialNomenclature);
  const [expenses] = useState(initialExpenses);
  const [returns, setReturns] = useState(initialReturns);
  const [messages, setMessages] = useState(initialMessages);
  const [log, setLog] = useState(initialLog);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [remnants] = useState(initialRemnants);

  const addLog = (action: string, objectType: string, oldValue: string, newValue: string) => {
    setLog(prev => [{
      id: 'log' + Date.now(), timestamp: new Date().toLocaleString('ru-RU'),
      userName: 'Руководитель', role: 'Руководитель', action, objectType, oldValue, newValue
    }, ...prev]);
  };

  const navItems = [
    { id: 'dashboard', label: 'Панель', icon: icons.dashboard },
    { id: 'employees', label: 'Сотрудники', icon: icons.users },
    { id: 'nomenclature', label: 'Номенклатура', icon: icons.package },
    { id: 'income', label: 'Приход', icon: icons.dollar },
    { id: 'remnants', label: 'Остатки', icon: icons.archive },
    { id: 'expenses', label: 'Расход', icon: icons.arrows },
    { id: 'returns', label: 'Возвраты', icon: icons.arrows },
    { id: 'chat', label: 'Чат', icon: icons.chat },
    { id: 'reports', label: 'Отчёты', icon: icons.file },
    { id: 'log', label: 'Журнал', icon: icons.scroll },
  ];

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMsgs = messages.filter(m => !m.read && m.to === 'manager').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 256, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2563eb, #4338ca)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold' }}>💊</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>МедУчёт</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>Выездное подразделение</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = page === item.id;
            const badge = item.id === 'chat' ? unreadMsgs : item.id === 'dashboard' ? unreadNotifs : 0;
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 2, transition: 'all 0.15s',
                  background: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#1d4ed8' : '#4b5563', fontWeight: isActive ? 600 : 400, textAlign: 'left' as const }}>
                <Icon d={item.icon} size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #34d399, #0d9488)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>РВ</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>Руководитель</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>Выездное подразделение</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 256 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>{navItems.find(n => n.id === page)?.label}</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Март 2024</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setPage('dashboard')} style={{ position: 'relative', padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <Icon d={icons.bell} size={20} />
              {unreadNotifs > 0 && <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadNotifs}</span>}
            </button>
            <div style={{ height: 24, width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>Сидоров А.В.</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>Руководитель</div>
            </div>
          </div>
        </header>

        <div style={{ padding: 24 }}>
          {page === 'dashboard' && <DashboardPage employees={employees} expenses={expenses} notifications={notifications} nomenclature={nomenclature} returns={returns} remnants={remnants} />}
          {page === 'employees' && <EmployeesPage employees={employees} setEmployees={setEmployees} addLog={addLog} />}
          {page === 'nomenclature' && <NomenclaturePage nomenclature={nomenclature} setNomenclature={setNomenclature} addLog={addLog} />}
          {page === 'income' && <IncomePage employees={employees} setEmployees={setEmployees} addLog={addLog} />}
          {page === 'remnants' && <RemnantsPage employees={employees} nomenclature={nomenclature} remnants={remnants} />}
          {page === 'expenses' && <ExpensesPage expenses={expenses} employees={employees} nomenclature={nomenclature} />}
          {page === 'returns' && <ReturnsPage returns={returns} setReturns={setReturns} employees={employees} nomenclature={nomenclature} addLog={addLog} />}
          {page === 'chat' && <ChatPage messages={messages} setMessages={setMessages} employees={employees} />}
          {page === 'reports' && <ReportsPage employees={employees} expenses={expenses} nomenclature={nomenclature} remnants={remnants} />}
          {page === 'log' && <LogPage log={log} />}
        </div>
      </main>
    </div>
  );
}

// ====== СТРАНИЦЫ ======

function DashboardPage({ employees, expenses, notifications, nomenclature, returns, remnants }: any) {
  const active = employees.filter((e: Employee) => e.status === 'active');
  const totalIncome = employees.reduce((s: number, e: Employee) => s + e.income, 0);
  const totalExpense = expenses.reduce((s: number, e: ExpenseRecord) => s + e.totalSum, 0);
  const totalRemnant = remnants.reduce((s: number, r: EmployeeRemnant) => s + r.sumRub, 0);
  const unread = notifications.filter((n: Notification) => !n.read);
  const pending = returns.filter((r: ReturnRecord) => r.status === 'pending');

  const empData = employees.map((emp: Employee) => {
    const empExp = expenses.filter((e: ExpenseRecord) => e.employeeId === emp.id);
    const totalExp = empExp.reduce((s: number, e: ExpenseRecord) => s + e.totalSum, 0);
    const patients = new Set(empExp.map((e: ExpenseRecord) => e.patientName)).size;
    return { ...emp, totalExp, patients, diff: emp.income - totalExp };
  });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Общий приход', value: totalIncome.toLocaleString('ru-RU') + ' ₽', color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Общий расход', value: totalExpense.toLocaleString('ru-RU') + ' ₽', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Остаток подразд.', value: totalRemnant.toLocaleString('ru-RU') + ' ₽', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Сотрудники', value: active.length + ' / ' + employees.length, color: '#7c3aed', bg: '#faf5ff' },
        ].map((card, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {unread.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {unread.map((n: Notification) => (
            <div key={n.id} style={{ background: n.type === 'overexpense' ? '#fef2f2' : n.type === 'inactivity' ? '#fefce8' : n.type === 'return' ? '#fff7ed' : '#eff6ff', border: '1px solid ' + (n.type === 'overexpense' ? '#fecaca' : n.type === 'inactivity' ? '#fef08a' : n.type === 'return' ? '#fed7aa' : '#bfdbfe'), borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon d={icons.alert} size={18} className="" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{n.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, color: '#1f2937', margin: 0 }}>Сотрудники — обзор за март</h3>
        </div>
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Сотрудник', 'Статус', 'Приход (₽)', 'Расход (₽)', 'Разница (₽)', 'Пациентов', 'Смен'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Сотрудник' || h === 'Статус' ? 'left' as const : 'right' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empData.map((emp: any) => (
                <tr key={emp.id} style={{ borderTop: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #60a5fa, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                        {emp.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1f2937', fontSize: 12 }}>{emp.fullName}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>№{emp.personalNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500,
                      background: emp.status === 'active' ? '#dcfce7' : emp.status === 'vacation' ? '#fef9c3' : emp.status === 'blocked' ? '#fee2e2' : '#f3f4f6',
                      color: emp.status === 'active' ? '#15803d' : emp.status === 'vacation' ? '#a16207' : emp.status === 'blocked' ? '#b91c1c' : '#374151' }}>
                      {emp.status === 'active' ? 'Активен' : emp.status === 'vacation' ? 'Отпуск' : emp.status === 'blocked' ? 'Заблокирован' : 'Неактивен'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#16a34a' }}>{emp.income.toLocaleString('ru-RU')} ₽</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#dc2626' }}>{emp.totalExp.toLocaleString('ru-RU')} ₽</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: emp.diff >= 0 ? '#16a34a' : '#dc2626' }}>
                    {emp.diff >= 0 ? '+' : ''}{emp.diff.toLocaleString('ru-RU')} ₽
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#374151' }}>{emp.patients}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4b5563' }}>{emp.shifts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmployeesPage({ employees, setEmployees, addLog }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNum, setNewNum] = useState('');

  const filtered = employees.filter((e: Employee) => {
    const ms = e.fullName.toLowerCase().includes(search.toLowerCase()) || e.personalNumber.includes(search);
    const mf = filter === 'all' || e.status === filter;
    return ms && mf;
  });

  const handleAdd = () => {
    if (!newName || !newNum) return;
    const emp: Employee = { id: 'emp' + Date.now(), fullName: newName, personalNumber: newNum, status: 'active', hireDate: new Date().toISOString().split('T')[0], shifts: 0, income: 0, lastExpenseDate: null, blocked: false };
    setEmployees([...employees, emp]);
    addLog('Добавление сотрудника', 'Сотрудник ' + emp.id, '—', emp.fullName);
    setShowAdd(false); setNewName(''); setNewNum('');
  };

  const statusLabel: Record<string, string> = { active: 'Активен', inactive: 'Неактивен', vacation: 'Отпуск', blocked: 'Заблокирован' };
  const statusColor: Record<string, any> = { active: { bg: '#dcfce7', color: '#15803d' }, inactive: { bg: '#f3f4f6', color: '#374151' }, vacation: { bg: '#fef9c3', color: '#a16207' }, blocked: { bg: '#fee2e2', color: '#b91c1c' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, width: 220, outline: 'none' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="vacation">В отпуске</option>
            <option value="blocked">Заблокированные</option>
            <option value="inactive">Неактивные</option>
          </select>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Icon d={icons.plus} size={16} /> Добавить
        </button>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 400, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Новый сотрудник</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="ФИО" style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 12, outline: 'none', boxSizing: 'border-box' as const }} />
            <input value={newNum} onChange={e => setNewNum(e.target.value)} placeholder="Персональный номер" style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 16, outline: 'none', boxSizing: 'border-box' as const }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Отмена</button>
              <button onClick={handleAdd} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Сотрудник', '№', 'Статус', 'Дата найма', 'Смен', 'Действия'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp: Employee) => (
              <tr key={emp.id} style={{ borderTop: '1px solid #f9fafb' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1f2937' }}>{emp.fullName}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{emp.personalNumber}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500, background: statusColor[emp.status].bg, color: statusColor[emp.status].color }}>
                    {statusLabel[emp.status]}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{emp.hireDate}</td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>{emp.shifts}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {emp.status !== 'blocked' ? (
                      <button onClick={() => { setEmployees(employees.map((e: Employee) => e.id === emp.id ? { ...e, status: 'blocked' as const, blocked: true } : e)); addLog('Блокировка', 'Сотрудник ' + emp.id, emp.status, 'blocked'); }}
                        style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: 4 }} title="Заблокировать"><Icon d={icons.lock} size={14} /></button>
                    ) : (
                      <button onClick={() => { setEmployees(employees.map((e: Employee) => e.id === emp.id ? { ...e, status: 'active' as const, blocked: false } : e)); addLog('Разблокировка', 'Сотрудник ' + emp.id, 'blocked', 'active'); }}
                        style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: 4 }} title="Разблокировать"><Icon d={icons.unlock} size={14} /></button>
                    )}
                    <button onClick={() => { if (confirm('Удалить?')) { setEmployees(employees.filter((e: Employee) => e.id !== emp.id)); } }}
                      style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: 4 }} title="Удалить"><Icon d={icons.trash} size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NomenclaturePage({ nomenclature, setNomenclature, addLog }: any) {
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'medicine' as const, unit: 'ампулы', price: 0 });

  const filtered = nomenclature.filter((n: NomenclatureItem) => n.name.toLowerCase().includes(search.toLowerCase()));
  const catLabels: Record<string, string> = { medicine: 'Лекарство', equipment: 'Оборудование', consumable: 'Расходный материал' };
  const catColors: Record<string, any> = { medicine: { bg: '#dbeafe', color: '#1d4ed8' }, equipment: { bg: '#f3e8ff', color: '#7c3aed' }, consumable: { bg: '#dcfce7', color: '#15803d' } };

  const handlePriceChange = (id: string) => {
    const price = Number(newPrice);
    if (price > 0) {
      const item = nomenclature.find((n: NomenclatureItem) => n.id === id);
      setNomenclature(nomenclature.map((n: NomenclatureItem) => n.id === id ? { ...n, price, lastPriceChange: new Date().toISOString().split('T')[0] } : n));
      addLog('Изменение цены', 'Номенклатура ' + id, item?.price + ' ₽', price + ' ₽');
      setEditId(null); setNewPrice('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', gap: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, width: 250, outline: 'none' }} />
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Icon d={icons.plus} size={16} /> Добавить
        </button>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Новая позиция</h3>
            <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Название" style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 12, outline: 'none', boxSizing: 'border-box' as const }} />
            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value as any })} style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 12, outline: 'none', boxSizing: 'border-box' as const }}>
              <option value="medicine">Лекарство</option>
              <option value="equipment">Оборудование</option>
              <option value="consumable">Расходный материал</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="Ед. изм." style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
              <input type="number" value={newItem.price || ''} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} placeholder="Цена ₽" style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Отмена</button>
              <button onClick={() => { if (newItem.name) { setNomenclature([...nomenclature, { id: 'nom' + Date.now(), ...newItem, lastPriceChange: new Date().toISOString().split('T')[0] }]); setShowAdd(false); setNewItem({ name: '', category: 'medicine', unit: 'ампулы', price: 0 }); } }} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Название', 'Категория', 'Ед. изм.', 'Цена (₽)', 'Изменено', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item: NomenclatureItem) => (
              <tr key={item.id} style={{ borderTop: '1px solid #f9fafb' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1f2937' }}>{item.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500, background: catColors[item.category].bg, color: catColors[item.category].color }}>{catLabels[item.category]}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{item.unit}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' as const }}>
                  {editId === item.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} autoFocus style={{ width: 80, padding: '4px 8px', border: '1px solid #93c5fd', borderRadius: 4, fontSize: 12, textAlign: 'right' as const, outline: 'none' }} onKeyDown={e => e.key === 'Enter' && handlePriceChange(item.id)} />
                      <button onClick={() => handlePriceChange(item.id)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}><Icon d={icons.save} size={14} /></button>
                      <button onClick={() => setEditId(null)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><Icon d={icons.x} size={14} /></button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{item.price.toLocaleString('ru-RU')} ₽</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>{item.lastPriceChange}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => { setEditId(item.id); setNewPrice(String(item.price)); }} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><Icon d={icons.edit} size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IncomePage({ employees, setEmployees, addLog }: any) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const active = employees.filter((e: Employee) => e.status !== 'blocked');
  const total = active.reduce((s: number, e: Employee) => s + e.income, 0);

  const handleSave = (id: string) => {
    const val = Number(editVal);
    if (val >= 0) {
      setEmployees(employees.map((e: Employee) => e.id === id ? { ...e, income: val } : e));
      addLog('Начисление прихода', 'Сотрудник ' + id, '0 ₽', val.toLocaleString('ru-RU') + ' ₽');
      setEditId(null); setEditVal('');
    }
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>Общий приход за март 2024</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#14532d', marginTop: 4 }}>{total.toLocaleString('ru-RU')} ₽</div>
        <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>Распределено на {active.length} сотрудников</div>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>💡 Нажмите «Изменить» для установки суммы прихода. Изменения записываются в журнал.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Сотрудник', 'Статус', 'Смен', 'Приход (₽)', 'Действие'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map((emp: Employee) => (
              <tr key={emp.id} style={{ borderTop: '1px solid #f9fafb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #60a5fa, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                      {emp.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 12, color: '#1f2937' }}>{emp.fullName}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>№{emp.personalNumber}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500, background: emp.status === 'active' ? '#dcfce7' : '#fef9c3', color: emp.status === 'active' ? '#15803d' : '#a16207' }}>
                    {emp.status === 'active' ? 'Активен' : 'Отпуск'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{emp.shifts}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' as const }}>
                  {editId === emp.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus style={{ width: 110, padding: '4px 8px', border: '1px solid #93c5fd', borderRadius: 4, fontSize: 12, textAlign: 'right' as const, outline: 'none' }} onKeyDown={e => e.key === 'Enter' && handleSave(emp.id)} />
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>₽</span>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>{emp.income.toLocaleString('ru-RU')} ₽</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>
                  {editId === emp.id ? (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button onClick={() => handleSave(emp.id)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }}><Icon d={icons.save} size={14} /></button>
                      <button onClick={() => setEditId(null)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditId(emp.id); setEditVal(String(emp.income)); }} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Изменить</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RemnantsPage({ employees, nomenclature, remnants }: any) {
  const [view, setView] = useState<'emp' | 'nom'>('emp');
  const totalRub = remnants.reduce((s: number, r: EmployeeRemnant) => s + r.sumRub, 0);
  const totalQty = remnants.reduce((s: number, r: EmployeeRemnant) => s + r.quantity, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 500 }}>Общий остаток (₽)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', marginTop: 4 }}>{totalRub.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #fdf2f8)', border: '1px solid #e9d5ff', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 500 }}>Общий остаток (шт)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#3b0764', marginTop: 4 }}>{totalQty.toLocaleString('ru-RU')}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>Позиций номенклатуры</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#14532d', marginTop: 4 }}>{new Set(remnants.map((r: EmployeeRemnant) => r.nomenclatureId)).size}</div>
        </div>
      </div>

      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2, marginBottom: 16, width: 'fit-content' }}>
        <button onClick={() => setView('emp')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: view === 'emp' ? '#fff' : 'transparent', color: view === 'emp' ? '#1f2937' : '#6b7280', boxShadow: view === 'emp' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>По сотрудникам</button>
        <button onClick={() => setView('nom')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: view === 'nom' ? '#fff' : 'transparent', color: view === 'nom' ? '#1f2937' : '#6b7280', boxShadow: view === 'nom' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>По номенклатуре</button>
      </div>

      {view === 'emp' && employees.filter((e: Employee) => e.status !== 'blocked').map((emp: Employee) => {
        const empRem = remnants.filter((r: EmployeeRemnant) => r.employeeId === emp.id);
        if (empRem.length === 0) return null;
        const empTotal = empRem.reduce((s: number, r: EmployeeRemnant) => s + r.sumRub, 0);
        return (
          <div key={emp.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #f3f4f6', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #60a5fa, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                  {emp.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{emp.fullName}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>№{emp.personalNumber}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontWeight: 700, color: '#2563eb' }}>{empTotal.toLocaleString('ru-RU')} ₽</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>общий остаток</div>
              </div>
            </div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['Наименование', 'Ед.', 'Кол-во', 'Цена', 'Сумма'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: h === 'Наименование' ? 'left' as const : 'right' as const, color: '#6b7280', fontWeight: 500, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empRem.map((r: EmployeeRemnant) => {
                  const nom = nomenclature.find((n: NomenclatureItem) => n.id === r.nomenclatureId);
                  return (
                    <tr key={r.nomenclatureId} style={{ borderTop: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 16px', fontWeight: 500, color: '#374151' }}>{nom?.name}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' as const, color: '#6b7280' }}>{nom?.unit}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' as const, fontWeight: 500 }}>{r.quantity}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' as const, color: '#6b7280' }}>{nom?.price} ₽</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' as const, fontWeight: 500, color: '#374151' }}>{r.sumRub.toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {view === 'nom' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Номенклатура', 'Ед. изм.', 'Остаток (шт)', 'Цена', 'Сумма (₽)'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nomenclature.map((nom: NomenclatureItem) => {
                const items = remnants.filter((r: EmployeeRemnant) => r.nomenclatureId === nom.id);
                const totalQ = items.reduce((s: number, i: EmployeeRemnant) => s + i.quantity, 0);
                const totalS = items.reduce((s: number, i: EmployeeRemnant) => s + i.sumRub, 0);
                if (totalQ === 0) return null;
                return (
                  <tr key={nom.id} style={{ borderTop: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1f2937' }}>{nom.name}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{nom.unit}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, fontWeight: 500 }}>{totalQ}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#6b7280' }}>{nom.price} ₽</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, fontWeight: 600, color: '#2563eb' }}>{totalS.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpensesPage({ expenses, employees, nomenclature }: any) {
  const [search, setSearch] = useState('');
  const filtered = expenses.filter((e: ExpenseRecord) => {
    if (!search) return true;
    const emp = employees.find((em: Employee) => em.id === e.employeeId);
    const nom = nomenclature.find((n: NomenclatureItem) => n.id === e.nomenclatureId);
    return e.patientName.toLowerCase().includes(search.toLowerCase()) || emp?.fullName.toLowerCase().includes(search.toLowerCase()) || nom?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Записей расхода</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginTop: 4 }}>{filtered.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Общая сумма</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>{filtered.reduce((s: number, e: ExpenseRecord) => s + e.totalSum, 0).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Пациентов</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>{new Set(filtered.map((e: ExpenseRecord) => e.patientName)).size}</div>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по пациенту, сотруднику, препарату..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 16, outline: 'none', boxSizing: 'border-box' as const }} />

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Дата', 'Сотрудник', 'Пациент', 'Дата рожд.', 'Препарат', 'Кол-во', 'Цена', 'Сумма'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a: ExpenseRecord, b: ExpenseRecord) => b.date.localeCompare(a.date)).map((exp: ExpenseRecord) => {
                const emp = employees.find((e: Employee) => e.id === exp.employeeId);
                const nom = nomenclature.find((n: NomenclatureItem) => n.id === exp.nomenclatureId);
                return (
                  <tr key={exp.id} style={{ borderTop: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{exp.date}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 12, color: '#1f2937' }}>{emp?.fullName || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: 12 }}>{exp.patientName}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{exp.patientDob}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}><span style={{ fontWeight: 500, color: '#374151' }}>{nom?.name}</span> <span style={{ color: '#9ca3af', fontSize: 10 }}>({nom?.unit})</span></td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' as const, fontWeight: 500 }}>{exp.quantity}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#6b7280', fontSize: 12 }}>{exp.priceAtMoment}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, fontWeight: 600, color: '#dc2626' }}>{exp.totalSum} ₽</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReturnsPage({ returns, setReturns, employees, nomenclature, addLog }: any) {
  const statusLabels: Record<string, string> = { pending: 'Ожидает', approved: 'Подтверждён', adjusted: 'Скорректирован' };
  const statusColors: Record<string, any> = { pending: { bg: '#fef9c3', color: '#a16207' }, approved: { bg: '#dcfce7', color: '#15803d' }, adjusted: { bg: '#dbeafe', color: '#1d4ed8' } };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Всего возвратов</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{returns.length}</div>
        </div>
        <div style={{ background: '#fefce8', borderRadius: 12, border: '1px solid #fef08a', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#a16207' }}>Ожидают</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#854d0e', marginTop: 4 }}>{returns.filter((r: ReturnRecord) => r.status === 'pending').length}</div>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#15803d' }}>Подтверждено</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#14532d', marginTop: 4 }}>{returns.filter((r: ReturnRecord) => r.status === 'approved').length}</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Дата', 'Сотрудник', 'Номенклатура', 'Кол-во', 'Статус', 'Подтвердил', 'Действия'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returns.map((ret: ReturnRecord) => {
              const emp = employees.find((e: Employee) => e.id === ret.employeeId);
              const nom = nomenclature.find((n: NomenclatureItem) => n.id === ret.nomenclatureId);
              return (
                <tr key={ret.id} style={{ borderTop: '1px solid #f9fafb', background: ret.status === 'pending' ? '#fffbeb' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{ret.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 12 }}>{emp?.fullName || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontWeight: 500, fontSize: 12 }}>{nom?.name}</span> <span style={{ color: '#9ca3af', fontSize: 10 }}>({nom?.unit})</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' as const, fontWeight: 500 }}>
                    {ret.quantity}
                    {ret.adjustedQuantity && <span style={{ fontSize: 10, color: '#2563eb', marginLeft: 4 }}>(→ {ret.adjustedQuantity})</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500, background: statusColors[ret.status].bg, color: statusColors[ret.status].color }}>{statusLabels[ret.status]}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{ret.confirmedBy || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {ret.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setReturns(returns.map((r: ReturnRecord) => r.id === ret.id ? { ...r, status: 'approved' as const, confirmedBy: 'Руководитель' } : r)); addLog('Подтверждение возврата', 'Возврат ' + ret.id, 'pending', 'approved'); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: '#f0fdf4', color: '#15803d', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
                          <Icon d={icons.check} size={12} /> Подтвердить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChatPage({ messages, setMessages, employees }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');

  const conversations = employees.filter((e: Employee) => e.status !== 'blocked').map((emp: Employee) => {
    const msgs = messages.filter((m: Message) => (m.from === emp.id && m.to === 'manager') || (m.from === 'manager' && m.to === emp.id)).sort((a: Message, b: Message) => a.date.localeCompare(b.date));
    const unread = msgs.filter((m: Message) => !m.read && m.to === 'manager').length;
    return { employee: emp, messages: msgs, unread, lastMsg: msgs[msgs.length - 1] };
  }).filter((c: any) => c.messages.length > 0);

  const current = conversations.find((c: any) => c.employee.id === selected);

  const handleSend = () => {
    if (!newMsg.trim() || !selected) return;
    setMessages([...messages, { id: 'msg' + Date.now(), from: 'manager', fromRole: 'manager', to: selected, toRole: 'employee', text: newMsg.trim(), date: new Date().toLocaleString('ru-RU'), read: false }]);
    setNewMsg('');
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    setMessages(messages.map((m: Message) => m.from === id && m.to === 'manager' ? { ...m, read: true } : m));
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden', height: 'calc(100vh - 180px)', display: 'flex' }}>
      <div style={{ width: 300, borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>Диалоги</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' as const }}>
          {conversations.map((conv: any) => (
            <button key={conv.employee.id} onClick={() => handleSelect(conv.employee.id)}
              style={{ width: '100%', padding: 12, textAlign: 'left' as const, border: 'none', borderBottom: '1px solid #f9fafb', cursor: 'pointer', background: selected === conv.employee.id ? '#eff6ff' : 'transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #60a5fa, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {conv.employee.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{conv.employee.fullName}</span>
                  {conv.unread > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{conv.unread}</span>}
                </div>
                {conv.lastMsg && <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, marginTop: 2 }}>{conv.lastMsg.from === 'manager' ? 'Вы: ' : ''}{conv.lastMsg.text}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {current ? (
          <>
            <div style={{ padding: 16, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #60a5fa, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                {current.employee.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{current.employee.fullName}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>№{current.employee.personalNumber}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' as const, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {current.messages.map((msg: Message) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'manager' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: 12, background: msg.from === 'manager' ? '#2563eb' : '#f3f4f6', color: msg.from === 'manager' ? '#fff' : '#1f2937', fontSize: 13,
                    borderBottomRightRadius: msg.from === 'manager' ? 4 : 12, borderBottomLeftRadius: msg.from === 'manager' ? 12 : 4 }}>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: 9, marginTop: 4, opacity: 0.7 }}>{msg.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Введите сообщение..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
              <button onClick={handleSend} style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}><Icon d={icons.send} size={16} /></button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>Выберите диалог</div>
        )}
      </div>
    </div>
  );
}

function ReportsPage({ employees, expenses, nomenclature, remnants }: any) {
  const [reportType, setReportType] = useState('monthly');
  const active = employees.filter((e: Employee) => e.status !== 'blocked');
  const data = active.map((emp: Employee) => {
    const empExp = expenses.filter((e: ExpenseRecord) => e.employeeId === emp.id);
    const totalExp = empExp.reduce((s: number, e: ExpenseRecord) => s + e.totalSum, 0);
    const patients = new Set(empExp.map((e: ExpenseRecord) => e.patientName)).size;
    const rem = remnants.filter((r: EmployeeRemnant) => r.employeeId === emp.id).reduce((s: number, r: EmployeeRemnant) => s + r.sumRub, 0);
    return { ...emp, calls: empExp.length, patients, expenseRub: totalExp, remnantRub: rem, diff: emp.income - totalExp };
  });
  const totalIncome = data.reduce((s: number, r: any) => s + r.income, 0);
  const totalExpense = data.reduce((s: number, r: any) => s + r.expenseRub, 0);
  const totalRemnant = data.reduce((s: number, r: any) => s + r.remnantRub, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2 }}>
          {[{ id: 'monthly', label: 'Месячный' }, { id: 'employee', label: 'По сотрудникам' }, { id: 'nomenclature', label: 'По номенклатуре' }].map(t => (
            <button key={t.id} onClick={() => setReportType(t.id)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: reportType === t.id ? '#fff' : 'transparent', color: reportType === t.id ? '#1f2937' : '#6b7280' }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12 }}>📄 PDF</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>📊 Excel</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Отчёт за Март 2024</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Общий приход', value: totalIncome.toLocaleString('ru-RU') + ' ₽', bg: '#f0fdf4', color: '#15803d' },
            { label: 'Общий расход', value: totalExpense.toLocaleString('ru-RU') + ' ₽', bg: '#fef2f2', color: '#b91c1c' },
            { label: 'Остаток подразд.', value: totalRemnant.toLocaleString('ru-RU') + ' ₽', bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Всего пациентов', value: new Set(expenses.map((e: ExpenseRecord) => e.patientName)).size.toString(), bg: '#faf5ff', color: '#7c3aed' },
          ].map((c, i) => (
            <div key={i} style={{ background: c.bg, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, color: c.color, fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.color, marginTop: 4 }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {reportType === 'monthly' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['№', 'ФИО', 'Вызовов', 'Пациентов', 'Приход (₽)', 'Расход (₽)', 'Остаток (₽)'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={row.id} style={{ borderTop: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1f2937' }}>{row.fullName}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>{row.calls}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>{row.patients}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#16a34a', fontWeight: 500 }}>{row.income.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#dc2626', fontWeight: 500 }}>{row.expenseRub.toLocaleString('ru-RU')}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' as const, fontWeight: 700, color: row.diff >= 0 ? '#16a34a' : '#dc2626' }}>{row.diff >= 0 ? '+' : ''}{row.diff.toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
            <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
              <td style={{ padding: '12px 16px' }} colSpan={2}>ИТОГО</td>
              <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>{data.reduce((s: number, r: any) => s + r.calls, 0)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>{new Set(expenses.map((e: ExpenseRecord) => e.patientName)).size}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#15803d' }}>{totalIncome.toLocaleString('ru-RU')} ₽</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#b91c1c' }}>{totalExpense.toLocaleString('ru-RU')} ₽</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#1d4ed8' }}>{totalRemnant.toLocaleString('ru-RU')} ₽</td>
            </tr>
          </table>
        </div>
      )}

      {reportType === 'nomenclature' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Номенклатура', 'Ед. изм.', 'Расход (шт)', 'Сумма (₽)', 'Пациентов'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nomenclature.map((nom: NomenclatureItem) => {
                const nomExp = expenses.filter((e: ExpenseRecord) => e.nomenclatureId === nom.id);
                const totalQ = nomExp.reduce((s: number, e: ExpenseRecord) => s + e.quantity, 0);
                const totalS = nomExp.reduce((s: number, e: ExpenseRecord) => s + e.totalSum, 0);
                const pts = new Set(nomExp.map((e: ExpenseRecord) => e.patientName)).size;
                if (totalQ === 0) return null;
                return (
                  <tr key={nom.id} style={{ borderTop: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{nom.name}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{nom.unit}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, fontWeight: 500 }}>{totalQ}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' as const, color: '#dc2626', fontWeight: 500 }}>{totalS.toLocaleString('ru-RU')} ₽</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>{pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LogPage({ log }: any) {
  const [search, setSearch] = useState('');
  const filtered = log.filter((l: LogEntry) => !search || l.userName.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));

  const actionColors: Record<string, any> = {
    'Изменение цены': { bg: '#fef9c3', color: '#a16207' },
    'Добавление сотрудника': { bg: '#dcfce7', color: '#15803d' },
    'Блокировка': { bg: '#fee2e2', color: '#b91c1c' },
    'Разблокировка': { bg: '#dcfce7', color: '#15803d' },
    'Начисление прихода': { bg: '#dbeafe', color: '#1d4ed8' },
    'Подтверждение возврата': { bg: '#d1fae5', color: '#047857' },
    'Отправка сообщения': { bg: '#e0e7ff', color: '#4338ca' },
  };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Icon d={icons.scroll} size={20} className="" />
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 15, color: '#1f2937', margin: 0 }}>Журнал изменений</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Версионность данных: кто, когда, что изменил</p>
          </div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по журналу..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' as const }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Дата/Время', 'Кто', 'Роль', 'Действие', 'Объект', 'Было → Стало', 'Комментарий'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry: LogEntry) => (
              <tr key={entry.id} style={{ borderTop: '1px solid #f9fafb' }}>
                <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' as const }}>{entry.timestamp}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 12 }}>{entry.userName}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500,
                    background: entry.role === 'Руководитель' ? '#dbeafe' : '#ffedd5',
                    color: entry.role === 'Руководитель' ? '#1d4ed8' : '#c2410c' }}>{entry.role}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 500,
                    background: (actionColors[entry.action] || { bg: '#f3f4f6' }).bg,
                    color: (actionColors[entry.action] || { color: '#374151' }).color }}>{entry.action}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#4b5563', fontSize: 12 }}>{entry.objectType}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{entry.oldValue}</span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                    <span style={{ color: '#16a34a', fontWeight: 500 }}>{entry.newValue}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>{entry.comment || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
