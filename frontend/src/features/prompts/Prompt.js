import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faSave, faXmarkCircle, faCopy as faSolidCopy, faCheck, faRotate, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useUpdateConversationMutation } from '../conversations/conversationsApiSlice'
import { useState, useEffect, useRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

const Prompt = ({conversation, conversationId, conversationContent, conversationSize, promptId, editingPromptIndex, setEditingPromptIndex}) => {
    const [prompt, setPrompt] = useState(conversationContent[promptId])
    const [promptContent, setPromptContent] = useState(prompt[1])
    const [parsedPromptContent, setParsedPromptContent] = useState(null)
    const [promptOwner, setPromptOwner] = useState(prompt[0])
    const [edit, setEdit] = useState(false)
    const textareaRef = useRef(null)
    const [input, setInput] = useState(promptContent)
    const [cachedInput, setCachedInput] = useState(promptContent)
    const [copiedDict, setCopiedDict] = useState({})
    const [copiedTimeoutDict, setCopiedTimeoutDict] = useState({})
    const promptRef = useRef()
    const [lastPromptClick, setLastPromptClick] = useState(null)
    const lastPromptClickRef = useRef(lastPromptClick)
    const doubleClickListeners = useRef([])

    useEffect(() => {
        setParsedPromptContent(parsePromptContent(promptContent))
    }, [promptContent, copiedDict])

    const codeStyle = {
        fontFamily: 'monospace',
        fontSize: '16px',
        backgroundColor: 'rgba(237, 245, 253, 0.9)',
        border: '3px solid rgba(84, 71, 209, 0.3)',
        padding: '10px',
        borderRadius: '5px',
        transition: 'color 0.3s',
        color: '#5136d5',
        paddingLeft: '2rem',
        textOverflow: 'clip',
        overflowX: 'auto'
    }

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedDict(prevDict => ({ ...prevDict, [index]: true }))
                if (copiedTimeoutDict[index]) {
                    clearTimeout(copiedTimeoutDict[index])
                }
                const timeoutId = setTimeout(() => {
                    setCopiedDict(prevDict => {
                        const { [index]: _, ...rest } = prevDict
                        return rest
                    })
                    setCopiedTimeoutDict(prevDict => {
                        const { [index]: _, ...rest } = prevDict
                        return rest
                    })
                }, 1000)
                setCopiedTimeoutDict(prevDict => ({ ...prevDict, [index]: timeoutId }))
            })
            .catch(err => {
                console.error('Failed to copy text: ', err)
            })
    }

    useEffect(() => {
        return () => {
            Object.values(copiedTimeoutDict).forEach((timeoutId) => {
                clearTimeout(timeoutId)
            })
        }
    }, [])

    const parsePromptContent = (content) => {
        // return content
        const parts = content.split("```")

        const parsedContent = parts.map((part, index) => {
            if (index % 2 === 0) {
                function convertDelimiters(input) {
                    // Convert inline math: \( ... \) to $ ... $
                    let output = input.replace(/\\\((.*?)\\\)/g, '$$$1$')
                    
                    // Convert display math: \[ ... \] to $$ ... $$, including newlines inside
                    output = output.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$')
                    
                    return output
                }

                const markdown = convertDelimiters(part)
                return <MarkdownRenderer markdown={markdown} key={index}/>
            } else {
                const language = part.substring(0, part.indexOf("\n"))
                const code = part.substring(part.indexOf("\n") + 1)
                const key = language.trim()

                return (
                    <div key={index} style={{
                            // maxWidth: '60dvw'
                            marginBottom: '1rem',
                            marginTop: '0.5rem',
                        }}>
                        <div style={{
                            borderRadius: '5px',
                            backgroundColor: 'rgba(137, 83, 223, 0.718)',
                            color: 'rgb(255, 255, 255)',
                            border: '3px solid rgba(84, 71, 209, 0.718)',
                            padding: '0.2em 2em',
                            minHeight: '2em',
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: '1',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <p>{language ? language : 'cmd'}</p>
                            <button className="conversationButton"
                                onClick={() => {
                                    copyToClipboard(code, index)
                                }}
                                style={{
                                    width: '2.5rem',
                                    padding: '0.3em 0.7em',
                                    boxShadow: 'none',
                                    textOverflow: 'clip',
                                }}>
                                    {copiedDict[index] ? <FontAwesomeIcon icon={faCheck}/> : <FontAwesomeIcon icon={faSolidCopy} />}
                            </button>
                        </div>
                        <p key={index} style={codeStyle}>
                            {code}
                        </p>
                    </div>
                )
            }
        })
        return parsedContent
    }

    const [updateConversation, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateConversationMutation()

    useEffect(() => {
        if (editingPromptIndex !== promptId) {
            setEdit(false)
            setInput(conversation.content[promptId][1])
            setPromptContent(conversation.content[promptId][1])
        }
    }, [editingPromptIndex])

    useEffect(() => {
        setInput(promptContent)
        // adjustTextareaWidth()
        adjustTextareaHeight()
    }, [edit])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.selectionStart = textareaRef.current.value.length
            textareaRef.current.selectionEnd = textareaRef.current.value.length
        }
    }, [edit])

    useEffect(() => {
        if (conversationContent[promptId]) {
            setPrompt(conversationContent[promptId])
            setPromptContent(conversationContent[promptId][1])
        }
    }, [conversationContent])

    useEffect(() => {
        setPrompt([promptOwner, promptContent])
    }, [promptOwner, promptContent])

    useEffect(() => {
        if (conversationSize > 16000) {
            if (isLoading) {
                setCachedInput(input)
                setEdit(false)
                setEditingPromptIndex(null)
            } else if (isError) {
                setEdit(true)
                setEditingPromptIndex(promptId)
            }
        } else if (isSuccess) {
            setEdit(false)
            setEditingPromptIndex(null)
        }
    }, [isSuccess, isError, isLoading])

    const handleInputChange = (e) => {
        setPromptContent(e.target.value)
        setInput(e.target.value)
        // adjustTextareaWidth()
        adjustTextareaHeight()
    }

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.whiteSpace = 'pre-wrap'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    const adjustTextareaWidth = () => {
        if (textareaRef.current) {
            textareaRef.current.style.width = 'auto'
            textareaRef.current.style.whiteSpace = 'pre'
            const currentWidth = textareaRef.current.scrollWidth
            const maxWidth = window.innerWidth * 60 / 100
            textareaRef.current.style.width = currentWidth > maxWidth ? `${maxWidth}px` : `${currentWidth}px`
            textareaRef.current.style.whiteSpace = 'pre-wrap'
        }
    }

    useEffect(() => {
        adjustTextareaHeight()
    }, [input])

    useEffect(() => {
        lastPromptClickRef.current = lastPromptClick
    }, [lastPromptClick])

    const addDoubleClickListener = () => {
        if (promptRef.current && doubleClickListeners.current.length === 0) {
            promptRef.current?.addEventListener('click', handlePromptClick)
            doubleClickListeners.current.push({ type: 'click', handler: handlePromptClick })
        }
    }

    const removeDoubleClickListener = () => {
        if (promptRef.current) {
            doubleClickListeners.current.forEach(({ type, handler }) => {
                promptRef.current.removeEventListener(type, handler)
            })
            doubleClickListeners.current = []
        }
    }

    const handlePromptClick = (e) => {
        if (promptRef.current && promptRef.current.contains(e.target)) {
            if (lastPromptClickRef.current === null || e.timeStamp - lastPromptClickRef.current > 500) {
                setLastPromptClick(e.timeStamp)
            } else if (lastPromptClickRef.current !== null && e.timeStamp - lastPromptClickRef.current <= 500 && !edit) {
                setEdit(true)
                setEditingPromptIndex(promptId)
            }
        }
    }

    if (prompt) {
        const handleEdit = () => {
            setEdit(true)
            setEditingPromptIndex(promptId)
        }

        const regenerate = async () => {
            const updatedContent = [
                ...conversationContent.slice(0, promptId),
            ]
            await updateConversation({
                id: conversationId,
                user: conversation.user,
                title: conversation.title,
                content: updatedContent,
                respond: true,
            })
        }

        const continueGeneration = async () => {
            const updatedContent = [
                ...conversationContent.slice(0, promptId + 1),
            ]
            await updateConversation({
                id: conversationId,
                user: conversation.user,
                title: conversation.title,
                content: updatedContent,
                respond: true,
            })
        }

        const handleSave = async () => {
            if (promptContent?.replace(/\s/g, "").length && promptContent !== conversation.content[promptId][1]) {
                const updatedContent = [
                    ...conversationContent.slice(0, promptId),
                    [promptOwner, promptContent],
                ]
                await updateConversation({
                    id: conversationId,
                    user: conversation.user,
                    title: conversation.title,
                    content: updatedContent,
                    respond: true,
                })
            } else if (promptContent?.replace(/\s/g, "").length && promptContent === conversation.content[promptId][1]) {
                setEdit(false)
            }
        }

        const handleCancel = () => {
            setEdit(false)
            setPromptContent(conversation.content[promptId][1])
            setEditingPromptIndex(null)
        }

        const allowEditing = editingPromptIndex === promptId

        let editButton
        if (edit && allowEditing) {
            editButton = (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                        className="conversationOptionsButton"
                        onClick={handleSave}
                        style={{
                            backgroundColor: 'transparent',
                            animation: 'none',
                            padding: '0',
                            height: '2rem',
                            boxShadow: 'none',
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button
                        className="conversationOptionsButton"
                        onClick={handleCancel}
                        style={{
                            backgroundColor: 'transparent',
                            animation: 'none',
                            padding: '0',
                            height: '2rem',
                            boxShadow: 'none',
                        }}
                    >
                        <FontAwesomeIcon icon={faXmarkCircle} />
                    </button>
                </div>
            )
        } else {
            editButton = (
                <button
                    className="conversationOptionsButton"
                    onClick={handleEdit}
                    style={{
                        float: 'right',
                        backgroundColor: 'transparent',
                        animation: 'none',
                        padding: '0',
                        height: '2rem',
                        boxShadow: 'none',
                    }}
                    >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
            )
        }

        let textBubble
        if (promptOwner === "User") {
            if (edit && allowEditing) {
                textBubble = (
                    <div
                        style={{
                            display: 'flex',
                            flexGrow: '1',
                            flexDirection: 'row',
                            fontSize: '16px',
                            marginBottom: '20px',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                        }}>
                        <div
                            className='userPrompt'
                            style={{
                                borderRadius: '10px',
                                padding: '0.5em 1em',
                                textDecoration: 'none',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                marginRight: '1em',
                                marginLeft: '1em',
                                width: '100%',
                            }}>
                            <textarea
                                className="conversationInput"
                                ref={textareaRef}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (!(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)) {
                                            e.preventDefault()
                                            handleSave()
                                        }
                                    }
                                }}
                                value={input}
                                autoFocus
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#5136d5',
                                    resize: 'none',
                                    borderRadius: '10px',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'left',
                                    padding: '0.5em 0em',
                                }}/>
                            <div
                                style={{
                                    marginLeft: '0.65em',
                                    marginRight: '-0.3em',
                                }}>
                                {editButton}
                            </div>
                        </div>
                    </div>
                )
            } else {
                textBubble = (
                    <div
                        style={{
                            display: 'flex',
                            flexGrow: '1',
                            flexDirection: 'row',
                            fontSize: '16px',
                            marginBottom: '20px',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                        }}>
                        <div
                            className='userPrompt'
                            style={{
                                borderRadius: '10px',
                                padding: '0.5em 1em',
                                textDecoration: 'none',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                marginRight: '1em',
                                marginLeft: '1em',
                                maxWidth: '65dvw',
                            }}
                            title={"Double-click to edit"}
                            ref={promptRef}
                            onMouseEnter={addDoubleClickListener}
                            onMouseLeave={removeDoubleClickListener}>
                            <pre
                                style={{
                                    fontFamily: 'inherit',
                                    marginLeft: '0.5em',
                                    marginRight: '1.2em',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    padding: '0.5em 0em',
                                    maxWidth: '59dvw',
                                }}>
                                {promptContent}
                            </pre>
                            <div
                                style={{
                                    marginRight: '-0.3em',
                                }}>
                                {editButton}
                            </div>
                        </div>
                    </div>
                )
            }
        } else if (promptOwner === "AI" && promptContent !== "...") {
            textBubble = (
                <div
                    style={{
                        display: 'flex',
                        flexGrow: '1',
                        flexDirection: 'row',
                        fontSize: '16px',
                        marginBottom: '20px',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                    }}>
                    <div
                        className='aiPrompt'
                        style={{
                            borderRadius: '10px',
                            padding: '0.5em 1em',
                            textDecoration: 'none',
                            fontSize: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: '1',
                            alignItems: 'center',
                            marginLeft: '1em',
                            marginRight: '1em',
                        }}>
                        <pre ref={promptRef}
                            style={{
                                padding: '0.5em 0.5em',
                                fontFamily: 'inherit',
                                marginLeft: '0.45em',
                                marginRight: '0.45em',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }}>
                            {parsedPromptContent}
                        </pre>
                        <div style={{display: 'flex', flexDirection: 'row', gap: '0.5rem'}}>
                            <button
                                className="conversationOptionsButton"
                                title="Copy response"
                                onClick={() => {
                                    copyToClipboard(promptContent, -1)
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    animation: 'none',
                                    padding: '0',
                                    height: '2rem',
                                    boxShadow: 'none',
                                }}>
                                {copiedDict[-1] ? <FontAwesomeIcon icon={faCheck}/> : <FontAwesomeIcon icon={faSolidCopy} />}
                            </button>
                            <button
                                className="conversationOptionsButton"
                                title="Regenerate response"
                                onClick={regenerate}
                                style={{
                                    backgroundColor: 'transparent',
                                    animation: 'none',
                                    padding: '0',
                                    height: '2rem',
                                    boxShadow: 'none',
                                }}>
                                <FontAwesomeIcon icon={faRotate} />
                            </button>
                            <button
                                className="conversationOptionsButton"
                                title="Continue response"
                                onClick={continueGeneration}
                                style={{
                                    backgroundColor: 'transparent',
                                    animation: 'none',
                                    padding: '0',
                                    height: '2rem',
                                    boxShadow: 'none',
                                }}>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    </div>
                </div>
            )
        } else if (promptOwner === "AI" && promptContent === "...") {
            textBubble = (
                <div
                    style={{
                        display: 'flex',
                        flexGrow: '1',
                        flexDirection: 'row',
                        fontSize: '16px',
                        marginBottom: '20px',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                    }}>
                    <div
                        className='aiPrompt'
                        style={{
                            borderRadius: '10px',
                            padding: '0.5em 1em',
                            paddingBottom: '0.8em',
                            textDecoration: 'none',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            marginLeft: '1em',
                            height: '3.1em',
                            maxWidth: '60dvw',
                        }}>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                </div>
            )

        }

        return textBubble

    } else return null
}
export default Prompt