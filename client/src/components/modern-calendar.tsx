import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

interface ModernCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function ModernCalendar({ selectedDate, onDateChange, className = "" }: ModernCalendarProps) {
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      // Ensure the date is set to noon to avoid timezone issues
      const adjustedDate = new Date(value);
      adjustedDate.setHours(12, 0, 0, 0);
      onDateChange(adjustedDate);
    }
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    // Disable Sundays (day 0) and past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getDay() === 0 || date < today;
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const classes = [];
    
    // Highlight today
    const today = new Date();
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      classes.push('today');
    }
    
    // Highlight selected date
    if (format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      classes.push('selected');
    }
    
    // Style weekend days differently
    if (date.getDay() === 6) { // Saturday
      classes.push('saturday');
    }
    
    return classes.join(' ');
  };

  return (
    <Card className={`modern-calendar p-4 ${className}`}>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileDisabled={tileDisabled}
        tileClassName={tileClassName}
        minDate={new Date()}
        showNeighboringMonth={false}
        view="month"
        locale="en-US"
      />
    </Card>
  );
}