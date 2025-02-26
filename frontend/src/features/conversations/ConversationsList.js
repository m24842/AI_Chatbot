import { useGetConversationsQuery } from "./conversationsApiSlice"
import Conversation from "./Conversation"
import { useSelector } from "react-redux"

const ConversationsList = ({currentConversationId, setCurrentConversationId, setView}) => {
    const id = useSelector((state) => state.auth.id)

    const {
        data: conversations,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetConversationsQuery({user: id}, {
        pollingInterval: 1000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
    })

    let content

    if (error || isLoading || isError) {
        content = (
            <div
                className={`conversationButton`}
                style={{textAlign: 'center', fontSize: '16px', width: '12rem'}}
                >
                    No Conversations
            </div>
        )
    } else if (conversations && isSuccess) {
        const { ids, entities } = conversations

        const tableContent = (ids && entities) ? 
            ids.map(conversationId => (
                <Conversation
                    key={conversationId}
                    conversationId={conversationId}
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    setCurrentConversationId={setCurrentConversationId}
                    setView={setView}/>
            )) 
            : null

        content = (
            <div>
                {tableContent}
            </div>
        )
    }

    return content
}
export default ConversationsList