import React from 'react';
import { useSelector } from 'react-redux';
import AdminCalendarView from './AdminCalendarView';
import OrganizerCalendarView from './OrganizerCalendarView';
import { RootState } from '../../store';

const Calendar = () => {
    const user = useSelector((state: RootState) => state.user.data);
    const isAdmin = user?.role === 'staff admin' || user?.role === 'staff advisor';

    return (
        <div className="p-4">
            {isAdmin ? <AdminCalendarView /> : <OrganizerCalendarView />}
        </div>
    );
};

export default Calendar;
