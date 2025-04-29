import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calendarService } from '../../services/calendarService';
import { CalendarBooking, BookingFormData } from '../../types/calendar';

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
    async () => {
        const response = await calendarService.getAllBookings();
        return response;
    }
);

export const createBooking = createAsyncThunk(
    'calendar/createBooking',
    async (bookingData: BookingFormData) => {
        const response = await calendarService.createBooking(bookingData);
        return response;
    }
);

export const updateBookingStatus = createAsyncThunk(
    'calendar/updateStatus',
    async ({ bookingId, status }: { bookingId: string; status: string }) => {
        const response = await calendarService.updateBookingStatus(bookingId, status);
        return response;
    }
);

export const blockDates = createAsyncThunk(
    'calendar/blockDates',
    async (blockData: BookingFormData) => {
        const response = await calendarService.blockDates(blockData);
        return response;
    }
);

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
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
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch bookings';
            })
            // Create booking
            .addCase(createBooking.fulfilled, (state, action) => {
                state.bookings.push(action.payload);
            })
            // Update booking status
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                const index = state.bookings.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
            })
            // Block dates
            .addCase(blockDates.fulfilled, (state, action) => {
                state.bookings.push(action.payload);
            });
    }
});

export const { clearError } = calendarSlice.actions;
export default calendarSlice.reducer;
