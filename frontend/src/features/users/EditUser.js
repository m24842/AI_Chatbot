import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectUserById } from "./usersApiSlice"
import EditUserForm from "./EditUserForm"
import useAuth from "../../hooks/useAuth"
import { selectCurrentId } from "../auth/authSlice"

const EditUser = ({uid, setView, setCurrentConversationId, setEditingUserId}) => {
    const loggedInUserId = useSelector(selectCurrentId)
    let {id} = useParams()
    if (uid) {
        id = uid
    }
    const loggedInUser = useSelector(state => selectUserById(state, loggedInUserId))
    const user = useSelector(state => selectUserById(state, id))
    const {role} = useAuth()
    const isAdmin = role === 'Admin'

    if (!isAdmin && loggedInUserId !== id || !loggedInUser?.active) {
        return <div className="errmsg">Unauthorized</div>
    }

    const content = user ? <EditUserForm user={user} setView={setView} setCurrentConversationId={setCurrentConversationId} setEditingUserId={setEditingUserId} /> : <p>Loading...</p>

    return content
}
export default EditUser