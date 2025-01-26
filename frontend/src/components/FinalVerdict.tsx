import type React from "react"

interface FinalVerdictProps {
  verdict: string
}

export const FinalVerdict: React.FC<FinalVerdictProps> = ({ verdict }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Final Verdict</h2>
      <div className="bg-gray-100 p-6 rounded-lg">
        <p className="text-gray-700 whitespace-pre-wrap">{verdict}</p>
      </div>
    </div>
  )
}

