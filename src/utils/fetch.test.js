/**
 * Fetch 工具函數測試
 * 用於驗證 fetch 替代 axios 的功能
 */

import { apiClient, get, post } from './fetch.js';

// 測試函數
export const testFetchUtils = async () => {
  console.log('🧪 開始測試 Fetch 工具函數...');
  
  try {
    // 測試 1: GET 請求
    console.log('📡 測試 GET 請求...');
    const getResponse = await get('https://api.exchangerate-api.com/v4/latest/USD');
    console.log('✅ GET 請求成功:', getResponse.status);
    
    // 測試 2: 帶參數的 GET 請求
    console.log('📡 測試帶參數的 GET 請求...');
    const getWithParamsResponse = await get('https://api.exchangerate-api.com/v4/latest/USD', {
      params: { base: 'USD' }
    });
    console.log('✅ 帶參數 GET 請求成功:', getWithParamsResponse.status);
    
    // 測試 3: 超時測試
    console.log('⏰ 測試超時功能...');
    try {
      await get('https://httpbin.org/delay/15', { timeout: 5000 });
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('✅ 超時功能正常');
      } else {
        throw error;
      }
    }
    
    // 測試 4: 錯誤處理
    console.log('❌ 測試錯誤處理...');
    try {
      await get('https://httpbin.org/status/404');
    } catch (error) {
      if (error.message.includes('404')) {
        console.log('✅ 錯誤處理正常');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 所有測試通過！');
    return true;
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
    return false;
  }
};

// 測試 API 客戶端
export const testAPIClient = async () => {
  console.log('🧪 開始測試 API 客戶端...');
  
  try {
    // 測試匯率 API
    console.log('💱 測試匯率 API...');
    const rateResponse = await apiClient.get('https://api.exchangerate-api.com/v4/latest/USD');
    console.log('✅ 匯率 API 測試成功:', rateResponse.data.base);
    
    // 測試加密貨幣 API
    console.log('₿ 測試加密貨幣 API...');
    const cryptoResponse = await apiClient.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd'
      }
    });
    console.log('✅ 加密貨幣 API 測試成功:', cryptoResponse.data.bitcoin);
    
    console.log('🎉 API 客戶端測試通過！');
    return true;
    
  } catch (error) {
    console.error('❌ API 客戶端測試失敗:', error);
    return false;
  }
};

// 運行所有測試
export const runAllTests = async () => {
  console.log('🚀 開始運行所有測試...');
  
  const fetchTest = await testFetchUtils();
  const apiTest = await testAPIClient();
  
  if (fetchTest && apiTest) {
    console.log('🎊 所有測試都通過了！Fetch 工具函數工作正常。');
    return true;
  } else {
    console.log('💥 部分測試失敗，請檢查問題。');
    return false;
  }
};

// 如果在瀏覽器環境中，將測試函數添加到 window 對象
if (typeof window !== 'undefined') {
  window.testFetchUtils = testFetchUtils;
  window.testAPIClient = testAPIClient;
  window.runAllTests = runAllTests;
}
