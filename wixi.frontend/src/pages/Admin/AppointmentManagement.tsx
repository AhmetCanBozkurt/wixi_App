import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { appointmentService, type IAppointmentDto, type ICreateAppointmentDto, type IUpdateAppointmentDto, type IHolidayDto } from '../../ApiServices/services/AppointmentService';
import { getDaysInMonth, getMonthName, getShortDayName, getDayName, getWeekDays, getHours, formatHour, isToday, isSameDay, formatDate, formatTime } from '../../utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type CalendarView = 'month' | 'week' | 'day';

const AppointmentManagement: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [appointments, setAppointments] = useState<IAppointmentDto[]>([]);
  const [holidays, setHolidays] = useState<IHolidayDto[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointmentDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to format date for datetime-local input (YYYY-MM-DDTHH:mm format)
  const formatForDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const [formData, setFormData] = useState<ICreateAppointmentDto & IUpdateAppointmentDto>({
    title: '',
    description: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    startTime: '',
    endTime: '',
    status: 'Pending',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadAppointments();
    loadHolidays();
  }, [currentDate, view]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let startDate: Date;
      let endDate: Date;

      if (view === 'month') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      } else if (view === 'week') {
        const weekDays = getWeekDays(currentDate);
        startDate = new Date(weekDays[0]);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(weekDays[6]);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // day view
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const data = await appointmentService.getAppointmentsByRange(startDate, endDate);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Randevular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadHolidays = async () => {
    try {
      // Load holidays for a wider range to cover recurring holidays
      const startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      const endDate = new Date(currentDate.getFullYear() + 1, 11, 31);
      const holidaysData = await appointmentService.getHolidays(startDate, endDate);
      setHolidays(holidaysData || []);
    } catch (error) {
      console.error('Error loading holidays:', error);
      // Don't show error toast for holidays, just log it
    }
  };

  const isHoliday = (date: Date): IHolidayDto | null => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => {
      const holidayDate = new Date(h.date);
      const holidayDateStr = holidayDate.toISOString().split('T')[0];
      if (holidayDateStr === dateStr) {
        return true;
      }
      // Check recurring holidays
      if (h.isRecurring) {
        const holidayMonth = holidayDate.getMonth();
        const holidayDay = holidayDate.getDate();
        const checkMonth = date.getMonth();
        const checkDay = date.getDate();
        return holidayMonth === checkMonth && holidayDay === checkDay;
      }
      return false;
    }) || null;
  };

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      // day view
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      // day view
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Open modal for new appointment
    if (!selectedAppointment) {
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(date);
      end.setHours(10, 0, 0, 0);

      setFormData({
        title: '',
        description: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        startTime: formatForDateTimeLocal(start),
        endTime: formatForDateTimeLocal(end),
        status: 'Pending',
        color: '#3B82F6',
      });
      setIsModalOpen(true);
    }
  };

  const handleAppointmentClick = (appointment: IAppointmentDto) => {
    setSelectedAppointment(appointment);
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);

    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone || '',
      clientEmail: appointment.clientEmail || '',
      startTime: formatForDateTimeLocal(startDate),
      endTime: formatForDateTimeLocal(endDate),
      status: appointment.status,
      color: appointment.color,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.title || !formData.clientName || !formData.startTime || !formData.endTime) {
        toast.error('Lütfen gerekli tüm alanları doldurun');
        return;
      }

      // Validate date/time - convert datetime-local to ISO string
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);

      // Validate that end time is after start time
      if (endDate <= startDate) {
        toast.error('Bitiş zamanı başlangıç zamanından sonra olmalıdır');
        return;
      }

      // Prepare data with ISO string dates
      const appointmentData: ICreateAppointmentDto = {
        title: formData.title,
        description: formData.description || undefined,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        clientName: formData.clientName,
        clientPhone: formData.clientPhone || undefined,
        clientEmail: formData.clientEmail || undefined,
        clientId: formData.clientId,
        status: formData.status || 'Pending',
        color: formData.color || '#3B82F6',
      };

      if (selectedAppointment) {
        // Update
        await appointmentService.updateAppointment(selectedAppointment.id, appointmentData);
        toast.success('Randevu güncellendi');
      } else {
        // Create
        await appointmentService.createAppointment(appointmentData);
        toast.success('Randevu oluşturuldu');
      }

      handleCloseModal();
      await loadAppointments();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast.error(error.message || 'Randevu kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;

    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return;

    try {
      await appointmentService.deleteAppointment(selectedAppointment.id);
      toast.success('Randevu silindi');
      handleCloseModal();
      await loadAppointments();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast.error(error.message || 'Randevu silinirken hata oluştu');
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, date);
    });
  };

  const getAppointmentsForDateAndHour = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      if (!isSameDay(aptStart, date)) return false;
      
      const aptStartHour = aptStart.getHours();
      const aptEndHour = aptEnd.getHours();
      const aptStartMinutes = aptStart.getHours() * 60 + aptStart.getMinutes();
      const aptEndMinutes = aptEnd.getHours() * 60 + aptEnd.getMinutes();
      const hourStartMinutes = hour * 60;
      const hourEndMinutes = (hour + 1) * 60;
      
      // Check if appointment overlaps with this hour
      return aptStartMinutes < hourEndMinutes && aptEndMinutes > hourStartMinutes;
    });
  };

  const getAppointmentPosition = (appointment: IAppointmentDto, date: Date) => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    if (!isSameDay(start, date)) return null;

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    return {
      top: (startMinutes / 60) * 60, // 60px per hour
      height: (duration / 60) * 60,
      startMinutes,
      endMinutes
    };
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    filter === 'all' ? true : apt.status.toLowerCase() === filter
  );

  const selectedDateAppointments = selectedDate 
    ? getAppointmentsForDate(selectedDate)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-0 m-0">
      <div className="grid grid-cols-5 gap-0 h-full min-h-0">
        {/* Calendar - 80% */}
        <div className="col-span-4 flex flex-col min-h-0">
          <Card className="flex flex-col h-full min-h-0 rounded-none border-0 border-r">
            <CardHeader className="flex-shrink-0 px-4 py-3 border-b">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-base font-semibold">
                  {view === 'month' && `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`}
                  {view === 'week' && (() => {
                    const weekDays = getWeekDays(currentDate);
                    const start = weekDays[0];
                    const end = weekDays[6];
                    return `${start.getDate()} ${getMonthName(start.getMonth())} - ${end.getDate()} ${getMonthName(end.getMonth())} ${end.getFullYear()}`;
                  })()}
                  {view === 'day' && `${getDayName(currentDate.getDay())}, ${currentDate.getDate()} ${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={goToToday}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Bugün
                  </Button>
                  <Button
                    onClick={goToPrevious}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={goToNext}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
                  <Button
                    key={v}
                    onClick={() => setView(v)}
                    variant={view === v ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-3"
                  >
                    {v === 'month' ? 'Ay' : v === 'week' ? 'Hafta' : 'Gün'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto min-h-0 p-4">
              {view === 'month' && (
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                      // day === 1 is Monday, day === 6 is Saturday, day === 0 is Sunday
                      // Calendar starts from Monday, so we display: Mon, Tue, Wed, Thu, Fri, Sat, Sun
                      const isWeekend = day === 0 || day === 6; // Sunday (0) or Saturday (6)
                      return (
                        <div 
                          key={day} 
                          className={`text-center text-sm font-semibold py-2 ${
                            isWeekend 
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {getShortDayName(day)}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      const dayAppointments = getAppointmentsForDate(day);
                      const isCurrentMonthDay = isCurrentMonth(day);
                      const isTodayDate = isToday(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday or Saturday
                      const holiday = isHoliday(day);

                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all relative ${
                            !isCurrentMonthDay 
                              ? 'bg-gray-50 dark:bg-gray-800 opacity-50' 
                              : holiday
                                ? 'bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                                : isWeekend 
                                  ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' 
                                  : 'bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800'
                          } ${
                            isTodayDate ? 'border-blue-500 border-2' : 'border-gray-200 dark:border-gray-700'
                          } ${
                            isSelected ? 'ring-2 ring-blue-400' : ''
                          }`}
                          title={holiday ? holiday.name : undefined}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className={`text-sm font-medium ${
                              isTodayDate 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : holiday 
                                  ? 'text-purple-800 dark:text-purple-200 font-semibold' 
                                  : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {day.getDate()}
                            </div>
                            {holiday && (
                              <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold" title={holiday.name}>
                                🎉
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAppointmentClick(apt);
                                }}
                                className={`text-xs p-1 rounded truncate text-white ${getStatusColor(apt.status)}`}
                                title={apt.title}
                              >
                                {apt.title}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                +{dayAppointments.length - 2} daha
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {view === 'week' && (
                <div className="flex flex-col h-full">
                  {/* Time column header */}
                  <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <div className="p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                      Saat
                    </div>
                    {getWeekDays(currentDate).map((day, index) => {
                      const isTodayDate = isToday(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday or Saturday
                      const holiday = isHoliday(day);
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`p-2 text-center text-xs font-semibold cursor-pointer transition-colors border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative ${
                            holiday
                              ? 'bg-purple-200 dark:bg-purple-900/50'
                              : isWeekend 
                                ? 'bg-gray-200 dark:bg-gray-700' 
                                : isTodayDate 
                                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                                  : ''
                          } ${
                            isTodayDate 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : holiday 
                                ? 'text-purple-800 dark:text-purple-200' 
                                : isWeekend 
                                  ? 'text-gray-700 dark:text-gray-300' 
                                  : 'text-gray-600 dark:text-gray-400'
                          } ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                          title={holiday ? holiday.name : undefined}
                        >
                          <div>{getShortDayName(day.getDay())}</div>
                          <div className={`text-lg font-bold ${
                            isTodayDate 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : holiday
                                ? 'text-purple-800 dark:text-purple-200'
                                : isWeekend 
                                  ? 'text-gray-800 dark:text-gray-200' 
                                  : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {day.getDate()}
                          </div>
                          {holiday && (
                            <div className="absolute top-1 right-1 text-xs text-purple-700 dark:text-purple-300" title={holiday.name}>
                              🎉
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Time grid */}
                  <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-8" style={{ minHeight: '1440px' }}>
                      {/* Time column */}
                      <div className="border-r border-gray-200 dark:border-gray-700">
                        {getHours().map((hour) => (
                          <div
                            key={hour}
                            className="h-16 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 p-2"
                          >
                            {formatHour(hour)}
                          </div>
                        ))}
                      </div>

                      {/* Day columns */}
                      {getWeekDays(currentDate).map((day, dayIndex) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday or Saturday
                        const holiday = isHoliday(day);
                        return (
                          <div 
                            key={dayIndex} 
                            className={`border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative ${
                              holiday 
                                ? 'bg-purple-100/60 dark:bg-purple-900/30' 
                                : isWeekend 
                                  ? 'bg-gray-50 dark:bg-gray-800/50' 
                                  : ''
                            }`}
                            title={holiday ? holiday.name : undefined}
                          >
                            {getHours().map((hour) => {
                            const hourAppointments = getAppointmentsForDateAndHour(day, hour);
                            // Get all appointments for this day (not just this hour) to position them correctly
                            const dayAppointments = getAppointmentsForDate(day);
                            
                            return (
                              <div
                                key={hour}
                                onClick={() => {
                                  const clickDate = new Date(day);
                                  clickDate.setHours(hour, 0, 0, 0);
                                  handleDateClick(clickDate);
                                }}
                                className={`h-16 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors relative ${
                                  holiday
                                    ? 'hover:bg-purple-200 dark:hover:bg-purple-900/40'
                                    : isWeekend 
                                      ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50' 
                                      : 'hover:bg-blue-50 dark:hover:bg-gray-800/50'
                                }`}
                              >
                                {dayAppointments.map((apt) => {
                                  const aptStart = new Date(apt.startTime);
                                  const aptEnd = new Date(apt.endTime);
                                  const aptStartMinutes = aptStart.getHours() * 60 + aptStart.getMinutes();
                                  const aptEndMinutes = aptEnd.getHours() * 60 + aptEnd.getMinutes();
                                  const hourStartMinutes = hour * 60;
                                  const hourEndMinutes = (hour + 1) * 60;
                                  
                                  // Only show if appointment starts in this hour or continues into it
                                  if (aptStartMinutes >= hourEndMinutes || aptEndMinutes <= hourStartMinutes) return null;
                                  
                                  const topOffset = Math.max(0, aptStartMinutes - hourStartMinutes);
                                  const bottomOffset = Math.min(hourEndMinutes - hourStartMinutes, aptEndMinutes - hourStartMinutes);
                                  const height = bottomOffset - topOffset;
                                  
                                  // Only render once per appointment (in the hour it starts)
                                  if (aptStartMinutes < hourStartMinutes) return null;
                                  
                                  return (
                                    <div
                                      key={apt.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAppointmentClick(apt);
                                      }}
                                      className="absolute left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-80 transition-opacity z-20 shadow-sm"
                                      style={{
                                        top: `${(topOffset / 60) * 100}%`,
                                        height: `${Math.max((height / 60) * 100, 25)}%`,
                                        backgroundColor: apt.color || '#3B82F6',
                                        minHeight: '20px'
                                      }}
                                      title={`${apt.title} - ${formatTime(aptStart)} - ${formatTime(aptEnd)}`}
                                    >
                                      <div className="font-semibold truncate">{apt.title}</div>
                                      {height >= 32 && (
                                        <div className="text-xs opacity-90 truncate">
                                          {formatTime(aptStart)} - {formatTime(aptEnd)}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                              })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {view === 'day' && (
                <div className="flex flex-col h-full">
                  {/* Day header */}
                  {(() => {
                    const holiday = isHoliday(currentDate);
                    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                    return (
                      <div className={`border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10 ${
                        holiday
                          ? 'bg-purple-200 dark:bg-purple-900/50'
                          : isWeekend 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : 'bg-white dark:bg-gray-900'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-lg font-semibold ${
                                holiday
                                  ? 'text-purple-800 dark:text-purple-200'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}>
                                {getDayName(currentDate.getDay())}, {currentDate.getDate()} {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                              </h3>
                              {holiday && (
                                <span className="text-sm text-purple-700 dark:text-purple-300 font-semibold" title={holiday.name}>
                                  🎉 {holiday.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getAppointmentsForDate(currentDate).length} randevu
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Time grid */}
                  <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-12" style={{ minHeight: '1440px' }}>
                      {/* Time column */}
                      <div className="col-span-2 border-r border-gray-200 dark:border-gray-700">
                        {getHours().map((hour) => (
                          <div
                            key={hour}
                            className="h-16 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 p-2"
                          >
                            {formatHour(hour)}
                          </div>
                        ))}
                      </div>

                      {/* Main content column */}
                      {(() => {
                        const holiday = isHoliday(currentDate);
                        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                        return (
                          <div className={`col-span-10 relative ${
                            holiday
                              ? 'bg-purple-100/40 dark:bg-purple-900/30'
                              : isWeekend 
                                ? 'bg-gray-50 dark:bg-gray-800/30' 
                                : ''
                          }`}>
                            {getHours().map((hour) => {
                              const dayAppointments = getAppointmentsForDate(currentDate);
                              
                              return (
                                <div
                                  key={hour}
                                  onClick={() => {
                                    const clickDate = new Date(currentDate);
                                    clickDate.setHours(hour, 0, 0, 0);
                                    handleDateClick(clickDate);
                                  }}
                                  className={`h-16 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors relative ${
                                    holiday
                                      ? 'hover:bg-purple-200 dark:hover:bg-purple-900/40'
                                      : isWeekend 
                                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50' 
                                        : 'hover:bg-blue-50 dark:hover:bg-gray-800/50'
                                  }`}
                                >
                              {dayAppointments.map((apt) => {
                                const aptStart = new Date(apt.startTime);
                                const aptEnd = new Date(apt.endTime);
                                const aptStartMinutes = aptStart.getHours() * 60 + aptStart.getMinutes();
                                const aptEndMinutes = aptEnd.getHours() * 60 + aptEnd.getMinutes();
                                const hourStartMinutes = hour * 60;
                                const hourEndMinutes = (hour + 1) * 60;
                                
                                // Only show if appointment overlaps with this hour
                                if (aptStartMinutes >= hourEndMinutes || aptEndMinutes <= hourStartMinutes) return null;
                                
                                const topOffset = Math.max(0, aptStartMinutes - hourStartMinutes);
                                const bottomOffset = Math.min(hourEndMinutes - hourStartMinutes, aptEndMinutes - hourStartMinutes);
                                const height = bottomOffset - topOffset;
                                
                                // Only render once per appointment (in the hour it starts)
                                if (aptStartMinutes < hourStartMinutes) return null;
                                
                                const appointmentHeight = Math.max((height / 60) * 64, 64); // 64px per hour
                                const showDetails = appointmentHeight >= 80;
                                
                                return (
                                  <div
                                    key={apt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAppointmentClick(apt);
                                    }}
                                    className="absolute left-2 right-2 rounded-lg p-2 text-sm text-white cursor-pointer hover:opacity-90 transition-opacity z-20 shadow-md"
                                    style={{
                                      top: `${(topOffset / 60) * 100}%`,
                                      height: `${(height / 60) * 100}%`,
                                      backgroundColor: apt.color || '#3B82F6',
                                      minHeight: '48px'
                                    }}
                                  >
                                    <div className="font-semibold mb-1 truncate">{apt.title}</div>
                                    {showDetails && (
                                      <>
                                        <div className="text-xs opacity-90 mb-1">
                                          {formatTime(aptStart)} - {formatTime(aptEnd)}
                                        </div>
                                        {apt.clientName && (
                                          <div className="text-xs opacity-90 flex items-center gap-1 mb-1">
                                            <User className="w-3 h-3" />
                                            {apt.clientName}
                                          </div>
                                        )}
                                        {apt.description && (
                                          <div className="text-xs opacity-80 line-clamp-1">{apt.description}</div>
                                        )}
                                        <Badge className={`mt-1 ${getStatusBadgeColor(apt.status)} text-xs`}>
                                          {getStatusLabel(apt.status)}
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointment List - 20% */}
        <div className="col-span-1 flex flex-col min-h-0">
          <Card className="flex flex-col h-full min-h-0 rounded-none border-0">
            <CardHeader className="flex-shrink-0 px-3 py-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold">Randevular</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setSelectedDate(null);
                    const selectedDateForAppointment = selectedDate || new Date();
                    const start = new Date(selectedDateForAppointment);
                    start.setHours(9, 0, 0, 0);
                    const end = new Date(selectedDateForAppointment);
                    end.setHours(10, 0, 0, 0);

                    setFormData({
                      title: '',
                      description: '',
                      clientName: '',
                      clientPhone: '',
                      clientEmail: '',
                      startTime: formatForDateTimeLocal(start),
                      endTime: formatForDateTimeLocal(end),
                      status: 'Pending',
                      color: '#3B82F6',
                    });
                    setIsModalOpen(true);
                  }}
                  size="sm"
                  className="h-7 text-xs px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Yeni
                </Button>
              </div>

              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="confirmed">Onaylandı</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>

              {selectedDate && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {selectedDate.toLocaleDateString('tr-TR')}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-auto min-h-0 p-2">
              {selectedDate ? (
                selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Bu tarihte randevu yok
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        style={{ borderLeftWidth: '4px', borderLeftColor: appointment.color }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{appointment.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(new Date(appointment.startTime))} - {formatTime(new Date(appointment.endTime))}
                            </div>
                          </div>
                          <Badge className={getStatusBadgeColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>

                        {appointment.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{appointment.description}</p>
                        )}

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {appointment.clientName}
                          </div>
                          {appointment.clientPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {appointment.clientPhone}
                            </div>
                          )}
                          {appointment.clientEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {appointment.clientEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {filter === 'all' ? 'Randevu bulunamadı' : `${getStatusLabel(filter)} randevu yok`}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        style={{ borderLeftWidth: '4px', borderLeftColor: appointment.color }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{appointment.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <CalendarIcon className="w-4 h-4" />
                              {new Date(appointment.startTime).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(new Date(appointment.startTime))} - {formatTime(new Date(appointment.endTime))}
                            </div>
                          </div>
                          <Badge className={getStatusBadgeColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {appointment.clientName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Randevuyu Düzenle' : 'Yeni Randevu'}
            </DialogTitle>
            <DialogDescription>
              Randevu bilgilerini girin veya düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Randevu Başlığı *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Diş Muayenesi"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Randevu detayları..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Müşteri Adı *</Label>
                <Input
                  id="clientName"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Telefon</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Başlangıç Zamanı *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endTime">Bitiş Zamanı *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Beklemede</SelectItem>
                    <SelectItem value="Confirmed">Onaylandı</SelectItem>
                    <SelectItem value="Completed">Tamamlandı</SelectItem>
                    <SelectItem value="Cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Renk</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            {selectedAppointment && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={saving}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentManagement;

