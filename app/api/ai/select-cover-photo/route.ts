import { NextRequest, NextResponse } from 'next/server';
import { genaiClient, GEMINI_MODEL } from '@/lib/vertexai';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty items array' },
        { status: 400 }
      );
    }

    // Filter items that have thumbnail images
    const itemsWithImages = items.filter(
      (item: any) => item.thumbnailUrl || item.imageUrl
    );

    if (itemsWithImages.length === 0) {
      return NextResponse.json(
        { error: 'No items with images found' },
        { status: 400 }
      );
    }

    // If only one image, just return it
    if (itemsWithImages.length === 1) {
      return NextResponse.json({
        coverImageUrl: itemsWithImages[0].thumbnailUrl || itemsWithImages[0].imageUrl,
        reason: 'Chỉ có một ảnh trong chuyến đi',
      });
    }

    // Prepare metadata for AI selection
    const candidates = itemsWithImages.map((item: any, index: number) => ({
      index,
      category: item.category,
      name: item.name,
      description: item.description,
      type: item.type,
      timestamp: item.timestamp,
    }));

    const prompt = `
      Bạn là AI chọn ảnh bìa đại diện cho chuyến du lịch.
      Dưới đây là danh sách các mục trong chuyến đi. Hãy chọn MỘT mục phù hợp nhất làm ảnh bìa.

      Tiêu chí ưu tiên:
      1. Ảnh phong cảnh (scenery) > ảnh đồ ăn (food) > ảnh khác
      2. Mô tả hấp dẫn, sinh động
      3. Là kỷ niệm (memory) thì tốt hơn hóa đơn (expense)
      4. Ảnh ở giữa chuyến đi thì đại diện hơn

      Danh sách: ${JSON.stringify(candidates)}

      Trả về JSON KHÔNG CÓ markdown (raw json):
      { "selectedIndex": number, "reason": "lý do ngắn gọn bằng tiếng Việt" }
    `;

    const response = await genaiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || '';
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    const selectedItem = itemsWithImages[result.selectedIndex] || itemsWithImages[0];
    const coverImageUrl = selectedItem.thumbnailUrl || selectedItem.imageUrl;

    return NextResponse.json({
      coverImageUrl,
      reason: result.reason || 'AI đã chọn ảnh đại diện tốt nhất',
    });
  } catch (error) {
    console.error('Cover photo selection error:', error);
    return NextResponse.json(
      { error: 'Failed to select cover photo' },
      { status: 500 }
    );
  }
}
