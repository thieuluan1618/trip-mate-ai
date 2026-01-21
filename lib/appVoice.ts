// App personality & voice - funny, casual Vietnamese vibes
export const appVoice = {
  // Upload & AI Analysis errors
  uploadErrors: [
    'AI đang bận ngắm cảnh, thử lại sau nhé! 🏞️',
    'AI mải uống cà phê ☕, chờ xíu nha!',
    'AI đang selfie ở góc đẹp, chờ tí nữa! 🤳',
    'AI ngủ gật rồi 😴, thức dậy đi!',
    'Ảnh quá đẹp khiến AI choáng váng, chờ tí! 🤩',
    'AI đang đếm tiền (không phải của bạn), thử lại nha! 💸',
  ],

  // Success messages
  successMessages: [
    '✨ Thêm xong! AI bảo: Quá tuyệt vời!',
    '🎉 Bill được lưu, ví bạn khóc rồi!',
    '💰 Thêm chi tiêu. Mẹ bạn: "Sao lại nhiều vậy?"',
    '📸 Kỷ niệm được lưu, cảm xúc cũng được lưu! 💔',
    '🚀 Xong! Bây giờ chia tiền đi!',
  ],

  // Dashboard messages
  budgetMessages: {
    safe: '💚 An toàn! Tiếp tục du lịch nhé!',
    warning: '⚠️ Cảnh báo: Ví đang "cay"!',
    overdraft: '🔴 VỠ NỢ! Ai cho bạn tiền đó? 💔',
  },

  // Empty states
  emptyStates: [
    '📭 Chưa có chi tiêu nào... hay là bạn quên thêm? 😅',
    '🎯 Đội trưởng giàu! Chưa tiêu đồng nào!',
    '🤐 Lặng lẽ... không ai muốn nói chi tiêu của mình! 🤐',
  ],

  // Trip analysis intro
  analysisIntro: [
    '🔮 Hãy xem AI có gì để nói về thói quen chi tiêu của bạn...',
    '📊 AI đang phân tích... chuẩn bị shock nhé!',
    '🎯 Chờ xíu, AI sẽ bóc phốt ví của bạn!',
  ],

  // Loading states
  loadingMessages: [
    'Đang phân tích ảnh... 🤔',
    'AI đang hù dọa... 😱',
    'Chờ tí, AI ngắm cảnh nè! 🏞️',
    'Đang process... em AI vất vả quá! 💪',
  ],

  // Button tooltips
  tooltips: {
    upload: 'Chụp hóa đơn hoặc ảnh kỷ niệm, AI tự động phân loại!',
    analyze: 'Thấy muốn biết AI nói gì về thói tiêu của mình không? 😏',
    split: 'Chia đều tiền để ai cũng yên tâm!',
    budget: 'Đặt giới hạn trước khi quá muộn! 💸',
  },

  // Motivational messages
  motivation: [
    '📈 Tiêu thêm chút nữa là hết ngân sách! Cố lên! 🚀',
    '💪 Bạn đã tiêu khôn ngoan! (Nói dối để bạn vui)',
    '🎊 Mỗi ngày là một cơ hội tiêu tiền mới!',
  ],
};

// Get random message from array
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

// Format currency with personality
export const formatCurrencyWithVibe = (amount: number): string => {
  if (amount === 0) return '0k (Siêu thú vị!)';
  if (amount < 100) return `${amount}k (Tiền đồng!)`;
  if (amount < 500) return `${amount}k (Bình thường!)`;
  if (amount < 1000) return `${amount}k (Hơi cay!)`;
  if (amount < 2000) return `${amount}k (Thôi rồi...)`;
  return `${amount}k (VỠ NỢ!!!)`;
};

// Get budget status with vibe
export const getBudgetStatusWithVibe = (
  spent: number,
  budget: number
): { status: 'safe' | 'warning' | 'overdraft'; message: string; emoji: string } => {
  const percent = (spent / budget) * 100;

  if (percent <= 79) {
    return {
      status: 'safe',
      message: appVoice.budgetMessages.safe,
      emoji: '💚',
    };
  } else if (percent <= 99) {
    return {
      status: 'warning',
      message: appVoice.budgetMessages.warning,
      emoji: '⚠️',
    };
  } else {
    return {
      status: 'overdraft',
      message: appVoice.budgetMessages.overdraft,
      emoji: '🔴',
    };
  }
};
