// Optimized homepage data fetching - Single API call instead of multiple

import { BASE_URL } from '../config/baseURL';

// Single function to get all homepage data
export const getHomepageData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/homepage-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      cache: 'default'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch homepage data');
    }

    return data;
  } catch (error) {
    console.error('Homepage data fetch failed:', error);
    throw error;
  }
};

// Fallback functions for individual components (if needed)
export const getBanners = async () => {
  try {
    const data = await getHomepageData();
    return data.data.banners;
  } catch (error) {
    console.error('Banners fetch failed:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const data = await getHomepageData();
    return data.data.categories;
  } catch (error) {
    console.error('Categories fetch failed:', error);
    return [];
  }
};

export const getBrands = async () => {
  try {
    const data = await getHomepageData();
    return data.data.brands;
  } catch (error) {
    console.error('Brands fetch failed:', error);
    return [];
  }
};

export const getFeaturedProducts = async () => {
  try {
    const data = await getHomepageData();
    return data.data.featuredProducts;
  } catch (error) {
    console.error('Featured products fetch failed:', error);
    return [];
  }
};

export const getNewProducts = async () => {
  try {
    const data = await getHomepageData();
    return data.data.newProducts;
  } catch (error) {
    console.error('New products fetch failed:', error);
    return [];
  }
};

export const getBestSellers = async () => {
  try {
    const data = await getHomepageData();
    return data.data.bestSellers;
  } catch (error) {
    console.error('Best sellers fetch failed:', error);
    return [];
  }
};

export const getShowcaseProducts = async (categorySlug) => {
  try {
    const data = await getHomepageData();
    return data.data.showcaseCategories[categorySlug] || [];
  } catch (error) {
    console.error(`Showcase products fetch failed for ${categorySlug}:`, error);
    return [];
  }
};

// Performance monitoring function
export const logPerformanceMetrics = (startTime, endTime, dataSize) => {
  const loadTime = endTime - startTime;
  console.log('Homepage Performance Metrics:', {
    loadTime: `${loadTime}ms`,
    dataSize: `${(dataSize / 1024).toFixed(2)}KB`,
    timestamp: new Date().toISOString()
  });

  // Send to analytics if available
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_load_time', {
      event_category: 'Performance',
      event_label: 'Homepage',
      value: loadTime
    });
  }
};

// Cache management
let homepageDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedHomepageData = async () => {
  const now = Date.now();
  d
  if (homepageDataCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached homepage data');
    return homepageDataCache;
  }

  // Fetch fresh data
  const startTime = performance.now();
  const data = await getHomepageData();
  const endTime = performance.now();

  // Cache the data
  homepageDataCache = data;
  cacheTimestamp = now;

  // Log performance
  const dataSize = JSON.stringify(data).length;
  logPerformanceMetrics(startTime, endTime, dataSize);

  return data;
};

// Clear cache function
export const clearHomepageCache = () => {
  homepageDataCache = null;
  cacheTimestamp = null;
  console.log('Homepage cache cleared');
};
