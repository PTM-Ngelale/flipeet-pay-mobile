import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import bankAccountReducer from "./bankAccountSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bankAccount: bankAccountReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
