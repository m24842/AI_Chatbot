import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentActive } from "../features/auth/authSlice"
import { jwtDecode } from 'jwt-decode'

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    const active = useSelector(selectCurrentActive)
    let isAdmin = false
    let status = "User"

    if (token) {
        const decoded = jwtDecode(token)
        const { username, role, active } = decoded.UserInfo

        isAdmin = role === 'Admin'

        if (isAdmin) status = "Admin"

        return { active, username, role, status, isAdmin }
    }

    return { active: false, username: '', role: '', isAdmin, status }
}
export default useAuth