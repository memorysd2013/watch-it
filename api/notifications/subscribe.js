// API 路由: 訂閱推播通知
import webpush from 'web-push'

// 設定 VAPID 金鑰（從環境變數讀取）
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:your-email@example.com'

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn('⚠️  警告: VAPID 密鑰未設定！請執行 "npm run generate-vapid" 生成密鑰')
}

// 驗證公鑰格式（Safari 兼容性）
if (vapidPublicKey) {
  try {
    const decoded = Buffer.from(vapidPublicKey, 'base64')
    if (decoded.length !== 65) {
      console.error('❌ VAPID 公鑰長度不正確:', decoded.length, 'bytes (應為 65 bytes)')
      console.error('請執行 "npm run generate-vapid" 生成新的密鑰對')
    }
  } catch (e) {
    console.error('❌ VAPID 公鑰解碼失敗，格式可能不正確')
  }
}

webpush.setVapidDetails(
  vapidEmail,
  vapidPublicKey,
  vapidPrivateKey
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
