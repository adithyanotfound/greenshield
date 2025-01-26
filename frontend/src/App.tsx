import React, { useState } from "react"
import { ImageUpload } from "./components/ImageUpload"
import { ReportUpload } from "./components/ReportUpload"
import { AnalysisResult } from "./components/AnalysisResult"
import { FinalVerdict } from "./components/FinalVerdict"
import { ChevronRightIcon } from "@heroicons/react/24/solid"

export default function App() {
  const [step, setStep] = useState(1)
  const [imageAnalysis, setImageAnalysis] = useState(null)
  const [reportAnalysis, setReportAnalysis] = useState("")
  const [finalVerdict, setFinalVerdict] = useState("")

  const handleImageAnalysis = (analysis: React.SetStateAction<null>) => {
    setImageAnalysis(analysis)
    setStep(2)
  }

  const handleReportAnalysis = (analysis: React.SetStateAction<string>) => {
    setReportAnalysis(analysis)
    setStep(3)
  }

  const handleFinalVerdict = (verdict: React.SetStateAction<string>) => {
    setFinalVerdict(verdict)
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Greenwashing Analyzer</h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {i}
                  </div>
                  {i < 4 && <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
                </React.Fragment>
              ))}
            </div>
            {step === 1 && <ImageUpload onAnalysis={handleImageAnalysis} />}
            {step === 2 && <ReportUpload onAnalysis={handleReportAnalysis} />}
            {step === 3 && (
              <AnalysisResult
                imageAnalysis={imageAnalysis}
                reportAnalysis={reportAnalysis}
                onVerdict={handleFinalVerdict}
              />
            )}
            {step === 4 && <FinalVerdict verdict={finalVerdict} />}
          </div>
        </div>
      </div>
    </div>
  )
}

