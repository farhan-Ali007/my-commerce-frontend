import axios from 'axios'
import { BASE_URL } from '../config/baseURL'

export const searchProduct = async (data) => {

    if (typeof data !== 'object' || data === null) {
        console.error('Invalid data passed to searchProduct:', data);
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: data,
            withCredentials: true
        });
        return response?.data;
    } catch (error) {
        console.log("Error in searching products", error)
    }
}

export const filterByPrice = async (data) => {
    try {
        // Ensure the key is 'sort' as expected by the backend
        const formattedData = { sort: data.price === 'low' ? 'asc' : 'desc' };
        const response = await axios.get(`${BASE_URL}/search/filter/price`, {
            params: formattedData,
            withCredentials: true,
        });
        return response?.data;
    } catch (error) {
        console.log("Error in filtering by price", error);
    }
};

export const filterByCategory = async (data) => {
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/category`, {
            params: { categoryName: data.categories, subcategory: data.subcategory },
            withCredentials: true,
            paramsSerializer: (params) => new URLSearchParams(params).toString(),
        });
        return response?.data;
    } catch (error) {
        console.log("Error in filtering by category", error);
    }
};

export const filterBySubcategory = async (subcategoryName) => {
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/subcategory`, {
            params: { subcategoryName },
            withCredentials: true
        });
        return response?.data;
    } catch (error) {
        console.log("Error in filtering by subcategory", error);
    }
};

export const filterByRating = async (data) => {
    // console.log("Data in filterByRating-------->", data)
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/rating`, {
            params: data,
            withCredentials: true
        });
        return response?.data;
    } catch (error) {
        console.log("Error in filtering by rating", error)
    }
}

export const getMinMaxPrice = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/min-max-price`);
        return response?.data;
    } catch (error) {
        console.log("Error in fetching min and max price", error)
    }
}

export const filterByPriceRange = async (data) => {
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/price-range`, {
            params: { minPrice: data.min, maxPrice: data.max }, // Ensure correct keys
            withCredentials: true
        });
        return response?.data;
    } catch (error) {
        console.log("Error in filtering by price range", error);
    }
};

export const filterProductsByBrand = async (brand) => {
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/${brand}`);
        return response?.data;
    } catch (error) {
        console.log("Error in filtering by brand", error);
    }
}


