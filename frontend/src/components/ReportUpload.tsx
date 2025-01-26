import type React from "react"
import { useState } from "react"
import axios from "axios"
import { DocumentArrowUpIcon } from "@heroicons/react/24/solid"

interface ReportUploadProps {
  onAnalysis: (analysis: any) => void
}

export const ReportUpload: React.FC<ReportUploadProps> = ({ onAnalysis }) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a report to upload")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("pdf", file)

    try {
      const response = await axios.post("http://127.0.0.1:5000/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onAnalysis(response.data.extracted_text)
    } catch (error) {
      setError("Error extracting report data. Please try again.")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Company Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="report-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <DocumentArrowUpIcon className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input id="report-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
        {file && <p className="text-sm text-gray-500">Selected file: {file.name}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? "Extracting..." : "Extract Report Data"}
        </button>
      </form>
    </div>
  )
}

