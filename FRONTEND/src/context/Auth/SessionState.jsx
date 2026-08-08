import AuthToken from '@/api/AuthToken'
import { ROUTES } from '@/tools/CONSTANTS'
import { node } from '@/tools/Types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { API_PROTOTYPES } from '../../api/services'
import { guardarEnLocalStorage } from '../../tools/utils'
import SessionContext from './SessionContext'

const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function SessionState({ children }) {

  const [session, setSession] = useState()
  const [loading_auth, setLoading] = useState(false)
  const navigate = useNavigate()
  const logoutTimerRef = useRef(null)

  const handleLogin = useCallback(async (data) => {
    try {
      setLoading(true)
      const response = await API_PROTOTYPES.auth.login(data)
      setLoading(false)
      
      
      if (response && (response.success || response.token || response.user)) {
        guardarEnLocalStorage('session', response)
        await AuthToken()   // registra el interceptor con el token recién obtenido
        setSession(response)
        
      } else {
      }

      return response
    } catch (error) {
      setLoading(false)
      console.error('Login error:', error)
      return error
    }

  }, [])

  const handleSignUp = useCallback(async (data) => {
    try {
      setLoading(true)
      const response = await API_PROTOTYPES.auth.register(data)
      setLoading(false)
      return response
    } catch (error) {
      setLoading(false)
      return error
    }

  }, [])

  const handleLogOut = useCallback(() => {
    setLoading(true)
    setSession(null)
    localStorage.clear()
    setLoading(false)
    navigate(ROUTES.auth.login)
  }, [])

  const handleAuthVerify = useCallback(async () => {
    const session = await AuthToken()
    const isAuthRute=window.location.pathname === ROUTES.auth.login || window.location.pathname === ROUTES.auth.register
  
    if (isAuthRute && session) {
      
      setSession(session)
      navigate(ROUTES.dashboard.home)
    }else if (!isAuthRute && !session) {
      
      setSession(null)
      navigate(ROUTES.auth.login)
    }else{
      
      setSession(session)
    }
  }, [navigate])

  const handleUpdate = useCallback(async (data) => {
    try {
      setLoading(true)
      const response = await API_PROTOTYPES.auth.update(data)
      setLoading(false)
      if (response?.token) {
        guardarEnLocalStorage('session', response)
        setSession(response)
      }
      return response
    } catch (error) {
      alert(error?.response.data.message)
      setLoading(false)
      return error
    }
  }, [])


  useEffect(() => {
    setLoading(true)
    handleAuthVerify()
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
    if (session?.token) {
      const decoded = decodeJwt(session.token)
      if (decoded?.exp) {
        const msUntilExpiry = decoded.exp * 1000 - Date.now()
        if (msUntilExpiry > 0) {
          logoutTimerRef.current = setTimeout(() => {
            handleLogOut()
          }, msUntilExpiry)
        } else {
          handleLogOut()
        }
      }
    }
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    }
  }, [session, handleLogOut])

  return (
    <SessionContext.Provider value={{
      session,
      handleAuthVerify,
      handleSignUp,
      handleLogin,
      handleLogOut,
      handleUpdate,
      loading_auth
    }}>
      {children}
    </SessionContext.Provider>
  )
}
SessionState.propTypes = {
  children: node.isRequired
}
export default SessionState