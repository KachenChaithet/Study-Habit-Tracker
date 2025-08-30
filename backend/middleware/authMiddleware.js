// middleware/authMiddleware.js
import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  // ใช้ header ชื่อ 'token' แทน 'Authorization'
  const authToken = req.headers.token
  if (!authToken) {
    return res.status(401).json({ error: 'Not authorized' })
  }

  try {
    // ตรวจสอบและ decode token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET)

    if (!decoded) {
      res.json({message:'not decode'})
    }

    // เซ็ต req.user ให้ใช้งานต่อใน controller
    req.user = { id: decoded.userId }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' })
  }
}
