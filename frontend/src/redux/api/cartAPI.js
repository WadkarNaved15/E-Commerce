import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cartAPI = createApi({
    reducerPath: "cartAPI",
    baseQuery: fetchBaseQuery({ 
        baseUrl: "http://localhost:4000/cart",
        credentials: 'include' // Include cookies in the request
    }),
    tagTypes: ["Cart"],
    endpoints: (builder) => ({
        getCart: builder.query({
            query: (id) => `/${id}`,
            providesTags: ["Cart"],
        }),
        addCart: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),
        updateCart: builder.mutation({
            query: ({ encryptedData }) => ({
                url: `/update`,
                method: "PUT",
                body: encryptedData,
            }),
            invalidatesTags: ["Cart"],
        }),
        deleteCart: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const { useGetCartQuery, useAddCartMutation, useUpdateCartMutation, useDeleteCartMutation } = cartAPI;
