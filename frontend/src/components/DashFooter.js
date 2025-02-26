import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse } from "@fortawesome/free-solid-svg-icons"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { useNavigate, useLocation } from 'react-router-dom'
import { useSendLogoutMutation } from '../features/auth/authApiSlice'

const DashFooter = () => {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const onGoHomeClicked = () => navigate(`/dash`)

    let goHomeButton
    // if (pathname !== `/dash`) {
    //     goHomeButton = (
    //         <button
    //             className="dash-footer__button icon-button"
    //             style={{left: '47%'}}
    //             title="Home"
    //             onClick={onGoHomeClicked}
    //         >
    //             <FontAwesomeIcon icon={faHouse} />
    //         </button>
    //     )
    // }

    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    const onLogOutClicked = () => {
        sendLogout()
        localStorage.setItem('view', '')
        navigate('/')
    }

    if (isLoading) return <p>Logging Out...</p>

    if (isError) return <p>Error: {error.data?.message}</p>

    let logoutButton
    // if (pathname !== '/dash') {
    //     logoutButton = (
    //         <button
    //             className="dash-footer__button icon-button"
    //             style={{left: '53%'}}
    //             title="Logout"
    //             onClick={onLogOutClicked}
    //         >
    //             <FontAwesomeIcon icon={faRightFromBracket} />
    //         </button>
    //     )
    // } else {
    //     logoutButton = (
    //         <button
    //             className="dash-footer__button icon-button"
    //             style={{left: '50%'}}
    //             title="Logout"
    //             onClick={onLogOutClicked}
    //         >
    //             <FontAwesomeIcon icon={faRightFromBracket} />
    //         </button>
    //     )
    // }

    const content = (
        <footer className="dash-footer">
            {/* {goHomeButton}
            {logoutButton} */}
        </footer>
    )
    return content
}
export default DashFooter