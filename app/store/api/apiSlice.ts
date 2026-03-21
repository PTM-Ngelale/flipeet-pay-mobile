import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';
import type { RootState } from '..';

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

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Balances'],
  endpoints: (builder) => ({
    getBalances: builder.query<any, string>({
      query: (userId) => ({ url: `/user/${encodeURIComponent(userId)}/balances`, method: 'GET' }),
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Balances'],
    }),
  }),
});

export const { useGetBalancesQuery } = apiSlice;

export default apiSlice;
