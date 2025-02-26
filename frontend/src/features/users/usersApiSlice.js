import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({
    sortComparer: (a, b) => {
        if (a.active && !b.active) {
            return 1
        } else if (!a.active && b.active) {
            return -1
        } else {
            return 0
        }
    }
})

const initialState = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => '/users',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            transformResponse: responseData => {
                const loadedUsers = responseData.map(user => {
                    user.id = user._id
                    return user
                })
                return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'User', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'User', id }))
                    ]
                } else return [{ type: 'User', id: 'LIST' }]
            }
        }),
        addNewUser: builder.mutation({
            query: initialUserData => ({
                url: '/users',
                method: 'POST',
                body: {
                    ...initialUserData,
                }
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }]
        }),
        updateUser: builder.mutation({
            query: initialUserData => ({
                url: `/users`,
                method: 'PATCH',
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }]
        }),
        deleteUser: builder.mutation({
            query: ({sourceId, id}) => ({
                url: `/users`,
                method: 'DELETE',
                body: { sourceId, id }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }]
        }),
    }),
})

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApiSlice

export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data
)

export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)