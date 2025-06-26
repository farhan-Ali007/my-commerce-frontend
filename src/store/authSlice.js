import { createSlice } from '@reduxjs/toolkit';

// Hydrate initial state from sessionStorage if available
const sessionUser = sessionStorage.getItem('user');
const initialState = {
    user: sessionUser ? JSON.parse(sessionUser) : null,
    isAuthenticated: !!sessionUser,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = true;
            sessionStorage.setItem('user', JSON.stringify(action.payload));
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            sessionStorage.removeItem('user');
        }
    }
})

export const { setUser, login, logout } = authSlice.actions;
export default authSlice.reducer;