import axios from 'axios'
import { BASE_URL } from '../config/baseURL'


export const createProduct = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/product/create`, data, {
            withCredentials: true, headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        return response?.data;
    } catch (error) {
        console.log("Error in product creating ", error)
    }
}

export const getMyProducts = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/product/my-products`, { withCredentials: true })
        return response?.data;
    } catch (error) {
        console.log("Error in getting my products", error)
    }
}

export const getAllProducts = async (page = 1, limit = 8) => {
    console.log("Page in get all products", page)
    try {
        const response = await axios.get(`${BASE_URL}/product/getAll?page=${page}&limit=${limit}`,
            { withCredentials: true })
        // console.log("Response from get all products api--------->", response)
        return response?.data
    } catch (error) {
        console.log("Error in getting all products", error)
    }
}

export const deleteProduct = async (id) => {
    try {
        // console.log("Deleting product with ID:", id);
        const response = await axios.delete(`${BASE_URL}/product/${id}`, { withCredentials: true });
        // console.log("Response from delete product api-------->", response);
        return response?.data;
    } catch (error) {
        console.log("Error in deleting my product", error);
    }
}

export const updateProduct = async (slug, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/product/${slug}`, data, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        return response?.data
    } catch (error) {
        console.log("Error in updating product ", error)
    }
}

export const getProductBySlug = async (slug) => {
    try {
        // console.log("Coming slug from param----> ", slug)
        const response = await axios.get(`${BASE_URL}/product/${slug}`, { withCredentials: true });
        return response?.data;
    } catch (error) {
        console.log("Error in getting product by slug", error);
    }
}

export const createProductReview = async (productSlug, reviewerId, data) => {
    try {
        const response = await axios.post(`${BASE_URL}/review/create/${productSlug}/${reviewerId}`, data, {
            withCredentials: true
        })
        return response?.data;
    } catch (error) {
        console.log("Error in creating product review. ", error)
    }
}

export const getReviewsBySlug = async (slug) => {
    // console.log("Slug in reviews ------>", slug)
    try {
        const response = await axios.get(`${BASE_URL}/review/${slug}`)
        return response?.data;
    } catch (error) {
        console.log("Error in getting product review by slug.", error)
    }
}

export const getRelatedProducts = async (categoryId, excludeProductId) => {
    try {
        const response = await axios.get(`${BASE_URL}/product/related/${categoryId}/${excludeProductId}`)
        return response?.data;
    } catch (error) {
        console.log("Error in getting related products", error)
    }
}

export const getBestSellers = async (page = 1, limit = 6) => {
    try {
        const response = await axios.get(`${BASE_URL}/product/best-sellers?page=${page}&limit=${limit}`);
        return response?.data;
    } catch (error) {
        console.log("Error in getting best sellers", error)
    }
}

export const getProductsBySub = async (subCategory, page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${BASE_URL}/product/sub/${subCategory}`, {
            params: {
                page,
                limit
            }
        });
        return response?.data;
    } catch (error) {
        console.log("Error in getting products by subCategory ", error);
        throw error;
    }
}

export const getProductsByBrand = async (brand, page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${BASE_URL}/search/filter/${brand}`, {
            params: {
                page,
                limit
            }
        });
        return response?.data;
    } catch (error) {
        console.log("Error in getting products by brand", error);
        throw error;
    }
}

export const getFeaturedProducts = async (page = 1, limit = 8) => {
    try {
        const response = await axios.get(`${BASE_URL}/product/featured?page=${page}&limit=${limit}`)
        return response?.data;
    } catch (error) {
        console.log("Error in getting featured products", error)
    }
}

export const getNewArrivals = async (page = 1, limit = 8) => {
    try {
        const response = await axios.get(`${BASE_URL}/product/new-arrivals?page=${page}&limit=${limit}`)
        return response?.data;
    } catch (error) {
        console.log("Error in getting new arrivals", error)
    }
}






