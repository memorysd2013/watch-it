/**
 * Fetch 工具函數 - 替代 axios
 * 提供統一的 HTTP 請求接口
 */

// 預設配置
const DEFAULT_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors', // 明確指定 CORS 模式
  credentials: 'omit', // 不發送憑證
};

/**
 * 創建 URL 查詢參數
 * @param {Object} params - 查詢參數對象
 * @returns {string} - 查詢字符串
 */
const createQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * 創建完整的 URL
 * @param {string} baseURL - 基礎 URL
 * @param {Object} params - 查詢參數
 * @returns {string} - 完整 URL
 */
const createURL = (baseURL, params = {}) => {
  const queryString = createQueryString(params);
  return `${baseURL}${queryString}`;
};

/**
 * 處理響應
 * @param {Response} response - Fetch 響應對象
 * @returns {Promise<any>} - 解析後的數據
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
    
    // 嘗試獲取錯誤詳情
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      }
    } catch (e) {
      // 忽略解析錯誤
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

/**
 * 創建 AbortController 用於超時控制
 * @param {number} timeout - 超時時間（毫秒）
 * @returns {Object} - 包含 controller 和 timeoutId 的對象
 */
const createTimeoutController = (timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  return { controller, timeoutId };
};

/**
 * 通用請求函數
 * @param {string} url - 請求 URL
 * @param {Object} options - 請求選項
 * @returns {Promise<any>} - 響應數據
 */
const request = async (url, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_CONFIG.timeout,
    params = {},
    ...otherOptions
  } = options;

  // 創建完整 URL
  const fullURL = createURL(url, params);
  
  // 合併標頭
  const mergedHeaders = {
    ...DEFAULT_CONFIG.headers,
    ...headers,
  };

  // 準備請求配置
  const requestConfig = {
    method: method.toUpperCase(),
    headers: mergedHeaders,
    signal: undefined,
    ...otherOptions,
  };

  // 處理請求體
  if (body && method.toUpperCase() !== 'GET') {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      requestConfig.body = JSON.stringify(body);
    } else {
      requestConfig.body = body;
    }
  }

  // 創建超時控制器
  const { controller, timeoutId } = createTimeoutController(timeout);
  requestConfig.signal = controller.signal;

  try {
    const response = await fetch(fullURL, requestConfig);
    const data = await handleResponse(response);
    
    // 清除超時計時器
    clearTimeout(timeoutId);
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: requestConfig,
    };
  } catch (error) {
    // 清除超時計時器
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    // 改善 CORS 和網路錯誤的錯誤信息
    if (error.message.includes('Failed to fetch')) {
      const corsError = new Error(`Network error: Unable to fetch from ${fullURL}. This may be due to CORS policy or network connectivity issues.`);
      corsError.name = 'NetworkError';
      corsError.code = 'CORS_ERROR';
      throw corsError;
    }
    
    throw error;
  }
};

/**
 * GET 請求
 * @param {string} url - 請求 URL
 * @param {Object} options - 請求選項
 * @returns {Promise<any>} - 響應數據
 */
export const get = (url, options = {}) => {
  return request(url, { ...options, method: 'GET' });
};

/**
 * POST 請求
 * @param {string} url - 請求 URL
 * @param {any} data - 請求數據
 * @param {Object} options - 請求選項
 * @returns {Promise<any>} - 響應數據
 */
export const post = (url, data, options = {}) => {
  return request(url, { ...options, method: 'POST', body: data });
};

/**
 * PUT 請求
 * @param {string} url - 請求 URL
 * @param {any} data - 請求數據
 * @param {Object} options - 請求選項
 * @returns {Promise<any>} - 響應數據
 */
export const put = (url, data, options = {}) => {
  return request(url, { ...options, method: 'PUT', body: data });
};

/**
 * DELETE 請求
 * @param {string} url - 請求 URL
 * @param {Object} options - 請求選項
 * @returns {Promise<any>} - 響應數據
 */
export const del = (url, options = {}) => {
  return request(url, { ...options, method: 'DELETE' });
};

/**
 * PATCH 請求
 * @param {string} url - 請求 URL
 * @param {any} data - 請求數據
 * @param {Object} options - 請求選項
 * @returns {Promise<any>} - 響應數據
 */
export const patch = (url, data, options = {}) => {
  return request(url, { ...options, method: 'PATCH', body: data });
};

/**
 * 創建 API 客戶端實例
 * @param {Object} config - 客戶端配置
 * @returns {Object} - API 客戶端對象
 */
export const createClient = (config = {}) => {
  const clientConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return {
    get: (url, options = {}) => get(url, { ...options, ...clientConfig }),
    post: (url, data, options = {}) => post(url, data, { ...options, ...clientConfig }),
    put: (url, data, options = {}) => put(url, data, { ...options, ...clientConfig }),
    delete: (url, options = {}) => del(url, { ...options, ...clientConfig }),
    patch: (url, data, options = {}) => patch(url, data, { ...options, ...clientConfig }),
  };
};

/**
 * 預設 API 客戶端
 */
export const apiClient = createClient();

// 導出所有函數
export default {
  get,
  post,
  put,
  delete: del,
  patch,
  createClient,
  apiClient,
  request,
};
