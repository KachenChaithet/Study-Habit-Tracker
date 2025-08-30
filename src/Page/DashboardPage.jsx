// src/pages/DashboardPage.js
import { useState, useEffect } from "react"
import LogItem from "../Components/LogItem"
import Timer from '../Components/Timer'
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { onMessage } from "firebase/messaging"
import { generteTOken, messaging } from "../firebase"
import AiAnalysis from "../Components/AiAnalysis"

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const [logs, setLogs] = useState([]) // เก็บ study logs
  const [reminders, setReminders] = useState([]) // เก็บ reminders
  const [newLogSubject, setNewLogSubject] = useState("")
  const [newLogDuration, setNewLogDuration] = useState(0)
  const [isOpenEdit, setIsOpenEdit] = useState(null) // เก็บ ID ของ log ที่กำลัง edit
  const [editSubject, setEditSubject] = useState("") // เก็บ subject ที่กำลัง edit
  const [editDuration, setEditDuration] = useState(0) // เก็บ duration ที่กำลัง edit


  // Reminder states
  const [isOpenReminderEdit, setIsOpenReminderEdit] = useState(null)
  const [newReminderSubject, setNewReminderSubject] = useState("")
  const [newReminderTime, setNewReminderTime] = useState("")
  const [newReminderDate, setNewReminderDate] = useState("")
  const [newReminderRepeat, setNewReminderRepeat] = useState(true)
  const [editReminderSubject, setEditReminderSubject] = useState("")
  const [editReminderTime, setEditReminderTime] = useState("")
  const [editReminderDate, setEditReminderDate] = useState("")
  const [editReminderRepeat, setEditReminderRepeat] = useState(true)



  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/logs", {
        headers: {
          token: token
        }
      })
      setLogs(res.data)
    } catch (err) {
      console.error("Error fetching logs:", err)
    }
  }




  const fetchReminders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reminders/get`, {
        headers: {
          token: token
        }
      })
      setReminders(res.data)
    } catch (err) {
      console.error("Error fetching reminders:", err)
    }
  }


  const sendFCMTokenToBackend = async () => {
    const tokenFcm = await generteTOken();


    if (!tokenFcm) return;

    try {
      await axios.post(
        "http://localhost:5000/api/setuserfcm", { fcmToken: tokenFcm },
        {
          headers: {
            token: token // ถ้าใช้ JWT
          },
        }
      );
      console.log("FCM token sent to backend successfully");
    } catch (error) {
      console.error("Error sending FCM token to backend:", error);
    }
  };

  // เรียกฟังก์ชันนี้เมื่อผู้ใช้ login หรือเปิดแอป
  sendFCMTokenToBackend();





  useEffect(() => {
    fetchLogs()
    fetchReminders()

  }, [token])

  const addLog = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post('http://localhost:5000/api/logs', {
        subject: newLogSubject,
        duration: newLogDuration
      }, {
        headers: {
          token: token
        },
      })

      if (res.data) {
        setLogs(prev => [...prev, res.data])
        toast.success('เพิ่ม log สำเร็จ')
        setNewLogDuration(0)
        setNewLogSubject('')
        fetchLogs()
      } else {
        toast.error('error')
      }
    } catch (error) {
      toast.error('server error')
      console.error(error)
    }
  }

  // Add Reminder
  const addReminder = async () => {
    try {
      if (!newReminderSubject || !newReminderTime || !newReminderDate) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
        return
      }

      const remindDateTime = new Date(`${newReminderDate}T${newReminderTime}`)

      const res = await axios.post('http://localhost:5000/api/reminders', {
        subjectremin: newReminderSubject,
        remindTime: remindDateTime.toISOString(),
        repeatDaily: newReminderRepeat
      }, {
        headers: {
          token: token
        },
      })

      if (res.data) {
        setReminders(prev => [...prev, res.data])
        toast.success('เพิ่ม reminder สำเร็จ')
        setNewReminderSubject('')
        setNewReminderTime('')
        setNewReminderDate('')
        setNewReminderRepeat(true)
        fetchReminders()
      } else {
        toast.error('error')
      }
    } catch (error) {
      toast.error('server error')
      console.error(error)
    }
  }

  // เปิด/ปิด edit mode สำหรับ logs
  const handleEditClick = (log) => {
    setIsOpenEdit(log.id)
    setEditSubject(log.subject)
    setEditDuration(log.duration)
  }

  const handleCancelEdit = () => {
    setIsOpenEdit(null)
    setEditSubject("")
    setEditDuration(0)
  }

  // เปิด/ปิด edit mode สำหรับ reminders
  const handleReminderEditClick = (reminder) => {
    setIsOpenReminderEdit(reminder.id)
    setEditReminderSubject(reminder.subjectremin)
    const reminderDate = new Date(reminder.remindTime)
    setEditReminderDate(reminderDate.toISOString().split('T')[0])
    setEditReminderTime(reminderDate.toTimeString().slice(0, 5))
    setEditReminderRepeat(reminder.repeatDaily)
  }

  const handleCancelReminderEdit = () => {
    setIsOpenReminderEdit(null)
    setEditReminderSubject("")
    setEditReminderTime("")
    setEditReminderDate("")
    setEditReminderRepeat(true)
  }

  const handleSaveEdit = async (id) => {
    try {
      const updatedData = {
        subject: editSubject,
        duration: editDuration
      }

      const res = await axios.put(
        `http://localhost:5000/api/logs/${id}`,
        updatedData,
        {
          headers: {
            token: token,
          },
        }
      )

      toast.success("Log updated successfully")

      // อัปเดต state logs หลังแก้ไข
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, ...updatedData } : log))
      )

      // ปิด edit mode
      setIsOpenEdit(null)
      setEditSubject("")
      setEditDuration(0)
    } catch (err) {
      console.error(err)
      toast.error("Failed to update log")
    }
  }

  const handleSaveReminderEdit = async (id) => {
    try {
      const remindDateTime = new Date(`${editReminderDate}T${editReminderTime}`)

      const updatedData = {
        subjectremin: editReminderSubject,
        remindTime: remindDateTime.toISOString(),
        repeatDaily: editReminderRepeat
      }

      const res = await axios.put(
        `http://localhost:5000/api/reminders/${id}`,
        updatedData,
        {
          headers: {
            token: token,
          },
        }
      )

      toast.success("Reminder updated successfully")

      // อัปเดต state reminders หลังแก้ไข
      setReminders((prev) =>
        prev.map((reminder) => (reminder.id === id ? { ...reminder, ...updatedData } : reminder))
      )

      // ปิด edit mode
      setIsOpenReminderEdit(null)
      setEditReminderSubject("")
      setEditReminderTime("")
      setEditReminderDate("")
      setEditReminderRepeat(true)
    } catch (err) {
      console.error(err)
      toast.error("Failed to update reminder")
    }
  }

  // ลบ log
  const onDeleteLog = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/logs/${id}`, {
        headers: {
          token: token,
        },
      })
      toast.success("Log deleted successfully")
      // อัปเดต state logs หลังลบ
      setLogs((prev) => prev.filter((log) => log.id !== id))
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete log")
    }
  }

  // ลบ reminder
  const onDeleteReminder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reminders/${id}`, {
        headers: {
          token: token,
        },
      })
      toast.success("Reminder deleted successfully")
      // อัปเดต state reminders หลังลบ
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete reminder")
    }
  }

  // Clear all logs
  const onClearAllLogs = async () => {
    if (window.confirm("Are you sure you want to delete all study logs?")) {
      try {
        setLogs([])
        toast.success("All logs cleared")
      } catch (err) {
        toast.error("Failed to clear logs")
      }
    }
  }

  // Export logs
  const onExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'study-logs.json'
    link.click()
    toast.success("Logs exported successfully")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Study Dashboard</h1>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {user?.email || "Student"}!
            </h1>
            <p className="text-gray-600">Track your learning progress and manage study sessions</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(logs.reduce((total, log) => total + log.duration, 0) / 60 * 10) / 10}h
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-purple-600">
                  {logs.filter(log => {
                    const logDate = new Date(log.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return logDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reminders</p>
                <p className="text-3xl font-bold text-orange-600">{reminders.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 12.5A9 9 0 1112 21m7-7.5v-2a7 7 0 10-14 0v2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-1 flex flex-col gap-6 ">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 sticky z-40  top-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                {/* ...icon... */}
                Study Timer
              </h3>
              <Timer />
            </div>

            <div className="bg-white/70 rounded-2xl p-6 shadow-xl border border-white/20">
              {/* ...input fields และปุ่ม Add Session... */}
              <AiAnalysis logs={logs} token={token} />
            </div>
          </div>


          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add Log Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Study Session
              </h3>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter subject name..."
                    value={newLogSubject}
                    onChange={(e) => setNewLogSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newLogDuration || ''}
                    onChange={(e) => setNewLogDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                </div>
              </div>

              <button
                onClick={addLog}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Session
              </button>
            </div>

            {/* Add Reminder Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Study Reminder
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter subject name..."
                    value={newReminderSubject}
                    onChange={(e) => setNewReminderSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  />
                </div>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="repeatDaily"
                  checked={newReminderRepeat}
                  onChange={(e) => setNewReminderRepeat(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <label htmlFor="repeatDaily" className="ml-2 text-sm font-medium text-gray-700">
                  Repeat daily
                </label>
              </div>

              <button
                onClick={addReminder}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
                Add Reminder
              </button>
            </div>

            {/* Study Reminders Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 12.5A9 9 0 1112 21m7-7.5v-2a7 7 0 10-14 0v2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Study Reminders</h3>
                    <p className="text-sm text-gray-500 font-medium">{reminders.length} reminders set</p>
                  </div>
                </div>

                {reminders.length > 0 && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-orange-700">Active</span>
                  </div>
                )}
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-full opacity-50"></div>
                    </div>

                    <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5z" />
                      </svg>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-gray-700">No reminders set</h4>
                      <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Set up study reminders to stay on track with your learning goals.
                        <span className="block mt-2 text-sm text-orange-600 font-medium">Never miss a study session! 🔔</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="group">
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:border-orange-200 transition-all duration-200">
                        {isOpenReminderEdit === reminder.id ? (
                          // Edit Mode
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Reminder
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input
                                  type="text"
                                  value={editReminderSubject}
                                  onChange={(e) => setEditReminderSubject(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/80"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                  type="date"
                                  value={editReminderDate}
                                  onChange={(e) => setEditReminderDate(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/80"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                <input
                                  type="time"
                                  value={editReminderTime}
                                  onChange={(e) => setEditReminderTime(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/80"
                                />
                              </div>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`editRepeat-${reminder.id}`}
                                checked={editReminderRepeat}
                                onChange={(e) => setEditReminderRepeat(e.target.checked)}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                              />
                              <label htmlFor={`editRepeat-${reminder.id}`} className="ml-2 text-sm font-medium text-gray-700">
                                Repeat daily
                              </label>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200/50">
                              <button
                                onClick={handleCancelReminderEdit}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex items-center"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveReminderEdit(reminder.id)}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <div className="flex items-center justify-between p-4">
                            <div className="flex-1">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                                    </svg>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-800 truncate">
                                      {reminder.subjectremin}
                                    </h4>
                                    {reminder.repeatDaily && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                        Daily
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(reminder.remindTime).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {new Date(reminder.remindTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleReminderEditClick(reminder)}
                                  className="p-2 bg-orange-500/80 hover:bg-orange-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group/edit"
                                  title="Edit reminder"
                                >
                                  <svg className="w-4 h-4 transform group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => onDeleteReminder(reminder.id)}
                                  className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group/delete"
                                  title="Delete reminder"
                                >
                                  <svg className="w-4 h-4 transform group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {isOpenReminderEdit !== reminder.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Study Logs Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Study Logs</h3>
                    <p className="text-sm text-gray-500 font-medium">{logs.length} sessions tracked</p>
                  </div>
                </div>

                {logs.length > 0 && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-green-700">Active</span>
                  </div>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full opacity-50"></div>
                    </div>

                    <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-gray-700">No study sessions yet</h4>
                      <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Start tracking your study progress by adding your first session above.
                        <span className="block mt-2 text-sm text-blue-600 font-medium">Your journey begins here! 📚</span>
                      </p>
                    </div>

                    <div className="flex justify-center mt-8 space-x-4">
                      <div className="w-2 h-2 bg-blue-200 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-10 rounded-t-2xl"></div>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    {logs.map((log, index) => (
                      <div
                        key={log.id}
                        className={`group transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${index === 0 ? 'animate-fadeInUp' : ''
                          }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:border-blue-200 transition-all duration-200 relative">
                          {isOpenEdit === log.id ? (
                            <div className="p-6 space-y-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit Session
                                </h4>
                                <div className="text-sm text-gray-500">
                                  {new Date(log.date).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                  <input
                                    type="text"
                                    value={editSubject}
                                    onChange={(e) => setEditSubject(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                                    placeholder="Enter subject name..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                                  <input
                                    type="number"
                                    value={editDuration || ''}
                                    onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                                    placeholder="0"
                                    min="0"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200/50">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(log.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-4">
                              <div className="flex-1 pr-4">
                                <LogItem log={log} />
                              </div>

                              <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditClick(log)}
                                    className="p-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group/edit"
                                    title="Edit session"
                                  >
                                    <svg className="w-4 h-4 transform group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() => onDeleteLog(log.id)}
                                    className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group/delete"
                                    title="Delete session"
                                  >
                                    <svg className="w-4 h-4 transform group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {isOpenEdit !== log.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10 rounded-b-2xl"></div>
                </div>
              )}

              {logs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      {logs.length > 5 && (
                        <div className="flex items-center text-amber-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">Streak Active!</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-400 text-xs">
                        Last updated: {new Date().toLocaleDateString()}
                      </div>
                      {logs.length > 1 && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={onClearAllLogs}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={onExportLogs}
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                          >
                            Export
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage