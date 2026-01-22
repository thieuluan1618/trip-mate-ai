import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { expenses } = await request.json();

    if (!expenses || !Array.isArray(expenses)) {
      return NextResponse.json(
        { error: 'Missing or invalid expenses array' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-09-2025' });

    const prompt = `
      Phân tích chi tiêu du lịch này một cách hài hước, ngắn gọn bằng tiếng Việt (tối đa 150 từ).
      Dữ liệu: ${JSON.stringify(expenses)}
      Thêm emoji và đề xuất tiết kiệm.
    `;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Expense analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze expenses' },
      { status: 500 }
    );
  }
}
