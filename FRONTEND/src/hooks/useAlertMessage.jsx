import { useCallback } from "react"
import { useSnackContext } from "../context/Snack"

function useAlertMessage() {
    const { setInfo } = useSnackContext()

    const showMessage = useCallback((response,ignore200=false) => {
        const value = response?.status
        if (ignore200 && value == 200) return
        setInfo({
          type: value == 200 ? "success" : 
                value == 401 ? "warning" : 
                value == 404 ? "warning" : 
                value == 500 ? "error" : "info",
          message: response?.msg
        })
      }, [setInfo])

      return {
        showMessage
      }
}

export default useAlertMessage