import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

function parseJSONString(inputString: string) {
  try {
    // regex for pasing the json xml
    const cleanedString = inputString.replace(/```json\n|```/g, "");
    const jsonObject = JSON.parse(cleanedString);
    return jsonObject;
  } catch (error: any) {
    console.error("Invalid JSON string:", error.message);
    return null;
  }
}

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path: fs.PathOrFileDescriptor, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function analyzeImage(imagePath: string) {
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash",
    systemInstruction: "You are an expert at detect greenwashing.",
  });
  const result = await model.generateContent([
    fileToGenerativePart(imagePath, "image/jpeg"),
    `Take a look at the image and tell whether this is potential greenwashing. Support your answer with reason. The response should be in JSON format { companyName: "", analysis:"" }. Do not return anything else.`,
  ]);
  return result.response.text();
}

//file-upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

//route of analysing advertisements
app.post(
  "/api/analyze",
  upload.single("image"),
  async (req, res): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const imagePath = req.file.path;
      console.log(imagePath);
      const result = await analyzeImage(imagePath);

      res.json({ analysis: parseJSONString(result) });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Error processing image" });
    }
  },
);

//route for analysing report and giving the final verdict
app.post("/api/report", async (req, res) => {
  const analysis = req.body.analysis;
  const reportData = req.body.reportData;

  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash",
    systemInstruction: "You are an expert at detect greenwashing.",
  });
  const result = await model.generateContent(`
        This is the judgement made by a expert for an advertisement for potential greenwashing.
        ${analysis}
        This is the text content extracted from reports published by the company.
        ${reportData}
        Considering the reports to be true list down the positive aspects, possible greenwashing indicators and the verdict for potential greenwashing.
        Support your answer with reason.
    `);
  res.json({
    verdict: result.response.text(),
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
