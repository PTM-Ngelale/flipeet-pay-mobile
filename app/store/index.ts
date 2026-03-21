import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import bankAccountReducer from "./bankAccountSlice";
import transactionReducer from "./transactionSlice";
import { apiSlice } from "./api/apiSlice";
import servicesApi from "./api/servicesApiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bankAccount: bankAccountReducer,
    transaction: transactionReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, servicesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
