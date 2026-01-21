import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const getGeminiModel = (model = 'gemini-2.5-flash-preview-09-2025') => {
  return genAI.getGenerativeModel({ model });
};

export interface AIAnalysisResult {
  type: 'expense' | 'memory';
  category: 'food' | 'stay' | 'transport' | 'scenery' | 'other';
  name: string;
  amount: number;
  description: string;
}

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<AIAnalysisResult> => {
  const model = getGeminiModel();

  const prompt = `
    Hãy phân tích bức ảnh này để hỗ trợ ứng dụng quản lý chi tiêu du lịch.
    Trả về kết quả dưới dạng JSON KHÔNG CÓ markdown format (chỉ raw json string).
    
    Logic phân loại:
    - Nếu là Hóa đơn/Bill/Menu giá tiền: type = "expense", category = "food" (hoặc stay/transport tùy ngữ cảnh), name = "Tên quán/dịch vụ", amount = số tiền tổng (số nguyên).
    - Nếu là Đồ ăn (không có giá): type = "memory", category = "food", name = "Món ngon", description = "Mô tả ngắn hấp dẫn về món ăn + emoji".
    - Nếu là Phong cảnh/Người: type = "memory", category = "scenery", name = "Khoảnh khắc", description = "Mô tả cảm xúc vui vẻ về bức ảnh + emoji".

    JSON Schema:
    {
      "type": "expense" | "memory",
      "category": "food" | "stay" | "transport" | "scenery" | "other",
      "name": "string",
      "amount": number (chỉ nếu là expense, nếu không thì 0),
      "description": "string"
    }
  `;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType } },
  ]);

  const text = result.response.text();
  const jsonStr = text.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonStr);
};

export const analyzeTripExpenses = async (expenses: any[]): Promise<string> => {
  const model = getGeminiModel();
  const prompt = `
    Phân tích chi tiêu du lịch này một cách hài hước, ngắn gọn bằng tiếng Việt (tối đa 150 từ).
    Dữ liệu: ${JSON.stringify(expenses)}
    Thêm emoji và đề xuất tiết kiệm.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
