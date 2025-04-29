import axios from 'axios';
import { CalendarBooking, BookingFormData } from '../types/calendar';

const API_URL = '/api/calendar';

export const calendarService = {
    getAllBookings: async () => {
        const response = await axios.get<CalendarBooking[]>(`${API_URL}/bookings`);
        return response.data;
    },

    createBooking: async (bookingData: BookingFormData) => {
        const response = await axios.post<CalendarBooking>(`${API_URL}/bookings`, bookingData);
        return response.data;
    },

    checkAvailability: async (startDate: string, endDate: string) => {
        const response = await axios.get(`${API_URL}/check-availability`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    updateBookingStatus: async (bookingId: string, status: string) => {
        const response = await axios.put<CalendarBooking>(
            `${API_URL}/bookings/${bookingId}/status`,
            { status }
        );
        return response.data;
    },

    blockDates: async (bookingData: BookingFormData) => {
        const response = await axios.post<CalendarBooking>(`${API_URL}/block-dates`, bookingData);
        return response.data;
    },

    deleteBooking: async (bookingId: string) => {
        const response = await axios.delete(`${API_URL}/bookings/${bookingId}`);
        return response.data;
    }
};
