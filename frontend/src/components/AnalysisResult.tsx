import type React from "react"
import { useState } from "react"
import axios from "axios"
import { ADS_SERVER_URL } from "../config"

interface AnalysisResultProps {
  imageAnalysis: any
  reportAnalysis: string
  onVerdict: (verdict: any) => void
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ imageAnalysis, reportAnalysis, onVerdict }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetVerdict = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${ADS_SERVER_URL}/api/report`, {
        analysis: imageAnalysis,
        reportData: reportAnalysis,
      })
      onVerdict(response.data.verdict)
    } catch (error) {
      setError("Error generating final verdict. Please try again.")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Image Analysis</h3>
        <p className="text-gray-700">{imageAnalysis.analysis}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Report Analysis</h3>
        <p className="text-gray-700">{reportAnalysis}</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={handleGetVerdict}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {loading ? "Generating Verdict..." : "Get Final Verdict"}
      </button>
    </div>
  )
}

