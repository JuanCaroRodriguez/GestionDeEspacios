import { useContext } from 'react';
import SessionContext from './SessionContext';

function useSession() {
 return useContext(SessionContext)
}

export default useSession;