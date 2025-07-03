import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  const { question } = await request.json();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${question}`,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        systemInstruction: 'You are a helpful assistant.',
        temperature: 0.1,
      },
    });

    const reply = response.text;

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
