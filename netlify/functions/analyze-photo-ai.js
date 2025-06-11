// Importamos las librerías necesarias de Google Cloud
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { TextServiceClient } = require('@google-ai/generativelanguage'); // <-- CAMBIO AQUÍ: Usamos TextServiceClient para Gemini

// Inicializamos los clientes de las APIs de Google Cloud
const visionClient = new ImageAnnotatorClient({
    key: process.env.GOOGLE_API_KEY, // <-- CAMBIO AQUÍ
});

const generativeLanguageClient = new TextServiceClient({
    authClient: new (require('google-auth-library').GoogleAuth)({
        key: process.env.GOOGLE_API_KEY, // <-- Y CAMBIO AQUÍ
    }),
});

// Prompts mejorados para cada punto de interés
// ¡Asegúrate de que los nombres de los puntos coincidan EXACTAMENTE con lo que esperas de Vision API!
const prompts = {
    "Catedral de Pamplona": `Para la Catedral de Pamplona, dame 3 datos históricos clave que abarquen su construcción y evolución. Describe 2-3 elementos arquitectónicos destacados (por ejemplo, el claustro gótico, la fachada neoclásica). Explica su relevancia cultural como sede episcopal y centro religioso. Finalmente, incluye una curiosidad o anécdota interesante relacionada con ella.`,
    "Plaza del Castillo": `Enfocándonos en la Plaza del Castillo, dame 3 datos históricos clave sobre su evolución como centro de la ciudad. Destaca 2-3 elementos o edificios emblemáticos que la rodean. Describe su relevancia social y cultural como punto de encuentro y escenario de eventos. Incluye su conexión con los Sanfermines, y una curiosidad sobre algún hecho o personaje que la marque.`,
    "Ciudadela de Pamplona": `Para la Ciudadela de Pamplona, dame 3 datos históricos clave sobre su construcción y papel defensivo. Describe 2-3 elementos arquitectónicos destacados (como los baluartes, pabellones). Explica su relevancia actual como espacio verde y cultural. Menciona si tiene alguna conexión con los Sanfermines o si alberga algún evento notable.`,
    "Ayuntamiento de Pamplona": `Sobre el Ayuntamiento de Pamplona, dame 2-3 datos históricos clave sobre su edificio y función. Describe brevemente su arquitectura principal. Explica su relevancia cultural y social como epicentro de la vida política y festiva. Destaca su conexión con los Sanfermines, y alguna anécdota o detalle interesante.`,
    "Murallas de Pamplona (Baluarte de la Redonda)": `Para las Murallas de Pamplona, centrándonos en el Baluarte de la Redonda, dame 3 datos históricos clave sobre su construcción y su importancia defensiva. Describe 2 elementos arquitectónicos destacados de las murallas en general y de este baluarte. Explica su relevancia actual como patrimonio y paseo. Menciona cualquier conexión con los Sanfermines o eventos que se celebren en su entorno.`,
    "Parque de la Taconera": `Respecto al Parque de la Taconera, dame 2-3 datos históricos clave sobre su origen y diseño. Describe 2-3 elementos destacados del parque (como la fauna, los jardines). Explica su relevancia cultural y social como pulmón verde y lugar de ocio. Incluye alguna curiosidad sobre su historia o sus habitantes.`,
    "Mercado de Santo Domingo": `Para el Mercado de Santo Domingo, dame 2 datos históricos clave sobre su creación y evolución. Describe breve 2-3 elementos arquitectónicos o su ambiente principal. Explica su relevancia cultural y social como centro de abastos tradicional. Destaca su conexión con los Sanfermines, especialmente con el recorrido del encierro, y alguna anécdota o aspecto curioso.`,
    "Museo de Navarra": `Sobre el Museo de Navarra, dame 2-3 datos históricos clave sobre el edificio que lo alberga y su colección. Describe 2-3 elementos destacados de su colección o su arquitectura. Explica su relevancia cultural como guardián del patrimonio navarro. Menciona alguna obra clave o curiosidad que lo haga especial.`,
    "Puerta de Francia (Portal de Francia)": `Para la Puerta de Francia, dame 2 datos históricos clave sobre su construcción y función. Describe 2 elementos arquitectónicos destacados. Explica su relevancia histórica y cultural como entrada principal a la ciudad y punto del Camino de Santiago. Menciona alguna conexión con los Sanfermines o curiosidad relacionada con su pasado.`,
    "Monumento al Encierro": `Sobre el Monumento al Encierro, dame 2 datos históricos clave sobre su creación y significado. Describe 2 elementos arquitectónicos o escultóricos destacados. Explica su relevancia cultural y social como símbolo de los Sanfermines. Incluye alguna anécdota o dato interesante sobre su concepción o el artista.`,
    "Baluarte del Redín": `Para el Baluarte del Redín, dame 2-3 datos históricos clave sobre su función defensiva y su construcción. Describe 2-3 elementos arquitectónicos destacados (como la muralla, las vistas). Explica su relevancia cultural y paisajística como mirador y espacio histórico. Incluye alguna curiosidad o hecho notable asociado a este punto de las murallas.`,
    "Iglesia de San Saturnino (San Cernin)": `Sobre la Iglesia de San Saturnino, dame 2-3 datos históricos clave sobre su construcción y su papel como iglesia-fortaleza. Describe 2-3 elementos arquitectónicos destacados (torres, pórticos). Explica su relevancia cultural y religiosa para el casco antiguo. Menciona si tiene alguna conexión con los Sanfermines o tradiciones locales.`,
    "Iglesia de San Nicolás": `Para la Iglesia de San Nicolás, dame 2-3 datos históricos clave sobre su origen y su evolución. Describe 2-3 elementos arquitectónicos destacados (su aspecto fortificado, vidrieras, órgano). Explica su relevancia cultural y religiosa como una de las iglesias medievales de Pamplona. Incluye alguna curiosidad o rasgo particular de su interior o exterior.`,
    "Iglesia de San Lorenzo (Capilla de San Fermín)": `Sobre la Iglesia de San Lorenzo, dame 2-3 datos históricos clave sobre su construcción y su importancia para el culto a San Fermín. Describe 2-3 elementos arquitectónicos destacados, haciendo énfasis en la Capilla de San Fermín. Explica su relevancia cultural y religiosa como centro de la devoción a San Fermín. Destaca su conexión central con los Sanfermines y alguna anécdota relacionada con el santo o la capilla.`,
    "Parque de la Media Luna": `Para el Parque de la Media Luna, dame 2-3 datos históricos clave sobre su diseño y creador. Describe 2-3 elementos destacados del parque (su forma, el estanque, las vistas). Explica su relevancia cultural y social como un oasis urbano. Incluye alguna curiosidad sobre su nombre o su uso.`,
    "Parque Fluvial del Arga": `Sobre el Parque Fluvial del Arga, dame 2 datos históricos clave sobre su desarrollo y función. Describe 2-3 elementos destacados que lo componen (puentes, pasarelas, vegetación). Explica su relevancia cultural y ecológica para la ciudad. Menciona alguna actividad que se pueda realizar y alguna curiosidad sobre la vida a lo largo del río.`,
    "Jardines de la Tejería": `Para los Jardines de la Tejería, dame 2 datos históricos clave sobre su origen y relación con las murallas. Describe 2 elementos destacados de los jardines (el mirador, la vegetación). Explica su relevancia cultural y paisajística como un rincón tranquilo con vistas. Incluye alguna curiosidad o dato poco conocido sobre este espacio.`,
    
    // Prompt general de fallback si no se detecta ningún hito específico
    "general": (detectedLabels, latitude, longitude) => {
        let text = `El usuario está en las coordenadas Lat: ${latitude}, Lon: ${longitude} en Pamplona.`;
        if (detectedLabels && detectedLabels.length > 0) {
            text += ` La imagen parece mostrar elementos como: ${detectedLabels.slice(0, 3).map(l => l.description).join(', ')}.`;
        } else {
            text += ` No pude identificar claramente ningún hito o elemento específico en la imagen.`;
        }
        text += ` ¿Puedes proporcionar información interesante y relevante sobre lo que el usuario podría estar viendo en esta zona de Pamplona, basándote en la descripción? Sé conciso, amigable y como una mini-audioguía.`
        return text;
    }
};

