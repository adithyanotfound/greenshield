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

async function analyzeImage(imagePath1: string, image2Path?: string) {
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "models/gemini-1.5-pro",
    systemInstruction: "You are an expert at detect greenwashing.",
  });

  let result;
  if (!image2Path) {
    // Analyze single image
    result = await model.generateContent([
      fileToGenerativePart(imagePath1, "image/jpeg"),
      `Take a look at the image and tell whether this is potential greenwashing. The image might include ingredients of the product. Use the ingredients to assist in your analysis. Support your answer with reason. The response should be in JSON format { companyName: "", analysis:"" }. Do not return anything else.`,
    ]);
  } else {
    // Analyze two images
    result = await model.generateContent([
      fileToGenerativePart(imagePath1, "image/jpeg"),
      fileToGenerativePart(image2Path, "image/jpeg"),
      `Take a look at the images and tell whether this is potential greenwashing. The images might include ingredients of the product. Use the ingredients to assist in your analysis. Support your answer with reason. The response should be in JSON format { companyName: "", analysis:"" }. Do not return anything else.`,
    ]);
  }
  return result.response.text();
}

// File storage configuration
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

// Route for analyzing advertisements with one or two images (using a single key: "images")
app.post(
  "/api/analyze",
  upload.array("image", 2), // Accept up to 2 files under "images"
  async (req, res): Promise<any> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "At least one image must be uploaded" });
      }

      let analysisResult;
      if (files.length === 1) {
        // Only one image uploaded
        analysisResult = await analyzeImage(files[0].path);
      } else if (files.length === 2) {
        // Two images uploaded
        analysisResult = await analyzeImage(files[0].path, files[1].path);
      }

      if (analysisResult) {
        res.json(parseJSONString(analysisResult));
      } else {
        res.status(500).json({ error: "Analysis result is undefined" });
      }
    } catch (error) {
      console.error("Error processing images:", error);
      res.status(500).json({ error: "Error processing images" });
    }
  }
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
