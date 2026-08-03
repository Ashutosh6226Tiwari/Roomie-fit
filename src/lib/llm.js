import Anthropic from "@anthropic-ai/sdk";

/**
 * ==============================================================================
 * RoomieMatch LLM Adjustment Layer (PRD §3.4 Step 3 & §4 Cost Control)
 * ==============================================================================
 *
 * Supports:
 * 1. Anthropic Claude API (ANTHROPIC_API_KEY) - Default paid/production LLM
 * 2. Google Gemini API (GEMINI_API_KEY) - FREE cloud substitute via Google AI Studio
 * 3. Smart Keyword Heuristic Fallback - FREE offline substitute (zero API key needed)
 *
 * Returns an adjustment integer between -10 and 10, plus a short natural-language
 * explanation string.
 */

// 1. Free Google Gemini REST API helper (Google AI Studio Free Tier - aistudio.google.com)
async function callGeminiFreeApi(apiKey, aboutMeA, aboutMeB) {
  const prompt = `You are RoomieMatch's AI compatibility assistant for college students.
We have already computed a rule-based compatibility score based on structured lifestyle fields (sleep, cleanliness, budget, guests, smoking).
Your task is to analyze the unstructured "About me" free-text fields from two potential college roommates (Student A and Student B) per PRD §3.4 Step 3.

Student A About Me:
"${aboutMeA || "Not provided"}"

Student B About Me:
"${aboutMeB || "Not provided"}"

Instructions:
1. Identify semantic compatibility signals between the two texts (e.g., similar study routines, introverted/extroverted energy, hobbies, shared campus life goals).
2. Identify any potential red flags or lifestyle mismatches not captured in structured fields.
3. Determine a small numerical adjustment between -10 and 10 (integer) to fine-tune their compatibility score.
4. Write a concise, natural-language 1-2 sentence explanation summarizing why you are both a great match or where slight differences exist.

CRITICAL: Return ONLY a valid JSON object. Do not include markdown formatting, backticks, fences, or any introductory prose.
Required JSON format:
{
  "adjustment": <integer between -10 and 10>,
  "explanation": "<short explanation text>"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return rawText;
}

// 2. Free Smart Keyword Heuristic Fallback (Zero API key or credits required)
function computeKeywordHeuristicAdjustment(aboutMeA, aboutMeB) {
  const textA = (aboutMeA || "").toLowerCase();
  const textB = (aboutMeB || "").toLowerCase();

  const keywords = {
    quiet: ["quiet", "silence", "peaceful", "calm", "read", "library", "introvert"],
    study: ["study", "cs", "engineering", "coding", "school", "academics", "classes"],
    social: ["party", "friends", "hosting", "loud", "weekend", "guests", "music", "extrovert"],
    tidy: ["clean", "tidy", "neat", "organized", "spotless"],
    hobbies: ["gym", "workout", "gaming", "cook", "coffee", "hike", "sports"],
  };

  const shared = [];
  const conflicts = [];

  for (const [category, words] of Object.entries(keywords)) {
    const aHas = words.some((w) => textA.includes(w));
    const bHas = words.some((w) => textB.includes(w));

    if (aHas && bHas) {
      shared.push(category);
    }
  }

  // Check conflicts (quiet vs social)
  const aQuiet = keywords.quiet.some((w) => textA.includes(w));
  const bSocial = keywords.social.some((w) => textB.includes(w));
  const bQuiet = keywords.quiet.some((w) => textB.includes(w));
  const aSocial = keywords.social.some((w) => textA.includes(w));

  if ((aQuiet && bSocial) || (bQuiet && aSocial)) {
    conflicts.push("social vs. quiet energy");
  }

  let adjustment = 0;
  let explanation =
    "Compatible college lifestyle habits based on structured profile attributes.";

  if (shared.length > 0 && conflicts.length === 0) {
    adjustment = Math.min(6, shared.length * 3);
    const topics = shared
      .map((s) => (s === "tidy" ? "cleanliness" : s))
      .join(" and ");
    explanation = `You both emphasize ${topics} in your bios, signaling strong compatibility.`;
  } else if (conflicts.length > 0) {
    adjustment = -4;
    explanation = `Note a potential contrast in study and social atmosphere (${conflicts[0]}) based on your bios.`;
  } else if (shared.length > 0) {
    adjustment = 2;
    explanation = `You share common interests in ${shared[0]}, though social preferences vary slightly.`;
  }

  return { adjustment, explanation };
}

export async function getLlmAdjustment(aboutMeA, aboutMeB) {
  let rawText = "";

  // Attempt 1: Anthropic Claude API (if ANTHROPIC_API_KEY is present)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const prompt = `You are RoomieMatch's AI compatibility assistant for college students.
We have already computed a rule-based compatibility score based on structured lifestyle fields (sleep, cleanliness, budget, guests, smoking).
Your task is to analyze the unstructured "About me" free-text fields from two potential college roommates (Student A and Student B) per PRD §3.4 Step 3.

Student A About Me:
"${aboutMeA || "Not provided"}"

Student B About Me:
"${aboutMeB || "Not provided"}"

Instructions:
1. Identify semantic compatibility signals between the two texts (e.g., similar study routines, introverted/extroverted energy, hobbies, shared campus life goals).
2. Identify any potential red flags or lifestyle mismatches not captured in structured fields.
3. Determine a small numerical adjustment between -10 and 10 (integer) to fine-tune their compatibility score.
4. Write a concise, natural-language 1-2 sentence explanation summarizing why you are both a great match or where slight differences exist.

CRITICAL: Return ONLY a valid JSON object. Do not include markdown formatting, backticks, fences, or any introductory prose.
Required JSON format:
{
  "adjustment": <integer between -10 and 10>,
  "explanation": "<short explanation text>"
}`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 250,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      rawText = response.content?.[0]?.text || "";
    } catch (err) {
      console.warn(
        "[getLlmAdjustment] Claude API error (e.g., credit balance):",
        err.message || err
      );
    }
  }

  // Attempt 2: Google Gemini Free API (if Claude failed/missing & GEMINI_API_KEY is present)
  if (!rawText && process.env.GEMINI_API_KEY) {
    try {
      console.log("[getLlmAdjustment] Using Google Gemini API substitute...");
      rawText = await callGeminiFreeApi(
        process.env.GEMINI_API_KEY,
        aboutMeA,
        aboutMeB
      );
    } catch (geminiErr) {
      console.warn("[getLlmAdjustment] Google Gemini error:", geminiErr.message);
    }
  }

  // Parse JSON from LLM (Claude or Gemini) if we got a response
  if (rawText) {
    const cleanedText = rawText
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanedText);
      let adjustment = Number(parsed.adjustment);
      if (isNaN(adjustment) || adjustment < -10 || adjustment > 10) {
        adjustment = 0;
      } else {
        adjustment = Math.round(adjustment);
      }

      const explanation =
        typeof parsed.explanation === "string" && parsed.explanation.trim()
          ? parsed.explanation.trim()
          : "Compatible college lifestyle habits based on structured profile attributes.";

      return {
        adjustment,
        explanation,
      };
    } catch (parseErr) {
      console.warn("[getLlmAdjustment] JSON parse failed on text:", rawText);
    }
  }

  // Attempt 3: Free Smart Keyword Heuristic Fallback (Zero API keys needed!)
  console.log(
    "[getLlmAdjustment] Using Free Smart Keyword Heuristic Fallback Engine."
  );
  return computeKeywordHeuristicAdjustment(aboutMeA, aboutMeB);
}
