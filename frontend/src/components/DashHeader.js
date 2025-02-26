import { Link } from 'react-router-dom'
import { useSelector } from "react-redux"
import { useState, useEffect, useRef } from 'react'
import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons"

const DashHeader = ({view, currentConversationId, setView, setCurrentConversationId, setEditingUserId}) => {
    const {id, username} = useSelector(state => state.auth)
    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date)
    const [showOptions, setShowOptions] = useState(false)
    const navigate = useNavigate()
    const [nameLength, setNameLength] = useState(username.length)
    const usernameRef = useRef()
    const optionsRef = useRef()

    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    const editUser = () => {
        localStorage.setItem('view', 'editUser')
        setView('editUser')
        localStorage.setItem('currentConversationId', '')
        setCurrentConversationId('')
        localStorage.setItem('editingUserId', id)
        setEditingUserId(id)
    }

    const onUsernameClicked = () => {
        setShowOptions(!showOptions)
        setNameLength(usernameRef.current.offsetWidth)
    }

    useEffect(() => {
        if (usernameRef.current) {
            setNameLength(usernameRef.current.offsetWidth)
        }
    }, [usernameRef])

    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }

        const clickedAwayFromOptions = (e) => {
            if (showOptions && optionsRef.current && !optionsRef.current.contains(e.target) && !usernameRef.current.contains(e.target)) {
                setShowOptions(false)
            }
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('click', clickedAwayFromOptions)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('click', clickedAwayFromOptions)
        }
    }, [showOptions])

    const resetPage = () => {
        localStorage.setItem('view', '')
        setView('')
        localStorage.setItem('currentConversationId', '')
        setCurrentConversationId('')
    }

    const onLogOutClicked = () => {
        sendLogout()
        localStorage.setItem('view', '')
        setView('')
        localStorage.setItem('currentConversationId', '')
        setCurrentConversationId('')
        setEditingUserId('')
        setShowOptions(false)
        navigate('/')
    }

    let options
    if (showOptions) {
        if (windowWidth <= 1000) {
            options = (
                <div style={{
                        position: 'absolute',
                        justifyContent: 'center',
                        width: '13rem',
                        top: '2.5rem',
                        right: '50%',
                        transform: 'translateX(50%)',
                        zIndex: '1',
                    }}>
                    <div ref={optionsRef}>
                        <button className="conversationButton-opaque"
                            onClick={() => {
                                editUser()
                                setShowOptions(false)
                            }}
                            style={{
                                textDecoration: 'none',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '5px',
                                marginRight: '0',
                            }}>
                            Profile
                            <FontAwesomeIcon icon={faUser}/>
                        </button>
                        <button className="conversationButton-opaque"
                            onClick={onLogOutClicked}
                            style={{
                                textDecoration: 'none',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                marginRight: '0',
                            }}>
                            Logout
                            <FontAwesomeIcon icon={faRightFromBracket}/>
                        </button>
                    </div>
                </div>
            )
        } else {
            options = (
                <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        position: 'relative',
                        zIndex: '1',
                    }}>
                    <div ref={optionsRef}
                        style={{
                            marginRight: '20px',
                        }}>
                        <button className="conversationButton-opaque"
                            onClick={() => {
                                editUser()
                                setShowOptions(false)
                            }}
                            style={{
                                textDecoration: 'none',
                                maxWidth: nameLength + 'px',
                                minWidth: '7rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '5px',
                                marginRight: '0',
                            }}>
                            Profile
                            <FontAwesomeIcon icon={faUser}/>
                        </button>
                        <button className="conversationButton-opaque"
                            onClick={onLogOutClicked}
                            style={{
                                textDecoration: 'none',
                                maxWidth: nameLength + 'px',
                                minWidth: '7rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                marginRight: '0',
                            }}>
                            Logout
                            <FontAwesomeIcon icon={faRightFromBracket}/>
                        </button>
                    </div>
                </div>
            )
        }
    }

    let userBlock
    if (windowWidth <= 1000) {
        if (showOptions) {
            userBlock = (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'right',
                        zIndex: '9999',
                    }}>
                    <h1 className='dash-header__title' style={{margin: '0', padding: '0'}}>
                        Hello <Link ref={usernameRef} onClick={onUsernameClicked} className='dash-header__title' style={{textDecoration: 'none', padding: '0'}}>{username}</Link> !
                    </h1>
                    {options}
                </div>
            )
        } else {
            userBlock = (
                <div style={{display: 'flex', flexDirection: 'column', textAlign: 'right'}}>
                    <h1 className='dash-header__title' style={{margin: '0', padding: '0'}}>
                        Hello <Link ref={usernameRef} onClick={onUsernameClicked} className='dash-header__title' style={{textDecoration: 'none', padding: '0'}}>{username}</Link> !
                    </h1>
                </div>
            )
        }
    } else {
        if (showOptions) {
            userBlock = (
                <div
                    style={{
                        position: 'absolute',
                        right: '0em',
                        top: '0em',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'right',
                        padding: '0.5em 1em',
                        zIndex: '9999',
                    }}>
                    <h1 className='dash-header__title' style={{margin: '0', padding: '0'}}>
                        Hello <Link ref={usernameRef} onClick={onUsernameClicked} className='dash-header__title' style={{textDecoration: 'none', padding: '0'}}>{username}</Link> !
                    </h1>
                    {options}
                </div>
            )
        } else {
            userBlock = (
                <div style={{display: 'flex', flexDirection: 'column', textAlign: 'right'}}>
                    <h1 className='dash-header__title' style={{margin: '0', padding: '0'}}>
                        Hello <Link ref={usernameRef} onClick={onUsernameClicked} className='dash-header__title' style={{textDecoration: 'none', padding: '0'}}>{username}</Link> !
                    </h1>
                </div>
            )
        }
    }

    let info
    if (windowWidth <= 1000) {
        info = (
            <div className="dash-header__container"
                style={{
                    flexDirection: 'column',
                }}>
                {userBlock}
            </div>
        )
    } else {
        info = (
            <div className="dash-header__container"
                style={{
                    marginTop: '0.5em',
                    display: 'flex',
                    alignItems: 'flex-start',
                }}>
                <div>
                    <Link to="/dash" onClick={resetPage} style={{textDecoration: 'none'}}>
                        <h1 className="dash-header__page-name" style={{margin: '0'}}>AI Chatbot</h1>
                    </Link>
                    <p className='welcome__p'>{today}</p>
                </div>
                {userBlock}
            </div>
        )
    }

    const content = (
        <header className="dash-header" style={{position: windowWidth <= 1000 ? "relative" : "sticky"}}>
            {info}
        </header>
    )

    return content
}
export default DashHeader