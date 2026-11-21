// Vercel Cron Job for Daily Notifications
// 每日上午 9 點執行

const webpush = require('web-push')

// 設定 VAPID 金鑰 (請替換為你的金鑰)
webpush.setVapidDetails(
  '***REMOVED***',
  '***REMOVED***', // 公鑰
  '***REMOVED***-here' // 私鑰
)

// 模擬的用戶訂閱資料 (實際應用中應該從資料庫獲取)
const subscriptions = [
  // 這裡應該從資料庫獲取所有用戶的推播訂閱
  // 格式: { endpoint: '***REMOVED***', keys: { p256dh: '***REMOVED***', auth: '***REMOVED***' } }
]

// 獲取價格資料的函數
async function getPriceData(symbol, type) {
  try {
    let url = ''
    
    switch (type) {
      case 'twse':
        url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${symbol}.tw`
        break
      case 'crypto':
        url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`
        break
      default:
        throw new Error('不支援的類型')
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    // 處理不同 API 的回應格式
    if (type === 'twse' && data.msgArray && data.msgArray.length > 0) {
      const stock = data.msgArray[0]
      return {
        symbol: stock.c,
        name: stock.n,
        price: parseFloat(stock.z) || 0,
        change: parseFloat(stock.y) - parseFloat(stock.z) || 0,
        changePercent: ((parseFloat(stock.y) - parseFloat(stock.z)) / parseFloat(stock.y) * 100) || 0
      }
    } else if (type === 'crypto' && data[symbol.toLowerCase()]) {
      const crypto = data[symbol.toLowerCase()]
      return {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: crypto.usd || 0,
        change: crypto.usd_24h_change || 0,
        changePercent: crypto.usd_24h_change || 0
      }
    }
    
    throw new Error('無法獲取價格資料')
  } catch (error) {
    console.error(`獲取 ${symbol} 價格失敗:`, error)
    return null
  }
}

// 發送推播通知
async function sendNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    console.log('推播通知發送成功')
    return true
  } catch (error) {
    console.error('推播通知發送失敗:', error)
    return false
  }
}

// 生成每日摘要
async function generateDailySummary(watchlist) {
  const summary = {
    total: watchlist.length,
    positive: 0,
    negative: 0,
    unchanged: 0,
    items: []
  }
  
  for (const item of watchlist) {
    try {
      const priceData = await getPriceData(item.symbol, item.type)
      if (priceData) {
        const change = priceData.changePercent
        if (change > 0) summary.positive++
        else if (change < 0) summary.negative++
        else summary.unchanged++
        
        summary.items.push({
          symbol: priceData.symbol,
          name: priceData.name,
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent
        })
      }
    } catch (error) {
      console.error(`處理 ${item.symbol} 失敗:`, error)
    }
  }
  
  return summary
}

// 主函數
export default async function handler(req, res) {
  // 只允許 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // 驗證 Cron 請求 (Vercel 會自動添加 Authorization header)
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    console.log('...')
    
    // 模擬的監控清單 (實際應用中應該從資料庫獲取)
    const watchlist = [
      { symbol: '2330', type: 'twse', name: '台積電' },
      { symbol: 'bitcoin', type: 'crypto', name: 'Bitcoin' }
    ]
    
    // 生成每日摘要
    const summary = await generateDailySummary(watchlist)
    
    // 準備推播訊息
    const payload = {
      title: '📊 每日價格摘要',
      body: `監控 ${summary.total} 個項目\n上漲: ${summary.positive} 個\n下跌: ${summary.negative} 個`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        type: 'daily-summary',
        summary: summary,
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'view',
          title: '查看詳情'
        }
      ]
    }
    
    // 發送推播通知給所有訂閱用戶
    let successCount = 0
    let failCount = 0
    
    for (const subscription of subscriptions) {
      const success = await sendNotification(subscription, payload)
      if (success) {
        successCount++
      } else {
        failCount++
      }
    }
    
    console.log(`推播通知完成: 成功 ${successCount} 個, 失敗 ${failCount} 個`)
    
    return res.status(200).json({
      success: true,
      message: '每日推播通知任務完成',
      summary: {
        totalSubscriptions: subscriptions.length,
        successCount,
        failCount,
        watchlistSummary: summary
      }
    })
    
  } catch (error) {
    console.error('每日推播通知任務失敗:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
