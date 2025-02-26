import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faUsers, faUserPlus, faPlus, faCircleXmark, faCaretLeft, faCaretRight, faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from 'react-redux'
import { selectUserById } from '../users/usersApiSlice'
import { ROLES } from '../../config/roles'
import UsersList from '../users/UsersList'
import NewUserForm from '../users/NewUserForm'
import EditUser from '../users/EditUser'
import ConversationsList from '../conversations/ConversationsList'
import NewConversation from '../conversations/NewConversation'
import ConversationView from '../conversations/ConversationView'
import { useState, useEffect, useRef } from 'react'
import SpotifyInterface from '../spotify/SpotifyInterface'
import { useSwipeable } from 'react-swipeable'
import useIntersectionObserver from '../conversations/IntersectionObserver'

const Welcome = ({view, currentConversationId, editingUserId, setView, setCurrentConversationId, setEditingUserId}) => {
    const id = useSelector(state => state.auth.id)
    const loggedInUser = useSelector((state) => selectUserById(state, id))
    const isAdmin = loggedInUser?.role === ROLES.ADMIN
    const [showNewConversation, setShowNewConversation] = useState(false)
    const newConversationRef = useRef(null)
    const sideBarRef = useRef(null)
    const [showSideBar, setShowSideBar] = useState(true)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0)
    const [usingVolumeSlider, setUsingVolumeSlider] = useState(false)
    const selfRef = useRef(null)
    const entries = useIntersectionObserver({
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    })
    const entry = entries.find(entry => entry.target === selfRef.current)
    const visibilityRatio = entry ? entry.intersectionRatio : 0
    const scale = 0.7 + 0.3 * visibilityRatio
    const opacity = visibilityRatio

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        setView(localStorage.getItem('view') || '')
        setCurrentConversationId(localStorage.getItem('currentConversationId') || '')
    }, [])

    useEffect(() => {
        localStorage.setItem('view', view)
    }, [view])

    const openUserProfile = () => {
        if (isAdmin) {
            if (view === 'usersList') {
                setView('')
                setEditingUserId('')
                setCurrentConversationId('')
            } else {
                setView('usersList')
                setEditingUserId('')
                setCurrentConversationId('')
            }
        } else if (!isAdmin && view === 'editUser') {
            setView('')
            setEditingUserId('')
            setCurrentConversationId('')
        } else {
            setView(isAdmin ? 'usersList' : 'editUser')
            setEditingUserId(!isAdmin ? id: '')
            setCurrentConversationId('')
        }
    }

    const openNewUserForm = () => {
        if (view === 'newUserForm') {
            setView('')
            setCurrentConversationId('')
        } else {
            setView('newUserForm')
            setCurrentConversationId('')
        }
    }

    const openNewConversationForm = () => {
        setShowNewConversation(!showNewConversation)
    }

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setShowNewConversation(false)
            }
        }

        const handleClickAwayFromAddConversationButton = (e) => {
            const addConversationButton = document.querySelector('.addConversationButton')
            if (newConversationRef.current && !newConversationRef.current.contains(e.target)) {
                if (!addConversationButton || !addConversationButton.contains(e.target)) {
                    setShowNewConversation(false)
                }
            }
        }

        window.addEventListener('keydown', handleEscapeKey)
        window.addEventListener('click', handleClickAwayFromAddConversationButton)

        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
            window.removeEventListener('click', handleClickAwayFromAddConversationButton)
        }
    }, [])

    let defaultContent
    if (view === "") {
        if (windowWidth <= 500) {
            defaultContent = (
                <div className='welcome__default_box'>
                    <p className='welcome__default'>
                        AI
                    </p>
                    <p className='welcome__default'>
                        Chatbot
                    </p>
                </div>
            )
        } else if (windowWidth <= 1400) {
            defaultContent = (
                <div className='welcome__default_box'>
                    <p className='welcome__default'>
                        Welcome to
                    </p>
                    <p className='welcome__default'>
                        AI Chatbot!
                    </p>
                </div>
            )
        } else {
            defaultContent = (
                <div className='welcome__default_box'>
                    <p className='welcome__default'>
                        Welcome to AI Chatbot!
                    </p>
                    <p className='welcome__default'>
                        Your personal assistant for
                    </p>
                    <p className='welcome__default'>
                        EVERYTHING
                    </p>
                </div>
            )
        }
    }

    let spotifyInterface
    if (isAdmin) {
        spotifyInterface = (
            <div style={{maxWidth: '13rem', marginBottom: '10px', zIndex: '999'}}>
                <SpotifyInterface usingVolumeSlider={usingVolumeSlider} setUsingVolumeSlider={setUsingVolumeSlider}/>
            </div>
        )
    }

    let profileButtons
    if (isAdmin) {
        profileButtons = (
            <div style={{
                display: 'flex',
                flexDirection: windowWidth <= 1000 ? 'column' : 'row',
                gap: windowWidth <= 1000 ? '5px' : '1px',
                maxWidth: '13rem',
            }}>
                <button
                    className='home_button'
                    title="View All Users"
                    style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        marginRight: '0.5em',
                        fontSize: '16px',
                    }}
                    onClick={openUserProfile}
                >
                    <FontAwesomeIcon icon={faUsers} />
                </button>
                <button
                    className='home_button'
                    title="Register New User"
                    style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        fontSize: '16px',
                    }}
                    onClick={openNewUserForm}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
        )
    } else {
        profileButtons = (
            <>
                <button
                    className='home_button'
                    title="View User Profile"
                    style={{ width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        fontSize: '16px',
                    }}
                    onClick={openUserProfile}
                >
                    <FontAwesomeIcon icon={faUser} />
                </button>
            </>
        )
    }

    let addConversation
    if (showNewConversation) {
        addConversation = <FontAwesomeIcon icon={faCircleXmark} />
    } else {
        addConversation = <FontAwesomeIcon icon={faPlus} />
    }

    let newConversation
    if (showNewConversation) {
        newConversation = (
            <div ref={newConversationRef}>
                <NewConversation setView={setView} setCurrentConversationId={setCurrentConversationId} setShowNewConversation={setShowNewConversation}/>
            </div>
        )
    }

    // Mobile swipeable side bar components
    const musicControls = (
        <div style={{ zIndex: '999', marginTop: '6px'}}>
            {spotifyInterface}
        </div>
    )

    const generalControls = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '6px',
        }}>
            <div style={{display: 'block', marginBottom: '5px', maxWidth: '13rem', width: '13rem'}}>
                {profileButtons}
            </div>
        </div>
    )

    const conversations = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: '1',
                justifyContent: 'flex-start',
                overflowX: 'visible',
                overflowY: 'scroll',
                margin: '0px -30px',
                padding: '6px 30px',
                borderRadius: '10px',
                scrollbarWidth: 'none',
                maxWidth: 'calc(13rem + 60px)',
                width: 'calc(13rem + 60px)',
                }}>
                <div data-observe
                    ref={selfRef}
                    style={{
                        display: 'block',
                        marginBottom: '5px',
                        maxWidth: '13rem',
                        width: '13rem',
                        transform: `scale(${scale})`,
                        opacity: opacity,
                        transition: 'transform 0.1s ease',
                        }}>
                    <button
                        className='home_button addConversationButton'
                        title="Create a New Conversation"
                        onClick={openNewConversationForm}
                        style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.3em 0.3em',
                                textDecoration: 'none',
                                fontSize: '16px',
                            }}>
                        {addConversation}
                    </button>
                    {newConversation}
                </div>
                <ConversationsList currentConversationId={currentConversationId} setCurrentConversationId={setCurrentConversationId} setView={setView}/>
            </div>
        </div>
    )

    let panels
    if (isAdmin) panels = [musicControls, generalControls, conversations]
    else panels = [generalControls, conversations]

    const handleSwipedLeft = () => {
        if (!usingVolumeSlider) {
            setCurrentPanelIndex((prevIndex) => (prevIndex + 1) % panels.length)
            setShowNewConversation(false)
        }
    }
    
    const handleSwipedRight = () => {
        if (!usingVolumeSlider) {
            setCurrentPanelIndex((prevIndex) => (prevIndex - 1 + panels.length) % panels.length)
            setShowNewConversation(false)
        }
    }
    
    const panelHandlers = useSwipeable({
        onSwipedLeft: handleSwipedLeft,
        onSwipedRight: handleSwipedRight,
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    })
    
    let sideBar
    if (showSideBar) {
        if (windowWidth <= 1000) {
            sideBar = (
                <>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div className='menu'
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexGrow: '1',
                                backgroundColor: 'rgba(203, 214, 238, 0.718)',
                                borderRadius: '10px',
                                marginBottom: '5px',
                                justifyContent: 'center',
                                maxHeight: '110px',
                                height: '110px',
                                paddingBottom: '0px',
                                overflow: 'visible',
                            }}
                            ref={sideBarRef}
                            {...panelHandlers}>
                            {panels[currentPanelIndex]}
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}>
                        <button className='conversationButton'
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '5px',
                                width: '15%',
                                height: '1rem',
                                padding: '0px'
                            }}
                            onClick={() => setShowSideBar(false)}
                            >
                            <FontAwesomeIcon icon={faCaretUp}/>
                        </button>
                    </div>
                </>
            )
        } else {
            sideBar = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: '84dvh',
                    maxheight: '84dvh',
                }}>
                    <div className='menu'
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: '1',
                            width: '13rem',
                            maxWidth: '13rem',
                            marginRight: '5px',
                            backgroundColor: 'rgba(203, 214, 238, 0.718)',
                            borderRadius: '10px',
                            padding: '6px',
                        }}
                        ref={sideBarRef}>
                        {spotifyInterface}
                        <div style={{display: 'block', marginBottom: '5px'}}>
                            {profileButtons}
                        </div>
                        <div style={{display: 'block', marginBottom: '5px'}}>
                            <button
                                className='home_button addConversationButton'
                                title="Create a New Conversation"
                                onClick={openNewConversationForm}
                                style={{
                                        width: '100%',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '0.3em 0.3em',
                                        textDecoration: 'none',
                                        fontSize: '16px',
                                    }}
                            >
                                {addConversation}
                            </button>
                            {newConversation}
                        </div>
                        <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: '1',
                                // maxHeight: '50dvh',
                                justifyContent: 'flex-start',
                                overflowX: 'visible',
                                overflowY: 'scroll',
                                margin: '-3px -10px',
                                padding: '3px 10px',
                                borderRadius: '10px',
                                scrollbarWidth: 'none',
                                }}>
                            <ConversationsList setCurrentConversationId={setCurrentConversationId} setView={setView}/>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}>
                        <button className='conversationButton'
                            style={{
                                marginRight: '5px',
                                width: '1rem',
                                height: '15%',
                                padding: '0px',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onClick={() => setShowSideBar(false)}
                            >
                            <FontAwesomeIcon icon={faCaretLeft}/>
                        </button>
                    </div>
                </div>
            )
        }
    } else {
        if (windowWidth <= 1000) {
            sideBar = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <button className='conversationButton'
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '5px',
                            width: '15%',
                            height: '1rem',
                            padding: '0px'
                        }}
                        onClick={(e) => setShowSideBar(true)}
                        >
                        <FontAwesomeIcon icon={faCaretDown}/>
                    </button>
                </div>
            )
        } else {
            sideBar = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '84dvh',
                }}>
                    <button className='conversationButton'
                        style={{
                            marginRight: '5px',
                            width: '1rem',
                            height: '15%',
                            padding: '0px'
                        }}
                        onClick={() => setShowSideBar(true)}
                        >
                        <FontAwesomeIcon icon={faCaretRight}/>
                    </button>
                </div>
            )
        }
    }

    const mainContent = (
        <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexGrow: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                borderRadius: '10px',
                overflowY: 'auto',
            }}>
            {view === '' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                    }}>
                    {defaultContent}
                </div>
            }
            {view === 'usersList' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                        overflowY: 'auto',
                    }}>
                    <UsersList setView={setView} setEditingUserId={setEditingUserId} />
                </div>
            }
            {view === 'editUser' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                        overflowY: 'auto',
                    }}>
                    <EditUser uid={editingUserId} setView={setView} setCurrentConversationId={setCurrentConversationId} setEditingUserId={setEditingUserId} />
                </div>
            }
            {view === 'newUserForm' &&
                <div className="conversation-interface"
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'rgba(203, 214, 238, 0.718)',
                        overflowY: 'auto',
                    }}>
                    <NewUserForm fullSize={false} />
                </div>
            }
            {view === 'conversationView' &&
                <ConversationView
                    conversationId={currentConversationId}
                    setCurrentConversationId={setCurrentConversationId}
                    setView={setView}
                    usingVolumeSlider={usingVolumeSlider}
                    setUsingVolumeSlider={setUsingVolumeSlider} />
            }
        </div>
    )

    let content
    if (windowWidth <= 1000) {
        content = (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: '1',
                height: '90dvh',
                maxHeight: '90dvh',
            }}>
                {sideBar}
                {mainContent}
            </div>
        )
    } else {
        content = (
            <section className="welcome"
                style={{display: 'flex',
                    flexDirection: 'row',
                    flexGrow: '1',
                    height: '84dvh',
                }}>
                <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: '1'
                    }}>
                    {sideBar}
                    {mainContent}
                </div>
            </section>
        )
    }

    if (!loggedInUser) {
        return <p>Loading...</p>
    }

    return content
}
export default Welcome