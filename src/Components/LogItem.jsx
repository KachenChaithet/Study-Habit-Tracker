// src/components/LogItem.js
const LogItem = ({ log }) => {
  return (
    <div className="flex justify-between items-center border px-4 py-2 rounded-md">
      <div>
        <p className="font-semibold">{log.subject}</p>
        <p className="text-gray-500 text-sm">{log.date}</p>
      </div>
      <span>{log.duration} min</span>
    </div>
  )
}

export default LogItem
