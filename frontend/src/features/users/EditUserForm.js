import { useState, useEffect, useRef } from "react"
import { useUpdateUserMutation, useDeleteUserMutation, selectUserById } from "./usersApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { ROLES } from "../../config/roles"
import { setCredentials } from "../auth/authSlice"
import { useDispatch } from 'react-redux'
import { useSendLogoutMutation, useUpdateMutation } from "../auth/authApiSlice"
import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentId } from '../auth/authSlice'
import useAuth from "../../hooks/useAuth"

const USER_REGEX = /^[A-z0-9]{1,}$/
const PWD_REGEX = /^$|^[A-z0-9!@#$%]{4,}$/

const EditUserForm = ({user, setView, setCurrentConversationId, setEditingUserId}) => {
    const [updateUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateUserMutation()
    
    const [deleteUser, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delError
    }] = useDeleteUserMutation()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [username, setUsername] = useState(user.username)
    const [validUsername, setValidUsername] = useState(true)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [role, setRole] = useState(user.role)
    const [active, setActive] = useState(user.active)
    const [showPassword, setShowPassword] = useState(false)
    const { role: loggedInUserRole } = useAuth()
    const sourceId = useSelector(selectCurrentId)
    const isAdmin = loggedInUserRole === 'Admin'
    const targetUserIsAdmin = user.role === 'Admin'
    const [deleteClicks, setDeleteClicks] = useState(0)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const [sendLogout] = useSendLogoutMutation()

    const [update] = useUpdateMutation()

    useEffect(() => {
        setRole(user.role)
    }, [user])

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password))
    }, [password])

    useEffect(() => {
        if (isSuccess) {
            setUsername(user.username)
            setPassword('')
            setRole(user.role)
            if (isAdmin && loggedInUser.id !== user.id) {
                localStorage.setItem('view', 'usersList')
                setView('usersList')
                setEditingUserId('')
            } else {
                localStorage.setItem('view', '')
                setView('')
                setEditingUserId('')
            }
        } else if (isDelSuccess) {
            setUsername('')
            setPassword('')
            setRole('')
            if (loggedInUser.id === user.id) {
                sendLogout()
                navigate(`/`)
            } else if (isAdmin) {
                localStorage.setItem('view', 'usersList')
                setView('usersList')
                setEditingUserId('')
            }
        }
    }, [isSuccess, isDelSuccess, navigate])

    const onUsernameChanged = e => setUsername(e.target.value)
    const onPasswordChanged = e => setPassword(e.target.value)
    const onRoleChanged = e => {
        setRole(e.target.selectedOptions[0].value)
    }
    const onActiveChange = e => !targetUserIsAdmin ? setActive(!active) : setActive(active)

    const onSaveUserClicked = async (e) => {
        if (password) {
            await updateUser({sourceId: sourceId, id: user.id, username, password, role, active})
            if (loggedInUser.id === user.id) {
                const { accessToken, id, active } = await update({ username }).unwrap()
                dispatch(setCredentials({ accessToken, username, id, active }))
            }
        } else {
            await updateUser({sourceId: sourceId, id: user.id, username, role, active})
            if (loggedInUser.id === user.id) {
                const { accessToken, id, active } = await update({ username }).unwrap()
                dispatch(setCredentials({ accessToken, username, id, active }))
            }
        }
    }

    const onDeleteUserClicked = async () => {
        await deleteUser({sourceId: sourceId, id: user.id})
        setDeleteClicks(0)
    }

    const handlePwdVisibility = (e) => {
        e.preventDefault()
        setShowPassword(prev => !prev)
    }

    // Admin users can change other users' role
    const {id} = useSelector(state => state.auth)
    const loggedInUser = useSelector((state) => selectUserById(state, id))

    const visibleRoles = loggedInUser?.role === ROLES.ADMIN ? [ROLES.ADMIN, ROLES.USER, ROLES.DEMO] : []

    const options = Object.values(ROLES)
        .filter(role => visibleRoles.includes(role))
        .map(role => {
        return (
            <option
                key={role}
                value={role}
            > {role}</option >
        )
    })

    let canSave
    if (password && !validPassword) {
        canSave = [role !== '', validUsername, validPassword].every(Boolean) && !isLoading
    } else {
        canSave = [role !== '', validUsername].every(Boolean) && !isLoading
    }

    const errClass = (isError || isDelError) ? "errmsg" : "offscreen"
    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''
    const validRoleClass = role === '' ? 'form__input--incomplete' : ''

    const errContent = (error?.data?.message || delError?.data?.message) ?? ''

    let err
    if (isError || isDelError) {
        err = <div className={errClass}>{errContent}</div>
    }

    let pwd_error
    if (password && !validPassword) {
        pwd_error = (
            <div className="errmsg"
                style={{
                    fontSize: '1rem',
                    padding: '0.75rem',
                    margin: '0px',
                    // color: 'red',
                    // backgroundColor: 'rgba(255, 0, 0, 0.1)',
                }}>
                {'At least 4 characters required'}
            </div>
        )
    }

    let roleSelect
    if (visibleRoles.length) {
        if (windowWidth <= 1000) {
            roleSelect = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                    <label className="form__label" htmlFor="roles" style={{fontSize: '1.1rem', marginRight: '1rem'}}>
                        Role:
                    </label>
                    <select
                        id="roles"
                        name="roles"
                        className={`form__select ${validRoleClass}`}
                        multiple={false}
                        size={visibleRoles.length}
                        value={role}
                        onChange={onRoleChanged}
                        style={{maxWidth: '18rem', fontSize: '1.1rem'}}
                    >
                        {options}
                    </select>
                </div>
            )
        } else {
            roleSelect = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                    <label className="form__label" htmlFor="roles" style={{marginRight: '1rem'}}>
                        Role:
                    </label>
                    <select
                        id="roles"
                        name="roles"
                        className={`form__select ${validRoleClass}`}
                        multiple={false}
                        size={visibleRoles.length}
                        value={role}
                        onChange={onRoleChanged}
                        style={{maxWidth: '18rem'}}
                    >
                        {options}
                    </select>
                </div>
            )
        }
    }

    let chooseActive
    if (isAdmin) {
        if (windowWidth <= 1000) {
            chooseActive = (
                <button
                    className="home_button"
                    name="status"
                    onClick={onActiveChange}
                    style={{
                        fontSize: '1.1rem',
                        flexGrow: '1',
                        border: 'none',
                        borderRadius: '15px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        marginRight: '0',
                    }}
                    disabled={targetUserIsAdmin}>
                    {active ? 'Active' : 'Inactive'}
                </button>
            )
        } else {
            chooseActive = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                    <label className="form__label" htmlFor="status" style={{marginRight: '1rem'}}>
                        Status:
                    </label>
                    <button
                        className="home_button"
                        name="status"
                        onClick={onActiveChange}
                        style={{
                            fontSize: '1.5rem',
                            flexGrow: '1',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            maxWidth: '18rem',
                            marginRight: '0'
                        }}
                        disabled={targetUserIsAdmin}>
                        {active ? 'Active' : 'Inactive'}
                    </button>
                </div>
            )
        }
    }

    let deleteButton
    if (deleteClicks === 0) {
        deleteButton = (
            <button
                className="form__submit-button"
                title="Delete"
                onClick={() => setDeleteClicks(1)}
                style={{
                    fontSize: windowWidth <= 1000 ? '1.1rem' : '1.5rem',
                    padding: '0.2em 0.5em',
                    boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                }}>
                Delete
            </button>
        )
    } else if (deleteClicks === 1) {
        deleteButton = (
            <div className="form__block"
                style={{
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#ff0000a2',
                }}>
                <div style={{marginBottom: '0.5rem', fontSize: windowWidth <= 1000 ? '1.1rem' : '1.5rem'}}>Are You Sure?</div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '1rem',
                }}>
                    <button
                        className="form__submit-button-opaque"
                        title="Delete"
                        onClick={onDeleteUserClicked}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: '1',
                            justifyContent: 'center',
                            fontSize: windowWidth <= 1000 ? '1.1rem' : '1.5rem',
                            padding: '0.2em 0.5em',
                            boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                            backgroundColor: 'rgba(203, 214, 238, 1)',
                        }}>
                        Yes
                    </button>
                    <button
                        className="form__submit-button-opaque"
                        title="Cancel"
                        onClick={() => setDeleteClicks(0)}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: '1',
                            justifyContent: 'center',
                            fontSize: windowWidth <= 1000 ? '1.1rem' : '1.5rem',
                            padding: '0.2em 0.5em',
                            boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                            backgroundColor: 'rgba(203, 214, 238, 1)',
                        }}>
                        No
                    </button>
                </div>
            </div>
        )
    }

    let form
    if (windowWidth <= 1000) {
        form = (
            <form className="form" onSubmit={e => e.preventDefault()}>
                {err}
                <div className="form__title-row">
                    <h2 style={{fontSize: '2.5rem'}}>Edit Profile</h2>
                </div>
                {chooseActive}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                    <label className="form__label" htmlFor="username" style={{fontSize: '1.1rem', marginRight: '1rem'}}>
                        Username:
                    </label>
                    <input
                        className={`form__input ${validUserClass}`}
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="off"
                        autoFocus
                        placeholder={user.username}
                        value={username}
                        onChange={onUsernameChanged}
                        style={{
                            maxWidth: '18rem',
                            textAlign: 'center',
                            fontSize: '1.1rem', 
                        }}
                    />
                </div>
                {pwd_error}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                    <label className="form__label" htmlFor="password" style={{fontSize: '1.1rem', marginRight: '1rem'}}>
                        Password:
                    </label>
                    <div className="nowrap" style={{ display: 'flex', maxWidth: '18rem', flexDirection: 'row', flexGrow: '1', justifyContent: 'space-between' }}>
                        <input
                            className={`form__input ${validPwdClass}`}
                            id="password"
                            name="password"
                            type={showPassword? 'text' : 'password'}
                            value={password}
                            onChange={onPasswordChanged}
                            style={{
                                textAlign: 'center',
                                flexGrow: '1',
                                width: '100%',
                                marginRight: '1rem',
                                fontSize: '1.1rem',
                            }}/>
                        <button
                            className='home_button'
                            type='button'
                            title={showPassword? 'Hide Password' : 'Show Password'}
                            onClick={handlePwdVisibility}
                            style={{
                                border: 'none',
                                borderRadius: '15px',
                                padding: '0.3em 0.3em',
                                textDecoration: 'none',
                                flexGrow: '1',
                                minWidth: '4rem',
                                fontSize: '1.1rem',
                            }}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
                {roleSelect}
                <button
                    className="form__submit-button"
                    title="Save"
                    onClick={onSaveUserClicked}
                    disabled={!canSave}
                    style={{
                        fontSize: '1.1rem',
                        padding: '0.2em 0.5em',
                        boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                    }}>
                    Save
                </button>
                {deleteButton}
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                    {/* Hidden input to prevent autofill */}
                    <input type="password"
                        autoComplete="new-password"
                        aria-autocomplete="none"
                        data-custom-attribute="random-string"
                        style={{ display: 'none' }}
                    />
                </div>
            </form>
        )
    } else {
        form = (
            <form className="form" onSubmit={e => e.preventDefault()}>
                {err}
                <div className="form__title-row">
                    <h2 style={{fontSize: '2.5rem'}}>Edit Profile</h2>
                </div>
                {chooseActive}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                    <label className="form__label" htmlFor="username" style={{marginRight: '1rem'}}>
                        Username:
                    </label>
                    <input
                        className={`form__input ${validUserClass}`}
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="off"
                        autoFocus
                        placeholder={user.username}
                        value={username}
                        onChange={onUsernameChanged}
                        style={{
                            maxWidth: '18rem',
                            textAlign: 'center',
                        }}
                    />
                </div>
                {pwd_error}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                <label className="form__label" htmlFor="password" style={{marginRight: '1rem'}}>
                    Password:
                </label>
                    <div className="nowrap" style={{ display: 'flex', maxWidth: '18rem', flexDirection: 'row', flexGrow: '1', justifyContent: 'space-between' }}>
                        <input
                            className={`form__input ${validPwdClass}`}
                            id="password"
                            name="password"
                            type={showPassword? 'text' : 'password'}
                            value={password}
                            onChange={onPasswordChanged}
                            style={{
                                textAlign: 'center',
                                flex: '1',
                                minWidth: '0px',
                                marginRight: '1rem',
                            }}/>
                        <button
                            className='home_button'
                            type='button'
                            title={showPassword? 'Hide Password' : 'Show Password'}
                            onClick={handlePwdVisibility}
                            style={{
                                border: 'none',
                                borderRadius: '15px',
                                padding: '0.3em 0.3em',
                                textDecoration: 'none',
                                flexGrow: '1',
                                maxWidth: '4rem',
                            }}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
                {roleSelect}
                <button
                    className="form__submit-button"
                    title="Save"
                    onClick={onSaveUserClicked}
                    disabled={!canSave}
                    style={{
                        fontSize: '1.5rem',
                        padding: '0.2em 0.5em',
                        boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                    }}>
                    Save
                </button>
                {deleteButton}
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                    {/* Hidden input to prevent autofill */}
                    <input type="password"
                        autoComplete="new-password"
                        aria-autocomplete="none"
                        data-custom-attribute="random-string"
                        style={{ display: 'none' }}
                    />
                </div>
            </form>
        )
    }

    const content = (
        <section>
            <div style={{display: 'flex', flexDirection: 'row', flexGrow: '1', justifyContent: 'center'}}>
                {form}
            </div>
        </section>
    )

    return content
}

export default EditUserForm