// netlify/functions/chatbot.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key no configurada." }),
    };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const { contents } = JSON.parse(event.body);

    const chat = model.startChat({
      history: contents,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const prompt = contents[contents.length - 1].parts[0].text;

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text: response }),
    };
  } catch (error) {
    console.error("Error al generar contenido:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};