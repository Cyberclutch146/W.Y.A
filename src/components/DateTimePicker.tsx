import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value or use current date
  const initialDate = value ? new Date(value) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  
  const [hours, setHours] = useState(value ? initialDate.getHours().toString().padStart(2, '0') : '12');
  const [minutes, setMinutes] = useState(value ? initialDate.getMinutes().toString().padStart(2, '0') : '00');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day, parseInt(hours), parseInt(minutes));
    setSelectedDate(newDate);
    
    // Format to local ISO string (YYYY-MM-DDTHH:mm)
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const d = newDate.getDate().toString().padStart(2, '0');
    onChange(`${year}-${month}-${d}T${hours}:${minutes}`);
    
    // We don't automatically close so they can adjust time if needed
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    if (type === 'hours') setHours(val);
    if (type === 'minutes') setMinutes(val);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (type === 'hours') newDate.setHours(parseInt(val));
      if (type === 'minutes') newDate.setMinutes(parseInt(val));
      
      const year = newDate.getFullYear();
      const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
      const d = newDate.getDate().toString().padStart(2, '0');
      onChange(`${year}-${month}-${d}T${type === 'hours' ? val : hours}:${type === 'minutes' ? val : minutes}`);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper to format the display value
  const displayValue = selectedDate 
    ? selectedDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : '';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-base w-full text-left flex items-center justify-between"
      >
        <span style={{ color: displayValue ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
          {displayValue || 'Select Date & Time'}
        </span>
        <CalendarIcon className="w-4 h-4" style={{ color: 'var(--cp-text-3)' }} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 top-full left-0 mt-2 p-4 w-full sm:w-[320px] rounded-2xl"
          style={{
            background: 'var(--cp-surface)',
            border: '1px solid var(--cp-border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--cp-surface-dim)]"
              style={{ color: 'var(--cp-text-2)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button 
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--cp-surface-dim)]"
              style={{ color: 'var(--cp-text-2)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium py-1" style={{ color: 'var(--cp-text-3)' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className="w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all"
                  style={isSelected ? {
                    background: 'var(--cp-primary)',
                    color: 'white',
                    fontWeight: 700,
                  } : isToday ? {
                    background: 'hsl(from var(--cp-primary) h s l / 0.1)',
                    color: 'var(--cp-primary)',
                    fontWeight: 600,
                  } : {
                    color: 'var(--cp-text-1)',
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="h-px w-full mb-4" style={{ background: 'var(--cp-border)' }} />

          {/* Time Picker */}
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
          >
            <div className="flex items-center gap-2" style={{ color: 'var(--cp-text-2)' }}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex items-center gap-1">
              <select 
                value={hours}
                onChange={(e) => handleTimeChange('hours', e.target.value)}
                className="rounded-lg px-2 py-1 text-sm outline-none"
                style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-1)', border: '1px solid var(--cp-border)' }}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const val = i.toString().padStart(2, '0');
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <span className="font-bold" style={{ color: 'var(--cp-text-3)' }}>:</span>
              <select 
                value={minutes}
                onChange={(e) => handleTimeChange('minutes', e.target.value)}
                className="rounded-lg px-2 py-1 text-sm outline-none"
                style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-1)', border: '1px solid var(--cp-border)' }}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const val = (i * 5).toString().padStart(2, '0');
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
          </div>
          
          {selectedDate && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full mt-4 justify-center"
            >
              <Check size={16} />
              Confirm Date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
