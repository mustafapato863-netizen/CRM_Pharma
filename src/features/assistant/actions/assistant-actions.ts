"use server";

import { SYSTEM_SUMMARY } from "../faq/system-summary";

export type AssistantMessageInput = {
  sender: "user" | "bot";
  text: string;
};

export async function askAssistantAction(
  prompt: string,
  history: AssistantMessageInput[]
) {
  const apiKey = process.env.API_AI_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "مفتاح الـ API للذكاء الاصطناعي (API_AI_KEY) غير متاح في ملف .env على الخادم.",
    };
  }

  try {
    const isOpenAI = apiKey.startsWith("sk-");

    if (isOpenAI) {
      // OpenAI API request
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_SUMMARY },
            ...history.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      return { success: true, text };
    } else {
      // Gemini API request (Default)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_SUMMARY },
                {
                  text: `Previous conversation history:\n${history
                    .map((m) => `${m.sender}: ${m.text}`)
                    .join("\n")}`,
                },
                { text: `User Question: ${prompt}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { success: true, text };
    }
  } catch (error: any) {
    console.error("Assistant API Error:", error);
    return {
      success: false,
      error: error.message || "فشل الاتصال بمزود خدمة الذكاء الاصطناعي.",
    };
  }
}
