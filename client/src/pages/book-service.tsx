import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isBefore, startOfDay, parseISO, isAfter } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { Calendar as CalendarIcon, Clock, MapPin, Phone, Mail, User, Wrench } from "lucide-react";
import { Service, InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TIMEZONE = "America/New_York"; // Eastern Time for Kissimmee, FL

// Store hours configuration
const STORE_HOURS = {
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "09:00", close: "15:00", closed: false },
  sunday: { open: "09:00", close: "17:00", closed: true }
};

const bookingFormSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Please enter a valid phone number"),
  bookingDate: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a time"),
});

type BookingForm = z.infer<typeof bookingFormSchema>;

interface TimeSlot {
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
  label: string; // "11:00 AM to 12:00 PM"
  available: boolean;
}

export default function BookService() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      bookingDate: "",
      startTime: "",
    },
  });

  // Fetch services
  const { data: services = [], isLoading: isServicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Fetch existing bookings for overlap checking - only for selected service and date
  const { data: existingBookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings", selectedDate ? format(selectedDate, "yyyy-MM-dd") : "", selectedService?.id || ""],
    enabled: !!selectedDate && !!selectedService,
    queryFn: async () => {
      const dateStr = format(selectedDate!, "yyyy-MM-dd");
      const response = await fetch(`/api/bookings?date=${dateStr}&service_id=${selectedService!.id}`);
      return response.json();
    },
  });

  // Helper to check if two time ranges overlap
  const timeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);
    
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  };

  // Generate available time slots based on store hours and existing bookings
  const generateTimeSlots = (date: Date, service: Service): TimeSlot[] => {
    const dayName = format(date, "EEEE").toLowerCase() as keyof typeof STORE_HOURS;
    const dayHours = STORE_HOURS[dayName];
    
    if (dayHours.closed) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const [openHour, openMinute] = dayHours.open.split(":").map(Number);
    const [closeHour, closeMinute] = dayHours.close.split(":").map(Number);
    
    // Check if this is today and get current time in Eastern timezone
    const now = new Date();
    const easternNow = toZonedTime(now, TIMEZONE);
    const isToday = format(date, "yyyy-MM-dd") === format(easternNow, "yyyy-MM-dd");
    
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    // If it's today, start from current time if later than opening
    if (isToday) {
      const currentEasternHour = easternNow.getHours();
      const currentEasternMinute = easternNow.getMinutes();
      
      if (currentEasternHour > openHour || (currentEasternHour === openHour && currentEasternMinute > openMinute)) {
        // Round up to next 30-minute interval
        currentHour = currentEasternHour;
        if (currentEasternMinute <= 30) {
          currentMinute = 30;
        } else {
          currentMinute = 0;
          currentHour++;
        }
      }
    }
    
    // Generate 30-minute slots
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const startTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      
      // Calculate end time based on service duration
      const totalEndMinutes = currentMinute + service.durationMinutes;
      const endHour = currentHour + Math.floor(totalEndMinutes / 60);
      const endMinute = totalEndMinutes % 60;
      const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      
      // Check if this slot would end before closing time
      const canFit = endHour < closeHour || (endHour === closeHour && endMinute <= closeMinute);
      
      if (canFit) {
        // Format start and end times for display
        const startDisplay = format(new Date(2023, 0, 1, currentHour, currentMinute), "h:mm a");
        const endDisplay = format(new Date(2023, 0, 1, endHour, endMinute), "h:mm a");
        const label = `${startDisplay} to ${endDisplay}`;
        
        // Check if this slot overlaps with any existing bookings (already filtered by service on backend)
        const isAvailable = !existingBookings.some((booking: any) => {
          if (!booking?.startTime || !booking?.endTime) return false;
          return timeRangesOverlap(startTimeStr, endTimeStr, booking.startTime, booking.endTime);
        });
        
        slots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          label,
          available: isAvailable,
        });
      }
      
      // Move to next 30-minute slot
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour++;
      }
    }
    
    return slots;
  };

  // Update available slots when date or service changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      const slots = generateTimeSlots(selectedDate, selectedService);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedService]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowBookingModal(false);
      form.reset();
      setSelectedService(null);
      setSelectedDate(undefined);
      toast({
        title: "Booking Confirmed!",
        description: "Your service appointment has been scheduled. We'll contact you if any changes are needed.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openBookingModal = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
    form.setValue("serviceId", service.id);
  };

  const onSubmit = (data: BookingForm) => {
    if (!selectedService) return;
    
    // Find the selected time slot to get both start and end times
    const selectedSlot = availableSlots.find(slot => slot.startTime === data.startTime);
    if (!selectedSlot) {
      toast({
        title: "Error",
        description: "Selected time slot is no longer available.",
        variant: "destructive",
      });
      return;
    }
    
    createBookingMutation.mutate({
      serviceId: data.serviceId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      bookingDate: data.bookingDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      timezone: TIMEZONE,
    });
  };

  // Helper to check if date should be disabled
  const isDateDisabled = (date: Date) => {
    const now = new Date();
    const easternNow = toZonedTime(now, TIMEZONE);
    const today = startOfDay(easternNow);
    
    // Disable past dates
    if (isBefore(date, today)) {
      return true;
    }
    
    // Disable Sundays (closed)
    const dayName = format(date, "EEEE").toLowerCase() as keyof typeof STORE_HOURS;
    return STORE_HOURS[dayName].closed;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="text-page-title">
              Book Service Appointment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Schedule professional service for your motorcycle with our expert technicians. 
              Select a service and choose your preferred time slot.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Available Services ({services.length})
            </h2>
          </div>
          
          {isServicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`card-service-${service.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-red-600 transition-colors">
                      {service.name}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(service.durationMinutes / 60)}h {service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}m` : ''}
                      </Badge>
                      <span className="text-lg font-semibold text-gray-900">
                        {service.priceLabel || (service.price ? `$${service.price}` : "Call for Price")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Button 
                      onClick={() => openBookingModal(service)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      data-testid={`button-book-${service.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Book {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                      <p className="text-sm text-gray-600">{selectedService.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {selectedService.priceLabel || (selectedService.price ? `$${selectedService.price}` : "Call for Price")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Duration: {Math.floor(selectedService.durationMinutes / 60)}h {selectedService.durationMinutes % 60 > 0 ? `${selectedService.durationMinutes % 60}m` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <FormField
                  control={form.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Date</FormLabel>
                      <div className="flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              field.onChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          disabled={isDateDisabled}
                          className="rounded-md border"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Selection */}
                {selectedDate && (
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose available time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSlots.map((slot) => (
                              <SelectItem
                                key={slot.startTime}
                                value={slot.startTime}
                                disabled={!slot.available}
                              >
                                <span className={slot.available ? "text-green-700" : "text-red-500 line-through"}>
                                  {slot.label} {!slot.available && "(Booked)"}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input {...field} placeholder="John Doe" className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input {...field} placeholder="(407) 555-0123" className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input {...field} placeholder="john@example.com" type="email" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {createBookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}