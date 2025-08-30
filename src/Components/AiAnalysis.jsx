// src/components/AiAnalysis.js
import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AiAnalysis = ({ logs = [], token }) => {
    const [aiAnalysis, setAiAnalysis] = useState(null)
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)

    const fetchAiAnalysis = async () => {
        if (!Array.isArray(logs) || logs.length === 0) {
            setAiAnalysis(null)
            return
        }

        setIsLoadingAnalysis(true)
        try {
            const res = await axios.get("http://localhost:5000/api/ai", {
                headers: { token }
            })
            setAiAnalysis(res.data)
        } catch (err) {
            console.error("Error fetching AI analysis:", err)
            toast.error("ไม่สามารถวิเคราะห์ข้อมูลได้")
            setAiAnalysis(null)
        } finally {
            setIsLoadingAnalysis(false)
        }
    }

    useEffect(() => {
        if (Array.isArray(logs) && logs.length > 0) {
            fetchAiAnalysis()
        }
    }, [logs])

    if (!Array.isArray(logs) || logs.length === 0) return null

    return (
        <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">AI Study Analysis</h3>
                            <p className="text-sm text-gray-500 font-medium">คำแนะนำตามรูปแบบการเรียนของคุณ</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchAiAnalysis}
                        disabled={isLoadingAnalysis}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingAnalysis ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Analyze AI
                            </>
                        )}
                    </button>
                </div>

                {/* Content */}
                {isLoadingAnalysis && <p className="text-gray-500">กำลังวิเคราะห์...</p>}

                {!isLoadingAnalysis && aiAnalysis && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-xl shadow-inner">
                        <h4 className="text-lg font-semibold mb-2">คำแนะนำโดยรวม</h4>
                        <p>{aiAnalysis.summaryRecommendation}</p>

                        <h4 className="text-lg font-semibold mt-4 mb-2">รายละเอียดเพิ่มเติม</h4>
                        <p><strong>รูปแบบการเรียน:</strong> {aiAnalysis.insights.studyPattern}</p>
                        <p><strong>วิชาที่ควรปรับปรุง:</strong> {aiAnalysis.insights.leastConsistentSubject}</p>
                    </div>
                )}

                {!isLoadingAnalysis && !aiAnalysis && (
                    <p className="text-gray-400 mt-4">ไม่มีผลวิเคราะห์ AI</p>
                )}
            </div>
        </div>
    )
}

export default AiAnalysis
