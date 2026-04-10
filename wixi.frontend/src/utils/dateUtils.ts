export const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // JavaScript Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  // We want to start from Monday (1), so we convert: Monday=0, Tuesday=1, ..., Sunday=6
  const startDay = firstDay.getDay();
  const mondayOffset = startDay === 0 ? 6 : startDay - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  
  // Add previous month's days to fill the first week starting from Monday
  for (let i = mondayOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Add current month's days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add next month's days to complete the last week ending on Sunday
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const getWeekDays = (date: Date): Date[] => {
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }

  return week;
};

export const getHours = (): number[] => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date: Date): string => {
  return date.toISOString();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getMonthName = (month: number): string => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return months[month];
};

export const getDayName = (day: number): string => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[day];
};

export const getShortDayName = (day: number): string => {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return days[day];
};

