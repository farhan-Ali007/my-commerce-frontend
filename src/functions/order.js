import axios from 'axios'
import { BASE_URL } from '../config/baseURL'


export const placeOrder = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/order/create`,
            data,
            {
                withCredentials: true,
                headers: {
                    'X-Client': 'web',
                },
            }
        )
        return response?.data
    } catch (error) {
        console.log("Erorr in creating order", error)
        throw error;
    }
}

export const getMyOrders = async (userId, guestId) => {
    try {
        const url = `${BASE_URL}/order/${userId || 'guest'}`
        const response = await axios.get(url, {
            withCredentials: true,
            headers: guestId ? { 'X-Guest-Id': guestId } : undefined,
            params: {
                ...(guestId ? { guestId } : {}),
                _t: Date.now(), // cache-busting param to avoid 304/stale caches
            },
        })
        return response?.data
    } catch (error) {
        console.log("Error in fetching my orders", error)
        throw error;
    }
}
export const getAllOrders = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${BASE_URL}/order/all?page=${page}&limit=${limit}`, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in fetching all orders", error)
        throw error
    }
}

export const getRecentOrders = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/order/recents`, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in fetching all orders", error)
        throw error
    }
}

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.patch(`${BASE_URL}/order/${orderId}`, status, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in updating order status", error)
        throw error;
    }
}

// Admin: search orders with live query and status/sort filters
export const getOrdersSearch = async (params = {}) => {
    try {
        const response = await axios.get(`${BASE_URL}/order/search`, {
            withCredentials: true,
            params,
        })
        return response?.data
    } catch (error) {
        console.log("Error in searching orders", error)
        throw error
    }
}

// Admin: sort orders by status with optional filter and pagination
export const getOrdersSortedByStatus = async (params = {}) => {
    try {
        const response = await axios.get(`${BASE_URL}/order/sort`, {
            withCredentials: true,
            params,
        })
        return response?.data
    } catch (error) {
        console.log("Error in sorting orders by status", error)
        throw error
    }
}
