import { useEffect, useReducer } from 'react';

import { node } from '@/tools/Types';

import useSession from '../Auth/useSession';
import ReservationContext from './ReservationContext';
import ReservationReducer from './ReservationReducer';

import { API_PROTOTYPES } from '../../api/services';



const ReservationState = ({ children }) => {

    const { session } = useSession()

    console.log(session, "linea 20")
    const initialState = {
        reservation: null,
        reservations: []
    }

    const [state, dispatch] = useReducer(ReservationReducer, initialState);


    const insertReservation = async (data) => {
        try {
            const parts = data.reservationDate.split('-');
            const [year, month, day] = parts;
        
            const normalizedYear = year.padStart(4, '0');
            const normalizedMonth = month.padStart(2, '0');
            const normalizedDay = day.padStart(2, '0');

            data.reservationDate = `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
            console.log(data);

            let respuesta = await API_PROTOTYPES.reservation.post(data);
            const res = await API_PROTOTYPES.auth.getAll();

            respuesta = {
                ...respuesta,
                reservation: {
                    ...respuesta.reservation,
                    userName: res.users.find(user => user.id === respuesta.reservation.userId).name
                }
            };
                        
            dispatch({
                type: "SET_RESERVATION",
                payload: respuesta.reservation
            })
        } catch (error) {
            console.log(error)
        }
    }

    const getReservation = async (userId) => {
        try {
            let respuesta = await API_PROTOTYPES.reservation.get(userId);
            const res = await API_PROTOTYPES.auth.getAll();

            respuesta = {
                ...respuesta,
                reservations: respuesta.reservations.map(reservation => {
                    const user = res.users.find(user => user.id === reservation.userId);
                    return {
                        ...reservation,
                        userName: user ? user.name : 'Unknown'
                    };
                })
            };


            
            
            dispatch({
                type: "GET_RESERVATIONS",
                payload: respuesta.reservations
            })
            

        } catch (error) {
            console.log(error)
        }
    }

    const getAllReservations = async () => {
        try {
            let respuesta = await API_PROTOTYPES.reservation.getAll();
            const res = await API_PROTOTYPES.auth.getAll();

            respuesta = {
                ...respuesta,
                reservations: respuesta.reservations.map(reservation => {
                    const user = res.users.find(user => user.id === reservation.userId);
                    return {
                        ...reservation,
                        userName: user ? user.name : 'Unknown'
                    };
                })
            };

            console.log(respuesta, "linea 78")
            
            dispatch({
                type: "GET_RESERVATIONS",
                payload: respuesta.reservations
            })
        } catch (error) {
            console.log(error)
        }
    }

    const updateReservation = async (data) => {
        try {
            let respuesta = await API_PROTOTYPES.reservation.put(data);
            const res = await API_PROTOTYPES.auth.getAll();

            respuesta = {
                ...respuesta,
                reservation: {
                    ...respuesta.reservation,
                    userName: res.users.find(user => user.id === respuesta.reservation.userId).name
                }
            };            

            if (respuesta.reservation !== null){
                dispatch({
                    type: "UPDATE_RESERVATION",
                    payload: respuesta.reservation
                })
            }
            
        } catch (error) {
            console.log(error)
        }   
    }

    // const deleteCategoria = async (id) => {
    //     try {
    //         const respuesta = await API_PROTOTYPES.categorias.delete(id)
    //         showMessage(respuesta)

    //         dispatch({
    //             type: TYPES.ELIMINAR_CATEGORIA,
    //             payload: { ...respuesta.data, id: id }
    //         })
    //     } catch (error) {
    //         showMessage(error.response.data)
    //     }
    // }

    useEffect(() => {
        if (session){
            const userId = session.user.id ? session.user.id : session.user.uuid;
            if (session.user.role === "administrativo"){
                getAllReservations()
            } else {
                getReservation(userId)
            }
            console.log(userId, "linea 108")
        }
    }, [session]);

    return (
        <ReservationContext.Provider
            value={{
                reservation: state.reservation,
                reservations: state.reservations,
                // getCategoria,
                insertReservation,
                getReservation,
                updateReservation,
                getAllReservations
            }}
        >
            {children}
        </ReservationContext.Provider>
    )
}

ReservationState.propTypes = {
    children: node
}
export default ReservationState;