import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@rsd/state";
import { analyticsReducer } from "@rsd/state";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
