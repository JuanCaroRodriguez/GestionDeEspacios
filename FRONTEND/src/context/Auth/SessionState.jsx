import AuthToken from '@/api/AuthToken'
import { ROUTES } from '@/tools/CONSTANTS'
import { node } from '@/tools/Types'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { API_PROTOTYPES } from '../../api/services'
import { guardarEnLocalStorage } from '../../tools/utils'
import SessionContext from './SessionContext'

function SessionState({ children }) {

  const [session, setSession] = useState()
  const [loading_auth, setLoading] = useState(false)
  const navigate = useNavigate()


  const handleLogin = useCallback(async (data) => {
    try {
      setLoading(true)
      const response = await API_PROTOTYPES.auth.login(data)
      setLoading(false)
      if (response?.token) {
        guardarEnLocalStorage('session', response)
        setSession(response)
        navigate(ROUTES.dashboard.home)
      }


      return response
    } catch (error) {
      setLoading(false)
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
    guardarEnLocalStorage('session', null)
    setLoading(false)
    navigate(ROUTES.auth.welcome)
  }, [])

  const handleAuthVerify = useCallback(async () => {
    const session = await AuthToken()
    const isAuthRute=window.location.pathname === ROUTES.auth.login || window.location.pathname === ROUTES.auth.register || window.location.pathname === ROUTES.auth.welcome
  
    if (isAuthRute && session) {
      setSession(session)
      navigate(ROUTES.dashboard.home)
    }else if (!isAuthRute && !session) {
      setSession(null)
      navigate(ROUTES.auth.welcome)
    }else{
      setSession(session)
    }
  }, [navigate])

  const handleUpdate = useCallback(async (data) => {
    try {
      setLoading(true)
      // console.log(data, 'data update')
      const response = await API_PROTOTYPES.auth.update(data)
      setLoading(false)
      if (response?.token) {
        guardarEnLocalStorage('session', response)
        // alert('Datos actualizados')
        console.log(response, 'response')
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