import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppDispatch, RootState } from '../../store';
import { fetchBookings, updateBookingStatus, blockDates, clearError } from '../../store/slices/calendarSlice';
import { CalendarBooking } from '../../types/calendar';
import { MdOutlineEventNote, MdEvent } from 'react-icons/md';
import Button from "../../components/Button/Button";

const AdminCalendarView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { bookings = [], loading, error } = useSelector((state: RootState) => ({
        bookings: state.calendar.bookings || [],
        loading: state.calendar.loading,
        error: state.calendar.error
    }));

    const [selectedEvent, setSelectedEvent] = useState<CalendarBooking | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBlockingDialog, setIsBlockingDialog] = useState(false);
    const [blockingDates, setBlockingDates] = useState({ startDate: '', endDate: '', reason: '' });

    useEffect(() => {
        const loadBookings = async () => {
            try {
                await dispatch(fetchBookings());
            } catch (err) {
                console.error('Error fetching bookings:', err);
            }
        };
        loadBookings();
    }, [dispatch]);

    const handleEventClick = (eventInfo: any) => {
        const booking = bookings.find((e: CalendarBooking) => e._id === eventInfo.event.id);
        if (booking) {
            setSelectedEvent(booking);
            setIsDialogOpen(true);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (selectedEvent) {
            try {
                await dispatch(updateBookingStatus({ bookingId: selectedEvent._id, status })).unwrap();
                setIsDialogOpen(false);
                dispatch(fetchBookings());
            } catch (err) {
                console.error('Error updating status:', err);
            }
        }
    };

    const handleBlockDates = async () => {
        if (!blockingDates.startDate || !blockingDates.endDate || !blockingDates.reason) {
            alert('Please fill in all fields');
            return;
        }

        try {
            await dispatch(blockDates({
                startDate: blockingDates.startDate,
                endDate: blockingDates.endDate,
                description: blockingDates.reason
            })).unwrap();

            setIsBlockingDialog(false);
            setBlockingDates({ startDate: '', endDate: '', reason: '' });
            dispatch(fetchBookings()); // Refresh the calendar
        } catch (error) {
            console.error('Error blocking dates:', error);
            alert('Failed to block dates. Please try again.');
        }
    };

    const eventContent = (eventInfo: any) => {
        const booking = bookings.find((e: CalendarBooking) => e._id === eventInfo.event.id);
        return (
            <div className="p-1 text-sm">
                {booking?.status === 'blocked' ? (
                    <>
                        <div>Blocked Dates </div>
                        <small className="font-medium">{booking.description || 'No reason provided'}</small>
                    </>
                ) : (
                    <>
                        <div>{eventInfo.event.title}</div>
                        <small className="font-medium">{booking?.status?.toUpperCase()}</small>
                    </>
                )}
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
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center">
                    <MdOutlineEventNote className="mr-2" />
                    Calendar Management
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                    <button 
                        onClick={() => dispatch(clearError())}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <MdEvent className="text-blue-600 text-xl" />
                            </div>
                            <span className="font-medium">Calendar Events</span>
                        </div>
                        <Button
                            text="Block Dates"
                            onClick={() => setIsBlockingDialog(true)}
                            size="sm"
                        />
                    </div>
                    <div className="p-4">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={Array.isArray(bookings) ? bookings.map(event => ({
                                id: event._id,
                                title: event.title,
                                start: event.startDate,
                                end: event.endDate,
                                backgroundColor: getEventColor(event.status),
                                borderColor: getEventColor(event.status),
                                textColor: '#ffffff',
                                display: 'block'
                            })) : []}
                            eventContent={eventContent}
                            eventClick={handleEventClick}
                            height="auto"
                            eventDisplay="block"
                            eventBackgroundColor={getEventColor('approved')}
                            eventBorderColor={getEventColor('approved')}
                        />
                    </div>
                </div>
            )}

            {/* Rest of your modals... */}
            {isDialogOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <p><span className="font-medium">Description:</span> {selectedEvent.description}</p>
                            <p><span className="font-medium">Venue:</span> {selectedEvent.venue}</p>
                            <p><span className="font-medium">Status:</span> {selectedEvent.status}</p>
                            <p><span className="font-medium">Created By:</span> {selectedEvent.createdBy?.username}</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            {selectedEvent.status === 'pending' && (
                                <>
                                    <Button
                                        text="Approve"
                                        onClick={() => handleStatusUpdate('approved')}
                                        size="sm"
                                        color="primary"
                                    />
                                    <Button
                                        text="Reject"
                                        onClick={() => handleStatusUpdate('rejected')}
                                        size="sm"
                                        color="danger"
                                    />
                                </>
                            )}
                            <Button
                                text="Close"
                                onClick={() => setIsDialogOpen(false)}
                                size="sm"
                                color="secondary"
                            />
                        </div>
                    </div>
                </div>
            )}

            {isBlockingDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Block Dates</h3>
                            <button
                                onClick={() => setIsBlockingDialog(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={blockingDates.startDate}
                                    onChange={(e) => setBlockingDates(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={blockingDates.endDate}
                                    onChange={(e) => setBlockingDates(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason
                                </label>
                                <textarea
                                    value={blockingDates.reason}
                                    onChange={(e) => setBlockingDates(prev => ({ ...prev, reason: e.target.value }))}
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                text="Cancel"
                                onClick={() => setIsBlockingDialog(false)}
                                size="sm"
                                color="secondary"
                            />
                            <Button
                                text="Block"
                                onClick={handleBlockDates}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendarView;
