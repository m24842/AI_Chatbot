import { Outlet, Link } from "react-router-dom"
import { useEffect, useRef, useState } from 'react'
import { useRefreshMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import { useSelector } from 'react-redux'
import { selectCurrentToken } from "./authSlice"
import { useNavigate } from "react-router-dom"

const PersistLogin = () => {
    const [persist] = usePersist()
    const token = useSelector(selectCurrentToken)
    const effectRan = useRef(false)

    const navigate = useNavigate()

    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        error
    }] = useRefreshMutation()


    useEffect(() => {

        if (effectRan.current === true || process.env.NODE_ENV !== 'development') {

            const verifyRefreshToken = async () => {
                console.log('verifying refresh token')
                try {
                    const response = await refresh()
                    // console.log(response.data)
                    setTrueSuccess(true)
                }
                catch (err) {
                    console.error(err)
                }
            }
            
            if (!token && persist) verifyRefreshToken()
            else if (!token)navigate('/login')
        }

        return () => effectRan.current = true

    }, [navigate, persist, refresh, token])


    let content
    if (!persist) {
        console.log('no persist')
        content = <Outlet />
    } else if (isLoading) {
        console.log('loading')
        content = <p>Loading...</p>
    } else if (isError) {
        console.log('error')
        content = (
            <p className='errmsg'>
                <Link to="/login" style={{color: 'white', textDecoration: 'none'}}>Please login again</Link>
            </p>
        )
    } else if (isSuccess && trueSuccess) {
        console.log('success')
        content = <Outlet />
    } else if (token && isUninitialized) {
        console.log('token and uninit')
        content = <Outlet />
    }

    return content
}
export default PersistLogin