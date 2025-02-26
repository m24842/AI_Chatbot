import {createSlice} from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: { id: null, token: null, username: null },
    reducers: {
        setCredentials: (state, action) => {
            const { accessToken, username, id, active} = action.payload
            state.token = accessToken ?? accessToken
            state.username = username ?? username
            state.id = id ?? id
            state.active = (active === true || active === false) ?? active
        },
        logOut: (state, action) => {
            state.token = null
            state.username = null
            state.id = null
            state.active = null
        },
    }
})

export const {setCredentials, logOut} = authSlice.actions

export default authSlice.reducer

export const selectCurrentToken = (state) => state.auth.token

export const selectCurrentId = (state) => state.auth.id

export const selectCurrentActive = (state) => state.auth.active