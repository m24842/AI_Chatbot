import { useLocation } from "react-router-dom"
import NewUserForm from "./NewUserForm"

const NewUser = ({fullSize}) => {
    const content = <NewUserForm fullSize={fullSize} />

    return content
}
export default NewUser