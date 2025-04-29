export interface CalendarBooking {
    _id: string;
    startDate: string;
    endDate: string;
    title: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    venue?: string;
    createdBy: {
        _id: string;
        username: string;
        email: string;
    };
    isBlocked: boolean;
    lastModifiedBy?: {
        _id: string;
        username: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface BookingFormData {
    startDate: string;
    endDate: string;
    title: string;
    description?: string;
    venue?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'blocked';
    isBlocked?: boolean;
}
