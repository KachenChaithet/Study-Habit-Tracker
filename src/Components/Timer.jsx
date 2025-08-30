// src/components/Timer.js
import { useState, useEffect } from "react"

const Timer = () => {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-2xl font-mono">{formatTime(seconds)}</span>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="px-3 py-1 bg-blue-600 text-white rounded-md"
      >
        {isRunning ? "Pause" : "Start"}
      </button>
      <button
        onClick={() => setSeconds(0)}
        className="px-3 py-1 bg-gray-400 text-white rounded-md"
      >
        Reset
      </button>
    </div>
  )
}

export default Timer
