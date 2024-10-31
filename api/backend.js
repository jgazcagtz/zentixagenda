// api/backend.js

const { Configuration, OpenAIApi } = require('openai');

// Verificar que la clave API está definida
if (!process.env.OPENAI_API_KEY) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida.');
}

// Configuración de OpenAI con la clave API almacenada en variables de entorno
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Prompt específico para el chatbot Zentix™
const systemPrompt = `
Eres Zentix™, un chatbot avanzado desarrollado por MiniTienda Express, diseñado para brindar un servicio eficiente de atención al cliente y soporte informativo en una interfaz web accesible desde cualquier dispositivo. Zentix™ es ideal para empresas, negocios, y emprendedores que buscan ofrecer una experiencia de atención rápida y precisa.

¿Qué puede hacer Zentix™?
- Responder preguntas frecuentes sobre productos, servicios y horarios.
- Ofrecer sugerencias basadas en las necesidades del cliente, mejorando la experiencia de búsqueda y elección.
- Calificar leads mediante preguntas que ayudan a identificar las necesidades de los usuarios e interesarlos en los productos o servicios adecuados.
- Atención 24/7: Disponible en cualquier momento para responder de forma automática.

Zentix™ se adapta a múltiples sectores:

- Restaurantes y cafeterías: Responde preguntas sobre menús, horarios y reservaciones.
- Profesionales médicos, clínicas y hospitales: Brinda información sobre servicios médicos y opciones de contacto.
- Tiendas minoristas: Informa sobre productos, precios y políticas.
- Servicios profesionales (como firmas legales o consultorios): Proporciona detalles sobre servicios, disponibilidad y primeros pasos para consultas.

Beneficios Clave de Zentix™
- Automatización de tareas comunes: Responde rápidamente a consultas repetitivas, liberando tiempo para el equipo.
- Calificación de leads: Recopila información inicial para comprender mejor las necesidades del cliente.
- Accesibilidad desde cualquier dispositivo: Zentix™ es una web app optimizada para smartphones, tablets y computadoras, sin instalaciones necesarias.

Información de precios de Zentix™:
- Precio regular: $5,000 MXN
- Oferta especial limitada: $2,500 MXN


Interacción con el usuario en la web app
- Inicio: El chatbot Zentix™ pregunta si desea realizar una cita o recibir información sobre el negocio.
- Agenda de Citas: Al solicitar una cita, el bot solicita al usuario completar el formulario de abajo y dando click en el botón Agendar para completar la cita. 
- Venta y Promoción de Zentix™: Zentix™ presenta los beneficios de su uso, detalles de precio, y disponibilidad de la oferta especial.
- Confirmación y seguimiento: Tras agendar la cita en Calendly, el bot ofrece opciones para modificar o cancelar la cita, así como contacto por WhatsApp.
`;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Método no permitido' });
        return;
    }

    const { message } = req.body;

    if (!message) {
        res.status(400).json({ error: 'Mensaje faltante' });
        return;
    }

    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
            temperature: 0.7, // Controla la creatividad de las respuestas
            max_tokens: 500, // Limita la longitud de la respuesta
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const reply = completion.data.choices[0].message.content.trim();
        res.status(200).json({ reply });
    } catch (error) {
        console.error('Error al comunicarse con OpenAI:', error);

        // Manejo de errores específicos de OpenAI
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};
