import { useState, useEffect } from "react"
import { useAddNewConversationMutation } from "./conversationsApiSlice"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from "react-redux"
import { selectUserById } from "../../features/users/usersApiSlice"

const NewConversationForm = ({uid, setView, setCurrentConversationId, setShowNewConversation}) => {
    const user = useSelector(state => selectUserById(state, uid))
    const [mouseInInput, setMouseInInput] = useState(false)

    const [addNewConversation, {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewConversationMutation()

    const [title, setTitle] = useState('')
    const [validTitle, setValidTitle] = useState(false)

    useEffect(() => {
        setValidTitle(title.length)
    }, [title])

    useEffect(() => {
        if (isSuccess) {
            localStorage.setItem('view', 'conversationView')
            setView('conversationView')
            localStorage.setItem('currentConversationId', data.id)
            setCurrentConversationId(data.id)
            setTitle('')
            setShowNewConversation(false)
        }
    }, [isSuccess])

    const handleKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onSaveConversationClicked()
        } else if (e.key === 'Escape') {
            setTitle('')
        }
    }

    const onTitleChanged = e => setTitle(e.target.value)

    const onSaveConversationClicked = async (e) => {
        if (validTitle) {
            await addNewConversation({user, title})
        }
    }

    let canSave = title.length && !isLoading

    const errClass = (isError) ? "errmsg" : "offscreen"
    const errContent = error?.data?.message ?? ''

    let err
    if (isError) {
        err = <p className={errClass} style={{fontSize: '16px', padding: '0.2em 0em', marginBottom: '10px'}}>{errContent}</p>
    }

    const content = (
        <div style={{display: 'flex',
                flexGrow: '1',
                flexDirection: 'row',
                fontSize: '16px',
                marginTop: '5px'
                }}>
            <div className={`conversationButton`}
                style={{height: '100%', padding: '0.3em 0.3em'}}
                onMouseEnter={() => setMouseInInput(true)}
                onMouseLeave={() => setMouseInInput(false)}>
                {err}
                <input
                    className={mouseInInput ? `conversationInputHover` : `conversationInput`}
                    style={{
                        backgroundColor: 'transparent',
                    }}
                    id="title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    value={title}
                    onChange={onTitleChanged}
                    onKeyDown={handleKey}
                    autoFocus
                />
            </div>
            <button
                className="conversationOptionsButton"
                onClick={onSaveConversationClicked}
                disabled={!canSave}
            >
                <FontAwesomeIcon icon={faSave} />
            </button>
        </div>
    )

    return content
}
export default NewConversationForm