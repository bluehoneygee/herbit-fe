import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const text = await response.text();

    const data = JSON.parse(text);

    let aiReply = "Maaf, tidak ada respons dari Gemini.";
    if (data?.candidates?.length) {
      aiReply = data.candidates[0].content?.parts?.map(p => p.text).join("\n") || aiReply;
    } else if (data?.error) {
      aiReply = `⚠️ Error dari Gemini: ${data.error.message}`;
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
