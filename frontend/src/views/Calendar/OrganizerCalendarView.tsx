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
    const events = useSelector((state: RootState) => state.calendar.bookings);
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

    useEffect(() => {
        dispatch(fetchBookings());
    }, [dispatch]);

    const handleEventClick = (eventInfo: any) => {
        const booking = events.find((e: CalendarBooking) => e._id === eventInfo.event.id);
        if (booking) {
            setSelectedEvent(booking);
            setIsEventDialogOpen(true);
        }
    };

    const handleDateSelect = async (selectInfo: any) => {
        const startDate = selectInfo.startStr;
        const endDate = selectInfo.endStr;
        
        try {
            const { isAvailable } = await calendarService.checkAvailability(startDate, endDate);
            if (!isAvailable) {
                alert('Selected dates are not available. Please choose different dates.');
                return;
            }
            
            setNewEvent({
                ...newEvent,
                startDate,
                endDate
            });
            setIsRequestDialogOpen(true);
        } catch (error) {
            console.error('Error checking availability:', error);
        }
    };

    const handleCreateRequest = async () => {
        try {
            await dispatch(createBooking(newEvent));
            setIsRequestDialogOpen(false);
            setNewEvent({
                startDate: '',
                endDate: '',
                title: '',
                description: '',
                venue: ''
            });
        } catch (error) {
            console.error('Error creating event request:', error);
        }
    };

    const eventContent = (eventInfo: any) => {
        const booking = events.find((e: CalendarBooking) => e._id === eventInfo.event.id);
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
                    events={Array.isArray(events) ? events.map((event: CalendarBooking) => ({
                        id: event._id,
                        title: event.title,
                        start: event.startDate,
                        end: event.endDate,
                    })) : []}
                    eventContent={eventContent}
                    eventClick={handleEventClick}
                    selectable={true}
                    select={handleDateSelect}
                    height="auto"
                />
            </Paper>

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
                    <Button onClick={handleCreateRequest} color="primary">Submit Request</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizerCalendarView;
