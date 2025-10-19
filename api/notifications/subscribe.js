// API 路由: 訂閱推播通知
import webpush from 'web-push'

// 設定 VAPID 金鑰
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF3N3QbLYXopXD2XJpN5KFHvS0buXg3x1CJHBw2eGz8ZUrJ8L7rY8rE', // 公鑰
  'your-private-key-here' // 私鑰
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscription } = req.body

    if (!subscription) {
      return res.status(400).json({ error: '缺少訂閱資訊' })
    }

    // 驗證訂閱格式
    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: '訂閱格式不正確' })
    }

    // 這裡應該將訂閱資訊儲存到資料庫
    // 為了示範，我們只記錄到 console
    console.log('新的推播訂閱:', {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      timestamp: new Date().toISOString()
    })

    // 發送測試通知
    try {
      await webpush.sendNotification(subscription, JSON.stringify({
        title: '✅ 訂閱成功',
        body: '您已成功訂閱 Watch It 推播通知！',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: {
          type: 'subscription-success',
          timestamp: new Date().toISOString()
        }
      }))
    } catch (notificationError) {
      console.error('發送測試通知失敗:', notificationError)
      // 不影響訂閱流程，繼續執行
    }

    return res.status(200).json({
      success: true,
      message: '訂閱成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('訂閱推播通知失敗:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
