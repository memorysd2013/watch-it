// API 路由: 取消訂閱推播通知
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscription } = req.body

    if (!subscription) {
      return res.status(400).json({ error: '缺少訂閱資訊' })
    }

    // 這裡應該從資料庫中移除訂閱資訊
    // 為了示範，我們只記錄到 console
    console.log('取消推播訂閱:', {
      endpoint: subscription.endpoint,
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({
      success: true,
      message: '取消訂閱成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('取消訂閱推播通知失敗:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
