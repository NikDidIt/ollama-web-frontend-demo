

function buildModelSelect() {
    fetch('/api/v0/models')
        .then(response => response.json())
        .then(data => {
            const modelSelect = document.getElementById('model');
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.text = model.name;
                if (model.default) {
                    option.selected = true;
                }
                modelSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching models:', error);
        });
}

function sendChat() {
    const chatInput = document.getElementById('chat');
    const chatContainer = document.getElementById('chat-container');
    const modelSelect = document.getElementById('model');
    const submitButton = document.getElementById('chat-submit');
    const loading = document.getElementById('loading');
    loading.style.display = 'inline-block';

    chatInput.disabled = true;
    modelSelect.disabled = true;
    submitButton.disabled = true;


    const chat = chatInput.value;
    const model = modelSelect.value;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message-me');
    messageElement.textContent = 'You: ' + chat;
    chatContainer.appendChild(messageElement);
    chatInput.value = '';

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });

    fetch('/api/v0/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chat, model })
    }).then(response => response.json()).then(data => {
        const message = data.html;
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-ai');
        messageElement.innerHTML = 'AI: ' + message;
        chatContainer.appendChild(messageElement);
        

        chatInput.disabled = false;
        modelSelect.disabled = false;
        submitButton.disabled = false;
        loading.style.display = 'none';

        messageElement.scrollIntoView({
            behavior: 'smooth', // for smooth scrolling animation
            block: 'start'      // aligns the top of the element with the top of the viewport
        });

    }).catch(error => {
        console.error('Error sending chat:', error);
    });

}