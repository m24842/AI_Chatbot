import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Public from './components/Public'
import Login from './features/auth/Login'
import DashLayout from './components/DashLayout'
import Welcome from './features/auth/Welcome'
import ConversationsList from './features/conversations/ConversationsList'
import UsersList from './features/users/UsersList'
import EditUser from './features/users/EditUser'
import NewConversation from './features/conversations/NewConversation'
import Prefetch from './features/auth/Prefetch'
import PersistLogin from './features/auth/PersistLogin'
import NewUser from './features/users/NewUser'
import RequireAuth from './features/auth/RequireAuth'
import {ROLES} from './config/roles'
import {useState} from 'react'

function App() {
  const [view, setView] = useState('')
  const [currentConversationId, setCurrentConversationId] = useState('')
  const [editingUserId, setEditingUserId] = useState('')

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Public />} />
        <Route path="login">
          <Route index element={<Login setView={setView} setCurrentConversationId={setCurrentConversationId}/>} />
          <Route path="new" element={<NewUser fullSize={true} />} />
        </Route>

        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}>
            <Route element={<Prefetch />}>
              <Route path="dash" element={<DashLayout view={view} currentConversationId={currentConversationId} setView={setView} setCurrentConversationId={setCurrentConversationId} setEditingUserId={setEditingUserId} />}>

              <Route index element={<Welcome view={view} currentConversationId={currentConversationId} editingUserId={editingUserId} setView={setView} setCurrentConversationId={setCurrentConversationId} setEditingUserId={setEditingUserId} />} />

                <Route path="users">
                  <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                    <Route index element={<UsersList setView={setView} setEditingUserId={setEditingUserId} />} />
                  </Route>
                  <Route path=":id" element = {<EditUser />}></Route>
                </Route>

                <Route path="conversations">
                  <Route index element={<ConversationsList />} />
                  <Route path = "new" element = {<NewConversation />}></Route>
                </Route>

              </Route>{/* End Dash */}
            </Route>{/* End Prefetch */}
          </Route>{/* End RequireAuth */}
        </Route>{/* End PersistLogin */}

      </Route>
    </Routes>
  )
}

export default App
