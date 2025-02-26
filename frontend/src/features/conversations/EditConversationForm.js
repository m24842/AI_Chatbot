import { useState, useEffect } from "react"
import { useUpdateConversationMutation, useDeleteConversationMutation } from "./conversationsApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons"

const EditConversationForm = ({conversation}) => {
    const [updateConversation, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateConversationMutation()

    const [deleteConversation, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delError
    }] = useDeleteConversationMutation()

    const navigate = useNavigate()

    const [title, setTitle] = useState(conversation.title)
    const [validTitle, setValidTitle] = useState(false)

    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setTitle('')
            navigate('/dash/conversations')
        }

    }, [isSuccess, isDelSuccess, navigate])

    const onTitleChanged = e => setTitle(e.target.value)

    const onSaveConversationClicked = async (e) => {
        await updateConversation({id: conversation.id, title})
    }

    const onDeleteConversationClicked = async () => {
        await deleteConversation({id: conversation.id})
    }

    let canSave = title.length && !isLoading

    const errClass = (isError || isDelError) ? "errmsg" : "offscreen"
    const validTitleClass = !validTitle ? 'form__input--incomplete' : ''

    const errContent = (error?.data?.message || delError?.data?.message) ?? ''

    const content = (
        <>
            <p className={errClass}>{errContent}</p>

            <form className="form" onSubmit={e => e.preventDefault()}>
                <div className="form__title-row">
                    <h2>Edit Conversation</h2>
                    <div className="form__action-buttons">
                        <button
                            className="icon-button"
                            title="Save"
                            onClick={onSaveConversationClicked}
                            disabled={!canSave}
                        >
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                            className="icon-button"
                            title="Delete"
                            onClick={onDeleteConversationClicked}
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </div>
                </div>
                <label className="form__label" htmlFor="title">
                    New Title: <span className="nowrap">(3-20 letters)</span></label>
                <input
                    className={`form__input ${validTitleClass}`}
                    id="title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    value={title}
                    onChange={onTitleChanged}
                />

            </form>
        </>
    )

    return content
}
export default EditConversationForm