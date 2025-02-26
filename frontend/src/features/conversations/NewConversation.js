import {useSelector} from 'react-redux'
import NewConversationForm from './NewConversationForm'

const NewConversation = ({setView, setCurrentConversationId, setShowNewConversation}) => {
    const {id} = useSelector(state => state.auth)

    const content = id ? <NewConversationForm uid={id} setView={setView} setCurrentConversationId={setCurrentConversationId} setShowNewConversation={setShowNewConversation}/> : <p>Loading...</p>
    
    return content
}
export default NewConversation