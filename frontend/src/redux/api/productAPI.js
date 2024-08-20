import { createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react'


export const productAPI = createApi({
    reducerPath: 'productAPI',
    baseQuery: fetchBaseQuery({baseUrl: `http://localhost:4000/products/`}),
    endpoints: (builder) => ({
        latestProducts: builder.query({
          query: () => `latest-products`,
        }),
        getProduct :builder.query({
            query : (id) => `page/${id}`
        }),
        category : builder.mutation({
            query : () => 'category',
            method : 'POST',
            body : (category) => category
        }),
        price : builder.mutation({
            query : () => 'price',
            method : 'POST',
            body : (maxPrice,minPrice) => ({maxPrice,minPrice})
        })
    })
})

export const {useLatestProductsQuery,useGetProductQuery,useCategoryMutation,usePriceMutation} = productAPI

