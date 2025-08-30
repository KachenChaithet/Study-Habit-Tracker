import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [user, setUser] = useState(() => {
        const t = localStorage.getItem('token')
        return t ? decodeToken(t) : null
    })


    // ถ้ามี token เปลี่ยน ให้ update user ด้วย
    useEffect(() => {
        if (token) {
            setUser(decodeToken(token))
        } else {
            setUser(null)
        }
    }, [token])

    const login = (newToken) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

export function decodeToken(token) {
    if (!token) return null
    try {
        return jwtDecode(token)  // คืนค่า payload ของ JWT
    } catch (error) {
        return null
    }
}

export function getCurrentUser() {
    const token = localStorage.getItem('token')
    return decodeToken(token)
}
