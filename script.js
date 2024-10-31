document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();

        if (name === '' || phone === '' || email === '') {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Validación básica de correo electrónico
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        // Redirigir a Calendly con los parámetros necesarios
        const calendlyLink = `https://calendly.com/minitienda-info/30min?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`;
        window.open(calendlyLink, '_blank');
    });

    // Integración del Chatbot Zentix™
    initializeChatbot();
});

function initializeChatbot() {
    const chatbotContainer = document.getElementById('chatbot');
    chatbotContainer.innerHTML = `
        <div class="chatbot-window">
            <div class="chatbot-header">Zentix™</div>
            <div class="chatbot-body" id="chatbot-body">
                <div class="message bot">¡Hola! Soy Zentix™, ¿cómo puedo ayudarte hoy?</div>
            </div>
            <div class="chatbot-footer">
                <input type="text" id="chatbot-input" placeholder="Escribe tu mensaje...">
                <button id="chatbot-send">Enviar</button>
            </div>
        </div>
    `;

    document.getElementById('chatbot-send').addEventListener('click', sendMessage);
    document.getElementById('chatbot-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (message === '') return;

    appendMessage('user', message);
    input.value = '';

    // Enviar mensaje al backend para procesar con ChatGPT
    try {
        const response = await fetch('/api/backend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Error en la comunicación con el servidor.');
        }

        const data = await response.json();
        appendMessage('bot', data.reply);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        appendMessage('bot', 'Lo siento, hubo un error al procesar tu solicitud.');
    }
}

function appendMessage(sender, message) {
    const chatbotBody = document.getElementById('chatbot-body');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = message;
    chatbotBody.appendChild(messageDiv);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}
