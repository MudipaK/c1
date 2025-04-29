import axios, { AxiosError } from 'axios';
import { CalendarBooking, BookingFormData } from '../types/calendar';

const API_URL = 'http://localhost:5000/api/calendar';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
        if (error.response) {
            throw new Error(error.response.data?.message || 'Server error occurred');
        } else if (error.request) {
            throw new Error('No response from server. Please check if the server is running.');
        }
    }
    throw new Error(error instanceof Error ? error.message : 'An error occurred');
};

export const calendarService = {
    getAllBookings: async () => {
        try {
            const response = await axiosInstance.get<CalendarBooking[]>('/bookings');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            handleError(error);
            return [];
        }
    },

    createBooking: async (bookingData: BookingFormData) => {
        try {
            const response = await axiosInstance.post<CalendarBooking>('/bookings', {
                ...bookingData,
                status: 'pending'
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    checkAvailability: async (startDate: string, endDate: string) => {
        try {
            const response = await axiosInstance.get('/check-availability', {
                params: { startDate, endDate }
            });
            
            if (!response.data) {
                return {
                    isAvailable: false,
                    conflicts: [],
                    message: 'Invalid response from server'
                };
            }

            return {
                isAvailable: response.data.isAvailable === true,
                conflicts: Array.isArray(response.data.conflicts) ? response.data.conflicts : [],
                message: response.data.isAvailable 
                    ? 'These dates are available for booking'
                    : response.data.conflicts?.length > 0
                        ? `These dates are not available due to ${response.data.conflicts[0].status === 'blocked' ? 'a blocked date' : 'an approved event'}`
                        : 'These dates are not available for booking'
            };
        } catch (error) {
            console.error('Error checking availability:', error);
            if (error.response?.status === 401) {
                return {
                    isAvailable: false,
                    conflicts: [],
                    message: 'Please login to check availability'
                };
            }
            return {
                isAvailable: false,
                conflicts: [],
                message: 'Error checking availability. Please try again later.'
            };
        }
    },

    updateBookingStatus: async (bookingId: string, status: string) => {
        try {
            const response = await axiosInstance.put<CalendarBooking>(
                `/bookings/${bookingId}/status`,
                { status }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating booking status:', error);
            if (error.response?.status === 401) {
                throw new Error('Please login to update booking status');
            } else if (error.response?.status === 403) {
                throw new Error('Only staff admin can update booking status');
            } else if (error.response?.status === 404) {
                throw new Error('Booking not found');
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.request) {
                throw new Error('No response from server. Please check if the server is running.');
            } else {
                throw new Error('Failed to update booking status. Please try again later.');
            }
        }
    },

    blockDates: async (bookingData: BookingFormData) => {
        try {
            const response = await axiosInstance.post<CalendarBooking>('/block-dates', {
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                reason: bookingData.description || 'No reason provided'
            });
            return response.data;
        } catch (error: any) {
            console.error('Error blocking dates:', error);
            if (error.response?.status === 401) {
                throw new Error('Please login to block dates');
            } else if (error.response?.status === 403) {
                throw new Error('Only staff admin can block dates');
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Server error occurred while blocking dates');
            }
        }
    },

    deleteBooking: async (bookingId: string) => {
        try {
            const response = await axiosInstance.delete(`/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }
};
