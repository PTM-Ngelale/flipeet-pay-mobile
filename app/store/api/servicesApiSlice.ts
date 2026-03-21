import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';
import type { RootState } from '..';
import type {
  AirtimeInitializeRequest,
  AirtimeInitializeResponse,
  DataInitializeRequest,
  ElectricityInitializeRequest,
  ElectricityInitializeResponse,
  MeterVerificationResponse,
  ElectricityBranch,
} from '@/app/dashboard/types';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token ||
      (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery,
  tagTypes: ['Balances', 'ElectricityCompanies'],
  endpoints: (builder) => ({
    // Airtime
    initializeAirtime: builder.mutation<AirtimeInitializeResponse, AirtimeInitializeRequest>({
      query: (payload) => ({ url: '/commerce/airtime/initialize', method: 'POST', body: payload }),
      invalidatesTags: ['Balances'],
    }),

    // Data
    initializeData: builder.mutation<ElectricityInitializeResponse, DataInitializeRequest>({
      query: (payload) => ({ url: '/commerce/dataTv/initialize', method: 'POST', body: payload }),
      invalidatesTags: ['Balances'],
    }),

    // Electricity
    getElectricityCompanies: builder.query<ElectricityBranch[], void>({
      query: () => ({ url: '/commerce/electricity/companies', method: 'GET' }),
      transformResponse: (response: any) => response.data,
      providesTags: ['ElectricityCompanies'],
    }),

    verifyMeter: builder.mutation<MeterVerificationResponse, { electId: string; meterNumber: string }>({
      query: (payload) => ({ url: '/commerce/electricity/meter-verification', method: 'POST', body: payload }),
    }),

    initializeElectricity: builder.mutation<ElectricityInitializeResponse, ElectricityInitializeRequest>({
      query: (payload) => ({ url: '/commerce/electricity/initialize', method: 'POST', body: payload }),
      invalidatesTags: ['Balances'],
    }),
  }),
});

export const {
  useInitializeAirtimeMutation,
  useInitializeDataMutation,
  useGetElectricityCompaniesQuery,
  useVerifyMeterMutation,
  useInitializeElectricityMutation,
} = servicesApi;

export default servicesApi;
