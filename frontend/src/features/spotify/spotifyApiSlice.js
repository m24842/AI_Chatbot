import {
  createSlice,
  createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const spotifyAdapter = createEntityAdapter()

const initialState = {
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
}

export const spotifySlice = createSlice({
    name: "spotify",
    initialState,
    reducers: {
      getStateStart(state) {
        state.isLoading = true
        state.error = null
      },
      getStateSuccess(state, action) {
        state.isLoading = false
        state.isSuccess = true
        state.data = action.payload
      },
      getStateFailure(state, action) {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.error = action.payload
      },
    },
})

export const { getStateStart, getStateSuccess, getStateFailure } = spotifySlice.actions

export const spotifyApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getState: builder.query({
            query: () => "/spotify",
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            transformResponse: responseData => {
                const loadedStates = responseData.map(state => {
                    state.id = state._id
                    return state
                })
                return spotifyAdapter.setAll(initialState, loadedStates)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        {type: 'Spotify', id: 'LIST'},
                        ...result.ids.map(id => ({type: 'Spotify', id}))
                    ]
                } else return [{type: 'Spotify', id: 'LIST'}]
            }
        }),
        createState: builder.mutation({
            query: (initialSpotifyState) => ({
                url: "/spotify",
                method: "POST",
                body: initialSpotifyState,
            }),
        }),
        updateState: builder.mutation({
            query: (initialSpotifyState) => ({
                url: "/spotify",
                method: "PATCH",
                body: initialSpotifyState,
            }),
        }),
    }),
})

export const {
    useGetStateQuery,
    useCreateStateMutation,
    useUpdateStateMutation,
} = spotifyApiSlice