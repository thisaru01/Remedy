import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // Fail fast so misconfiguration is obvious in logs/health
  // but keep this service optional at the gateway level.
  // eslint-disable-next-line no-console
  console.warn("GEMINI_API_KEY is not set. AI symptom checker will not work.");
}

// Default model for this service; can be overridden via GEMINI_MODEL
// You requested to use gemini-2.5-flash specifically.
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let model = null;
if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: modelName });
}

const buildPrompt = ({ symptoms, age, gender, duration, additionalInfo }) => {
  const demographicLines = [];
  if (age) demographicLines.push(`Age: ${age}`);
  if (gender) demographicLines.push(`Gender: ${gender}`);
  if (duration) demographicLines.push(`Duration: ${duration}`);

  const extra = additionalInfo ? `Additional context: ${additionalInfo}` : "";

  return `You are an AI medical information assistant.\n\nIMPORTANT SAFETY RULES:\n- You are NOT a doctor.\n- You do NOT provide a diagnosis.\n- You only provide general educational information and advise the user to consult a qualified healthcare professional.\n- Be conservative and safe if symptoms could indicate something serious.\n\nUser-reported information:\nSymptoms: ${symptoms}\n${demographicLines.join(" | ")}\n${extra}\n\nTASK:\nBased on this information, provide an informational overview of what could be going on, possible conditions, suggested doctor specialties, and how urgent it might be to seek care.\n\nRESPONSE FORMAT:\nRespond ONLY with strict JSON that matches this TypeScript type:\n\ninterface SymptomAssessment {\n  overview: string;\n  possibleConditions: {\n    name: string;\n    likelihood: "low" | "medium" | "high";\n    reasoning: string;\n  }[];\n  recommendedSpecialties: string[];\n  urgency: "low" | "moderate" | "high";\n  redFlags: string[];\n  disclaimer: string;\n}\n\nDo not include any text outside the JSON (no markdown, no code fences).`;
};

const safeParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
};

export const generateSymptomAssessment = async (input) => {
  if (!model) {
    const error = new Error(
      "AI model is not configured. GEMINI_API_KEY is missing.",
    );
    error.statusCode = 500;
    throw error;
  }

  const prompt = buildPrompt(input);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const parsed = safeParseJson(text);
    if (parsed) {
      return parsed;
    }

    // Fallback: wrap raw text in a minimal structure
    return {
      overview: text,
      possibleConditions: [],
      recommendedSpecialties: [],
      urgency: "low",
      redFlags: [],
      disclaimer:
        "This AI output could not be parsed into structured data. Treat it as general information only and consult a qualified healthcare professional.",
    };
  } catch (err) {
    // Log full error details on the server for debugging
    // eslint-disable-next-line no-console
    console.error("Gemini API error while generating symptom assessment", {
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    });

    const error = new Error(
      `Failed to generate AI symptom assessment: ${err?.message || "Unknown error"}`,
    );
    error.statusCode = 502;
    throw error;
  }
};

export default { generateSymptomAssessment };
