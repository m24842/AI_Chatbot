import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectUserById } from "../users/usersApiSlice"
import { selectConversationById } from "./conversationsApiSlice"
import EditConversationForm from "./EditConversationForm"

const EditConversation = () => {
    const {id, uid} = useParams()

    const user = useSelector(state => selectUserById(state, uid))

    const conversation = useSelector(state => selectConversationById(state, id))

    const content = conversation ? <EditConversationForm conversation = {conversation} user = {user} /> : <p>Loading...</p>

    return content
}
export default EditConversation