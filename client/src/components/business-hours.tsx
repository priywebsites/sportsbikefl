import { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusinessHours {
  [key: string]: { open: string; close: string } | null;
}

const businessHours: BusinessHours = {
  sunday: null, // Closed
  monday: { open: "09:00", close: "17:00" },
  tuesday: { open: "09:00", close: "17:00" },
  wednesday: { open: "09:00", close: "17:00" },
  thursday: { open: "09:00", close: "17:00" },
  friday: { open: "09:00", close: "17:00" },
  saturday: { open: "09:00", close: "15:00" }
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function BusinessHours() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // Convert to Orlando/Eastern timezone (EST/EDT)
      const now = new Date();
      const orlandoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      setCurrentTime(orlandoTime);

      // Check if currently open
      const currentDay = dayNames[orlandoTime.getDay()].toLowerCase();
      const todayHours = businessHours[currentDay];
      
      if (!todayHours) {
        setIsOpen(false);
      } else {
        const currentTimeStr = orlandoTime.toTimeString().slice(0, 5);
        const isCurrentlyOpen = currentTimeStr >= todayHours.open && currentTimeStr <= todayHours.close;
        setIsOpen(isCurrentlyOpen);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentDayName = () => {
    return dayNames[currentTime.getDay()];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-red-600" />
            Store Hours
          </div>
          <Badge 
            className={`${isOpen 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
            } font-semibold flex items-center gap-2`}
            data-testid="status-badge"
          >
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            Current time: {currentTime.toLocaleString("en-US", { 
              timeZone: "America/New_York",
              weekday: 'long',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })} (Orlando, FL)
          </div>
          
          {Object.entries(businessHours).map(([day, hours]) => {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            const isToday = dayName === getCurrentDayName();
            
            return (
              <div 
                key={day} 
                className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                  isToday ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                }`}
                data-testid={`hours-${day}`}
              >
                <span className={`font-medium ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
                  {dayName}
                  {isToday && <span className="ml-2 text-xs text-green-600">(Today)</span>}
                </span>
                <span className={`text-sm ${isToday ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {hours ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : 'Closed'}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 text-red-600 mt-1" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">Visit Our Store</div>
              <div className="text-gray-600">
                2215 Clay St<br />
                Kissimmee, FL 34741
              </div>
              <a 
                href="https://www.google.com/maps/place/Sportbike+Parts+%26+Export/@28.2798018,-81.429789,17z/data=!3m1!4b1!4m6!3m5!1s0x88dd847617b2b255:0x93caaf6aa9fbbf9b!8m2!3d28.2798018!4d-81.4272087!16s%2Fg%2F12lkd4ybj?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 font-medium"
                data-testid="link-google-maps"
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}