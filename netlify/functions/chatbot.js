// netlify/functions/chatbot.js

// Necesitarás instalar la librería de Google Generative AI para Node.js
// npm install @google/generative-ai
const { GoogleGenerativeLanguageServiceClient } = require('@google/generative-ai');

// Este es el punto de entrada para tu Netlify Function
exports.handler = async function(event, context) {
    // Solo permitir solicitudes POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Acceder a la clave API de Gemini desde las variables de entorno de Netlify
    // Asegúrate de configurar GEMINI_API_KEY en la configuración de tu sitio en Netlify
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("GEMINI_API_KEY no está configurada como variable de entorno en Netlify.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API Key no configurada.' })
        };
    }

    const client = new GoogleGenerativeLanguageServiceClient({ authClient: API_KEY });
    // Define el modelo que quieres usar
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        // Parsear el cuerpo de la solicitud para obtener el historial de chat (contents)
        const { contents } = JSON.parse(event.body);

        // Puedes añadir un "system instruction" aquí si quieres que el chatbot tenga un rol predefinido.
        // Esto es opcional, pero ayuda a guiar el comportamiento del modelo.
        // Por ejemplo, para un guía turístico de Pamplona:
        const systemInstruction = {
            role: "user", // Nota: para system instructions, el rol es 'user' y el modelo responde
            parts: [{ text: "Eres un experto guía turístico de Pamplona. Responde preguntas sobre los lugares de interés, historia, gastronomía y cultura de la ciudad. Si la pregunta no es sobre Pamplona, indica que solo puedes ayudar con información de Pamplona." }]
        };

        // Combina la instrucción del sistema con el historial de chat real
        const fullContents = [systemInstruction, ...contents];

        // Realizar la llamada a la API de Gemini
        const result = await model.generateContent({ contents: fullContents });
        const response = result.response;
        const text = response.text(); // Obtener el texto de la respuesta del modelo

        // Devolver la respuesta exitosa al frontend
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
        };
    } catch (error) {
        console.error('Error al llamar a la API de Gemini:', error);
        // Devolver un error al frontend
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Error interno del servidor al procesar la solicitud.' }),
        };
    }
};