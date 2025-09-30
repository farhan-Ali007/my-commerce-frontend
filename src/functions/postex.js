import axios from 'axios';
import { BASE_URL } from '../config/baseURL';

// PostEx API functions for frontend
const postexAPI = {
  /**
   * Push single order to PostEx
   */
  pushOrder: async (orderId) => {
    try {
      const response = await axios.post(`${BASE_URL}/postex/push-order/${orderId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('PostEx push order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to push order to PostEx');
    }
  },

  /**
   * Track order in PostEx by CN
   */
  trackOrderByCN: async (cn) => {
    try {
      const response = await axios.get(`${BASE_URL}/postex/track-by-cn/${encodeURIComponent(cn)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('PostEx track order by CN error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to track order');
    }
  },

  /**
   * Cancel order in PostEx
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await axios.post(`${BASE_URL}/postex/cancel/${orderId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('PostEx cancel order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to cancel order');
    }
  },

  /**
   * Get PostEx cities
   */
  getCities: async (operationalCityType) => {
    try {
      const response = await axios.get(`${BASE_URL}/postex/cities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: operationalCityType ? { operationalCityType } : undefined
      });

      return response.data;
    } catch (error) {
      console.error('PostEx get cities error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cities');
    }
  },

  /**
   * Get PostEx service status
   */
  getStatus: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/postex/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('PostEx get status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get PostEx status');
    }
  },

  /**
   * Bulk push orders to PostEx
   */
  bulkPushOrders: async (orderIds) => {
    try {
      const response = await axios.post(`${BASE_URL}/postex/bulk-push`, 
        { orderIds },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('PostEx bulk push error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to bulk push orders');
    }
  },

  /**
   * Get PostEx order types
   */
  getOrderTypes: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/postex/order-types`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('PostEx get order types error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order types');
    }
  }
};

export default postexAPI;
