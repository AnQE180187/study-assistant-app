const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INTERNAL_API_BASE = process.env.INTERNAL_API_BASE || 'http://localhost:5000/api';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Gửi prompt đến Gemini và nhận về danh sách flashcard dạng [{question, answer}]
 * @param {string} keyword - Chủ đề hoặc từ khóa do người dùng nhập
 * @returns {Promise<Array<{question: string, answer: string}>>}
 */
async function generateFlashcardsFromGemini(keyword, count = 10, language = 'vi') {
  // Map code sang tên ngôn ngữ
  const langMap = { vi: 'tiếng Việt', en: 'English', ja: 'Japanese' };
  const langName = langMap[language] || 'tiếng Việt';
  const prompt = `Hãy tạo CHÍNH XÁC ${count} flashcard về chủ đề "${keyword}" bằng ngôn ngữ ${langName}. Trả về MỘT mảng JSON gồm ${count} phần tử, mỗi phần tử có dạng: { "question": "...", "answer": "..." }. Không giải thích gì thêm, chỉ trả về JSON array.`;
  let model;
  try {
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (e) {
    throw new Error('Không khởi tạo được model Gemini: ' + e.message);
  }
  let result, text;
  try {
    result = await model.generateContent(prompt);
    text = result.response.text();
  } catch (err) {
    console.error('Lỗi gọi Gemini:', err);
    throw new Error('Lỗi gọi Gemini: ' + (err.message || err));
  }
  const jsonMatch = text.match(/\[.*\]/s);
  if (!jsonMatch) {
    console.error('Gemini không trả về JSON hợp lệ:', text);
    throw new Error('Gemini không trả về JSON hợp lệ');
  }
  let flashcards;
  try {
    flashcards = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Lỗi parse JSON từ Gemini:', e, text);
    throw new Error('Lỗi parse JSON từ Gemini: ' + e.message);
  }
  if (!Array.isArray(flashcards)) throw new Error('Kết quả không phải mảng flashcard');
  return flashcards;
}

/**
 * Gửi từng flashcard đến API nội bộ
 * @param {Array<{question: string, answer: string}>} flashcards
 * @param {string} deckId - ID của bộ thẻ (deck) để lưu flashcard
 * @param {string} token - JWT token xác thực
 * @returns {Promise<Array>} - Danh sách kết quả tạo flashcard
 */
async function sendFlashcardsToInternalAPI(flashcards, deckId, token) {
  const results = [];
  for (const card of flashcards) {
    try {
      const res = await axios.post(
        `${INTERNAL_API_BASE}/decks/${deckId}/flashcards`,
        { term: card.question, definition: card.answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      results.push({ success: true, data: res.data });
    } catch (err) {
      results.push({ success: false, error: err.response?.data || err.message });
    }
  }
  return results;
}

module.exports = {
  generateFlashcardsFromGemini,
  sendFlashcardsToInternalAPI,
}; 