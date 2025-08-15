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

export const getMyOrders = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/order/${userId}`, { withCredentials: true })
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
