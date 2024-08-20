import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoriesAPI = createApi({
    reducerPath: 'categoriesAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/category/' }),
    endpoints: (builder) => ({
        priceCategories: builder.query({
            query: () => 'price',
        }),
        simpleCategories: builder.query({
            query: () => 'simple',
        }),     
    }),
});

export const { usePriceCategoriesQuery, useSimpleCategoriesQuery } = categoriesAPI;
