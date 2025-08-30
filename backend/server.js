import express from 'express'
import dotenv from 'dotenv'
import auth from './Routes/authRoutes.js'
import study from './Routes/studyRoutes.js'
import cors from 'cors'
import reminders from './Routes/reminderRoutes.js';
import notificationRoutes from "./Routes/notificationRoutes.js";
import fcm from './Routes/fcmRoutes.js'
import './Controllers/reminderScheduler.js'
import aiRoutes from './Routes/aiRoutes.js'

dotenv.config()
const app = express()
const port = process.env.PORT

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json());





app.use('/api/auth', auth)
app.use('/api/', study)
app.use('/api/reminders', reminders);
app.use('/api', fcm);

app.use("/api/ai", aiRoutes);


app.use("/api/notification", notificationRoutes);



app.listen(port, () => {
  console.log('server run on port:', port);
})
