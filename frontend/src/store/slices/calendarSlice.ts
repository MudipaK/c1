import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calendarService } from '../../services/calendarService';
import { CalendarBooking, BookingFormData } from '../../types/calendar';
import { toast } from 'react-hot-toast';

interface CalendarState {
    bookings: CalendarBooking[];
    loading: boolean;
    error: string | null;
}

const initialState: CalendarState = {
    bookings: [],
    loading: false,
    error: null
};

export const fetchBookings = createAsyncThunk(
    'calendar/fetchBookings',
    async (_, { rejectWithValue }) => {
        try {
            const bookings = await calendarService.getAllBookings();
            return bookings;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createBooking = createAsyncThunk(
    'calendar/createBooking',
    async (bookingData: BookingFormData, { rejectWithValue }) => {
        try {
            const response = await calendarService.createBooking(bookingData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'calendar/updateStatus',
    async ({ bookingId, status }: { bookingId: string; status: string }, { rejectWithValue }) => {
        try {
            const response = await calendarService.updateBookingStatus(bookingId, status);
            return response || null;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const blockDates = createAsyncThunk(
    'calendar/blockDates',
    async (bookingData: BookingFormData, { rejectWithValue }) => {
        try {
            const response = await calendarService.blockDates(bookingData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to block dates');
        }
    }
);

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearBookings: (state) => {
            state.bookings = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch bookings
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.bookings = action.payload || [];
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch bookings';
                state.bookings = [];
            })
            // Create booking
            .addCase(createBooking.pending, (state) => {
                state.error = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                if (action.payload) {
                    state.bookings.push(action.payload);
                }
                state.error = null;
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create booking';
            })
            // Update booking status
            .addCase(updateBookingStatus.pending, (state) => {
                state.error = null;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = state.bookings.findIndex(b => b._id === action.payload?._id);
                    if (index !== -1) {
                        state.bookings[index] = action.payload;
                    }
                }
                state.error = null;
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to update booking status';
            })
            // Block dates
            .addCase(blockDates.pending, (state) => {
                state.error = null;
            })
            .addCase(blockDates.fulfilled, (state, action) => {
                if (action.payload) {
                    state.bookings.push(action.payload);
                }
                state.error = null;
            })
            .addCase(blockDates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string);
            });
    }
});

export const { clearError, clearBookings } = calendarSlice.actions;
export default calendarSlice.reducer;
