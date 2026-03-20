import { NextRequest, NextResponse } from 'next/server';
import { genaiClient, GEMINI_MODEL } from '@/lib/vertexai';

export async function POST(request: NextRequest) {
  try {
    const { tripName, items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty items array' },
        { status: 400 }
      );
    }

    // Prepare trip data for story generation
    const memories = items
      .filter((item: any) => item.type === 'memory')
      .map((item: any) => ({
        name: item.name,
        category: item.category,
        description: item.description,
        timestamp: item.timestamp,
      }));

    const expenses = items
      .filter((item: any) => item.type === 'expense')
      .map((item: any) => ({
        name: item.name,
        category: item.category,
        amount: item.amount,
        description: item.description,
        timestamp: item.timestamp,
      }));

    const totalExpense = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    const prompt = `
      Bạn là một nhà văn du lịch vui vẻ. Hãy viết một câu chuyện ngắn (200-300 từ) về chuyến đi "${tripName || 'du lịch'}" bằng tiếng Việt.

      Dữ liệu chuyến đi:
      - Kỷ niệm: ${JSON.stringify(memories)}
      - Chi tiêu: ${JSON.stringify(expenses)}
      - Tổng chi: ${totalExpense}k VND

      Yêu cầu:
      1. Viết theo phong cách kể chuyện tự nhiên, vui vẻ, như đang kể cho bạn bè nghe
      2. Đan xen giữa kỷ niệm và chi tiêu một cách hài hước
      3. Thêm emoji phù hợp
      4. Chia thành 2-3 đoạn ngắn
      5. Kết thúc bằng một câu cảm xúc hoặc hài hước về chuyến đi
      6. KHÔNG dùng markdown heading (#), chỉ dùng text thuần với emoji

      Chỉ trả về nội dung câu chuyện, không cần tiêu đề hay giải thích thêm.
    `;

    const response = await genaiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const story = response.text || '';

    return NextResponse.json({ story: story.trim() });
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
