import {createSelector, createEntityAdapter} from "@reduxjs/toolkit"
import {apiSlice} from "../../app/api/apiSlice"
import { store } from "../../app/store"

const conversationsAdapter = createEntityAdapter({
    sortComparer: (a, b) => (a.updatedAt > b.updatedAt)? -1 : a.updatedAt < b.updatedAt? 1 : 0
})

const initialState = conversationsAdapter.getInitialState()

export const conversationsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getConversations: builder.query({
            query: ({user}) => `/conversations?user=${user}`,
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            transformResponse: responseData => {
                const loadedConversations = responseData.map(conversation => {
                    conversation.id = conversation._id
                    return conversation
                })
                return conversationsAdapter.setAll(initialState, loadedConversations)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        {type: 'Conversation', id: 'LIST'},
                        ...result.ids.map(id => ({type: 'Conversation', id}))
                    ]
                } else return [{type: 'Conversation', id: 'LIST'}]
            }
        }),
        addNewConversation: builder.mutation({
            query: initialConversationData => ({
                url: '/conversations',
                method: 'POST',
                body: {
                    ...initialConversationData,
                }
            }),
            invalidatesTags: [{ type: 'Conversation', id: 'LIST' }]
        }),
        updateConversation: builder.mutation({
            query: initialConversationData => ({
                url: `/conversations`,
                method: 'PATCH',
                body: {
                    ...initialConversationData
                }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Conversation', id: arg.id }]
        }),
        deleteConversation: builder.mutation({
            query: ({id}) => ({
                url: `/conversations`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Conversation', id: arg.id }]
        }),
    }),
})

export const {
    useGetConversationsQuery,
    useAddNewConversationMutation,
    useUpdateConversationMutation,
    useDeleteConversationMutation,
} = conversationsApiSlice

export const selectConversationsResult = conversationsApiSlice.endpoints.getConversations.select({user: "all"})

const selectConversationsData = createSelector(
    selectConversationsResult,
    conversationResult => conversationResult.data
)

export const {
    selectAll: selectAllConversations,
    selectById: selectConversationById,
    selectIds: selectConversationIds,
} = conversationsAdapter.getSelectors(state => selectConversationsData(state) ?? initialState)