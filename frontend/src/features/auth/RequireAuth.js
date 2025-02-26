import { useLocation, Navigate, Outlet } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useEffect, useState } from "react"

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation()
    const { role, active } = useAuth()

    const isAuthenticated = allowedRoles.includes(role) && active

    // Render content based on authentication status
    const content = isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} />

    return content
}

export default RequireAuth