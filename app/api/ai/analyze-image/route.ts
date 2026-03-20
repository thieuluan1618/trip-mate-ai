import { NextRequest, NextResponse } from 'next/server';
import { genaiClient, GEMINI_MODEL } from '@/lib/vertexai';

export interface AIAnalysisResult {
  type: 'expense' | 'memory';
  category: 'food' | 'stay' | 'transport' | 'scenery' | 'other';
  name: string;
  amount: number;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const { base64Data, mimeType } = await request.json();

    if (!base64Data || !mimeType) {
      return NextResponse.json(
        { error: 'Missing base64Data or mimeType' },
        { status: 400 }
      );
    }

    const prompt = `
      Hãy phân tích bức ảnh này để hỗ trợ ứng dụng quản lý chi tiêu du lịch.
      Trả về kết quả dưới dạng JSON KHÔNG CÓ markdown format (chỉ raw json string).

      Logic phân loại:

      1. Hóa đơn/Bill/Menu có giá tiền:
         type = "expense", amount = số tiền tổng (số nguyên, đơn vị nghìn VND)
         - Hóa đơn ăn uống → category = "food", name = "Tên quán/món"
         - Hóa đơn khách sạn/phòng → category = "stay", name = "Tên khách sạn"
         - Hóa đơn vé xe/taxi/xăng → category = "transport", name = "Tên dịch vụ"
         - Hóa đơn khác → category = "other", name = "Mô tả ngắn"

      2. Ảnh KHÔNG phải hóa đơn (kỷ niệm):
         type = "memory", amount = 0
         - Đồ ăn/thức uống/quán cafe → category = "food", name = "Tên món", description = "Mô tả hấp dẫn + emoji"
         - Phong cảnh/thiên nhiên/kiến trúc/địa danh → category = "scenery", name = "Tên địa điểm/cảnh", description = "Mô tả cảm xúc + emoji"
         - Khách sạn/phòng nghỉ/homestay → category = "stay", name = "Tên chỗ ở", description = "Mô tả + emoji"
         - Phương tiện/đường đi/sân bay/ga tàu → category = "transport", name = "Mô tả ngắn", description = "Mô tả + emoji"
         - Selfie/nhóm bạn/hoạt động/mua sắm → category = "other", name = "Mô tả ngắn", description = "Mô tả vui vẻ + emoji"

      JSON Schema:
      {
        "type": "expense" | "memory",
        "category": "food" | "stay" | "transport" | "scenery" | "other",
        "name": "string",
        "amount": number (chỉ nếu là expense, nếu không thì 0),
        "description": "string (mô tả ngắn gọn, sinh động, có emoji)"
      }
    `;

    const response = await genaiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } },
          ],
        },
      ],
    });

    const text = response.text || '';
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(jsonStr) as AIAnalysisResult;

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