// Función principal que se ejecuta cuando se llama a esta Netlify Function
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed or missing body' }),
        };
    }

    try {
        const { imageData, latitude, longitude } = JSON.parse(event.body);

        // PASO 1: Análisis de imagen con Vision API
        const [visionResult] = await visionClient.annotateImage({
            image: { content: imageData },
            features: [{ type: 'LABEL_DETECTION' }, { type: 'LANDMARK_DETECTION' }],
        });

        const labels = visionResult.labelAnnotations || [];
        const landmarks = visionResult.landmarkAnnotations || [];

        console.log('Detected Labels:', labels.map(label => label.description));
        console.log('Detected Landmarks:', landmarks.map(landmark => landmark.description));

        let detectedInfo = '';
        if (landmarks.length > 0) {
            detectedInfo = `El sistema de visión identificó el siguiente hito: ${landmarks[0].description}.`;
        } else if (labels.length > 0) {
            detectedInfo = `La imagen muestra elementos como: ${labels.slice(0, 3).map(l => l.description).join(', ')}.`;
        } else {
            detectedInfo = 'No pude identificar claramente nada en la imagen.';
        }

        // PASO 2: Selección del prompt para Gemini
        let chosenPromptContent;

        if (landmarks.length > 0 && prompts[landmarks[0].description]) {
            // Si el hito detectado es uno de nuestros prompts específicos
            chosenPromptContent = prompts[landmarks[0].description];
        } else {
            // Si no hay hito específico o no está en nuestra lista, usamos el prompt general
            chosenPromptContent = prompts.general(labels, latitude, longitude); // Pasamos las etiquetas para el prompt general
        }
        
        // PASO 3: Generación de respuesta con Gemini
        // El método de Gemini para generar contenido es 'generateContent'
        const [modelResponse] = await generativeLanguageClient.generateContent({
            model: 'gemini-pro',
            contents: [{ parts: [{ text: chosenPromptContent }] }],
        });

        const generatedText = modelResponse.candidates[0]?.content?.parts[0]?.text || 'No se pudo generar una respuesta detallada para este lugar.';

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Análisis completado",
                detected: detectedInfo,
                aiResponse: generatedText,
            }),
        };
    } catch (error) {
        console.error('Error en la función:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error en el procesamiento', error: error.message }),
        };
    }
};
