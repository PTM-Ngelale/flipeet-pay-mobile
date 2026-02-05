import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import bankAccountReducer from "./bankAccountSlice";
import transactionReducer from "./transactionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bankAccount: bankAccountReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
