
const ReservationReducer=(state, action) => {
    
    switch(action.type) {

        case "SET_RESERVATION":
            return {
                ...state,
                reservation: action.payload,
                reservations: [...state.reservations, action.payload]
            }
        // case TYPES.OBTENER_CATEGORIA:
        //     return {
        //         ...state,
        //         categoria: action.payload
        //     }
        case "GET_RESERVATIONS":
            return {
                ...state,
                reservations: action.payload
            }
        case "UPDATE_RESERVATION":
            return {
                ...state,
                reservations: state.reservations.map(reservation => reservation.id === action.payload.id ? action.payload : reservation)
            }
        // case TYPES.ELIMINAR_CATEGORIA:
        //     return {
        //         ...state,
        //         categorias: state.categorias.filter(categoria => categoria.id !== action.payload.id)
        //     }
        default:
            return state;
    }
}
export default ReservationReducer