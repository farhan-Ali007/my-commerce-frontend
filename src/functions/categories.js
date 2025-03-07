import axios from 'axios'
import { BASE_URL } from '../config/baseURL'


export const createCategory = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/category/create`, data, {
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

export const getAllCategories = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/category/getAll`, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in fetching all categories.")
    }
}

export const deleteCategory = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/category/${id}`, { withCredentials: true })
        return response?.data
    } catch (error) {
        console.log("Error in deleting category")
    }
}