/**
 * CORS 代理服務器
 * 用於解決瀏覽器 CORS 限制問題
 */

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// 啟用 CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 解析 JSON
app.use(express.json());

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CORS Proxy Server is running' });
});

// 匯率 API 代理
app.use('/api/exchangerate', createProxyMiddleware({
  target: 'https://api.exchangerate-api.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/exchangerate': ''
  },
  onError: (err, req, res) => {
    console.error('ExchangeRate API Proxy Error:', err);
    res.status(500).json({ error: 'ExchangeRate API proxy error' });
  }
}));

// 加密貨幣 API 代理
app.use('/api/coingecko', createProxyMiddleware({
  target: 'https://api.coingecko.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/coingecko': ''
  },
  onError: (err, req, res) => {
    console.error('CoinGecko API Proxy Error:', err);
    res.status(500).json({ error: 'CoinGecko API proxy error' });
  }
}));

// Alpha Vantage API 代理
app.use('/api/alphavantage', createProxyMiddleware({
  target: 'https://www.alphavantage.co',
  changeOrigin: true,
  pathRewrite: {
    '^/api/alphavantage': ''
  },
  onError: (err, req, res) => {
    console.error('Alpha Vantage API Proxy Error:', err);
    res.status(500).json({ error: 'Alpha Vantage API proxy error' });
  }
}));

// 通用代理端點
app.use('/api/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  router: (req) => {
    const target = req.query.target;
    if (!target) {
      throw new Error('Target URL is required');
    }
    return target;
  },
  pathRewrite: (path, req) => {
    return path.replace('/api/proxy', '');
  },
  onError: (err, req, res) => {
    console.error('Generic Proxy Error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.originalUrl} not found` 
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💱 ExchangeRate API: http://localhost:${PORT}/api/exchangerate`);
  console.log(`₿ CoinGecko API: http://localhost:${PORT}/api/coingecko`);
  console.log(`📈 Alpha Vantage API: http://localhost:${PORT}/api/alphavantage`);
});

export default app;
