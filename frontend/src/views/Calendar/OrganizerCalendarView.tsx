import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { fetchBookings, createBooking } from '../../store/slices/calendarSlice';
import { calendarService } from '../../services/calendarService';
import { CalendarBooking, BookingFormData } from '../../types/calendar';
import { RootState, AppDispatch } from '../../store';

const OrganizerCalendarView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { bookings = [], loading, error } = useSelector((state: RootState) => state.calendar);
    const [selectedEvent, setSelectedEvent] = useState<CalendarBooking | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<BookingFormData>({
        startDate: '',
        endDate: '',
        title: '',
        description: '',
        venue: ''
    });

    // Add new state for available dates
    const [availableDates, setAvailableDates] = useState<{ [key: string]: boolean }>({});

    // Function to check availability for a date range
    const checkDateRangeAvailability = async (start: Date, end: Date) => {
        try {
            const response = await calendarService.checkAvailability(
                start.toISOString(),
                end.toISOString()
            );
            return response.isAvailable;
        } catch (error) {
            console.error('Error checking availability:', error);
            return false;
        }
    };

    // Function to update available dates
    const updateAvailableDates = async () => {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const dates: { [key: string]: boolean } = {};
        let currentDate = new Date(today);

        while (currentDate <= nextMonth) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const isAvailable = await checkDateRangeAvailability(currentDate, nextDay);
            dates[dateStr] = isAvailable;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        setAvailableDates(dates);
    };

    useEffect(() => {
        dispatch(fetchBookings());
        updateAvailableDates();
    }, [dispatch]);

    // Update available dates when bookings change
    useEffect(() => {
        updateAvailableDates();
    }, [bookings]);

    const handleEventClick = (eventInfo: any) => {
        const booking = bookings.find((e: CalendarBooking) => e._id === eventInfo.event.id);
        if (booking) {
            setSelectedEvent(booking);
            setIsEventDialogOpen(true);
        }
    };

    const handleDateSelect = async (selectInfo: any) => {
        const startDate = selectInfo.startStr;
        const endDate = selectInfo.endStr;
        
        try {
            // Check availability first
            const availability = await calendarService.checkAvailability(startDate, endDate);
            
            if (!availability.isAvailable) {
                if (availability.conflicts.length > 0) {
                    const conflict = availability.conflicts[0];
                    const conflictType = conflict.status === 'blocked' ? 'blocked date' : 'approved event';
                    alert(`Selected dates overlap with a ${conflictType}: "${conflict.title}". Please choose different dates.`);
                } else {
                    alert('These dates are not available. Please select different dates.');
                }
                return;
            }
            
            // If dates are available, open the request dialog
            setNewEvent({
                ...newEvent,
                startDate,
                endDate
            });
            setIsRequestDialogOpen(true);
        } catch (error) {
            console.error('Error checking availability:', error);
            alert('Error checking availability. Please try again later.');
        }
    };

    const handleCreateRequest = async () => {
        if (!newEvent.title) {
            alert('Please enter an event title');
            return;
        }

        try {
            await dispatch(createBooking(newEvent)).unwrap();
            setIsRequestDialogOpen(false);
            setNewEvent({
                startDate: '',
                endDate: '',
                title: '',
                description: '',
                venue: ''
            });
            dispatch(fetchBookings()); // Refresh the calendar
        } catch (error) {
            console.error('Error creating event request:', error);
            alert('Failed to create event request. Please try again.');
        }
    };

    const eventContent = (eventInfo: any) => {
        const booking = bookings.find((e: CalendarBooking) => e._id === eventInfo.event.id);
        return (
            <div style={{ 
                backgroundColor: getEventColor(booking?.status),
                padding: '2px 5px',
                borderRadius: '3px',
                color: '#fff'
            }}>
                <div>{eventInfo.event.title}</div>
                <small>{booking?.status?.toUpperCase()}</small>
            </div>
        );
    };

    const getEventColor = (status?: string) => {
        switch (status) {
            case 'approved': return '#4caf50';
            case 'pending': return '#ff9800';
            case 'rejected': return '#f44336';
            case 'blocked': return '#9e9e9e';
            default: return '#2196f3';
        }
    };

    // Custom day cell content
    const dayCellContent = (arg: any) => {
        const dateStr = arg.date.toISOString().split('T')[0];
        const isAvailable = availableDates[dateStr];

        return (
            <div style={{
                position: 'relative',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {isAvailable && (
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#4CAF50',
                        borderRadius: '50%'
                    }} />
                )}
                <span>{arg.dayNumberText}</span>
            </div>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2 }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={Array.isArray(bookings) ? bookings.map((event: CalendarBooking) => ({
                        id: event._id,
                        title: event.title,
                        start: event.startDate,
                        end: event.endDate,
                        backgroundColor: getEventColor(event.status),
                        borderColor: getEventColor(event.status)
                    })) : []}
                    eventContent={eventContent}
                    eventClick={handleEventClick}
                    selectable={true}
                    select={handleDateSelect}
                    height="auto"
                    dayCellContent={dayCellContent}
                    dayCellClassNames={(arg) => {
                        const dateStr = arg.date.toISOString().split('T')[0];
                        return availableDates[dateStr] ? 'available-date' : '';
                    }}
                />
            </Paper>

            <style>
                {`
                    .available-date {
                        background-color: rgba(76, 175, 80, 0.1) !important;
                    }
                    .available-date:hover {
                        background-color: rgba(76, 175, 80, 0.2) !important;
                    }
                    .fc-daygrid-day-number {
                        padding: 4px !important;
                    }
                `}
            </style>

            {/* Event Details Dialog */}
            <Dialog open={isEventDialogOpen} onClose={() => setIsEventDialogOpen(false)}>
                <DialogTitle>{selectedEvent?.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <p><strong>Description:</strong> {selectedEvent?.description}</p>
                        <p><strong>Venue:</strong> {selectedEvent?.venue}</p>
                        <p><strong>Status:</strong> {selectedEvent?.status}</p>
                        <p><strong>Created By:</strong> {selectedEvent?.createdBy.username}</p>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEventDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Event Request Dialog */}
            <Dialog open={isRequestDialogOpen} onClose={() => setIsRequestDialogOpen(false)}>
                <DialogTitle>Request Event Booking</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Event Title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        fullWidth
                        required
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        multiline
                        rows={4}
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Venue"
                        value={newEvent.venue}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, venue: e.target.value }))}
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleCreateRequest} 
                        color="primary"
                        disabled={!newEvent.title}
                    >
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizerCalendarView;
