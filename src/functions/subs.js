import axios from 'axios'
import { BASE_URL } from '../config/baseURL'


export const createSub = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/sub/create`, data, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        return response?.data;
    } catch (error) {
        console.log("Error in creating category")
    }
}

export const getAllSubs = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/sub/all`, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in fetching all categories.")
    }
}

export const deleteSub = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/sub/delete/${id}`, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in deleting category")
    }
}