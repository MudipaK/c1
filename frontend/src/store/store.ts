import { configureStore } from "@reduxjs/toolkit";
import { userReducer, calendarReducer } from "./slices";

export const store = configureStore({
  reducer: {
    user: userReducer,
    calendar: calendarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable check (not recommended)
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
