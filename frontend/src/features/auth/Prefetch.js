import { store } from '../../app/store'
import { conversationsApiSlice } from '../conversations/conversationsApiSlice'
import { usersApiSlice } from '../users/usersApiSlice'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const Prefetch = () => {
    useEffect(() => {
        console.log('subscribing')
        const conversations = store.dispatch(conversationsApiSlice.endpoints.getConversations.initiate({user: "all"}))
        const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
        const spotify = store.dispatch(conversationsApiSlice.endpoints.getState.initiate())

        return () => {
            console.log('unsubscribing')
            conversations.unsubscribe()
            users.unsubscribe()
            spotify.unsubscribe()
        }
    }, [])

    return <Outlet />
}

export default Prefetch