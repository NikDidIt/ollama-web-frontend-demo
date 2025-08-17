

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
        const downloadMsg = document.createElement('img');
        downloadMsg.id = 'download';
        downloadMsg.src = 'down.gif';
        downloadMsg.classList.add('download');
        downloadMsg.title = 'Download Chat Message';
        messageElement.appendChild(downloadMsg);
        downloadMsg.onclick = function () {
            downloadMessage(messageElement);
        };

        chatInput.disabled = false;
        modelSelect.disabled = false;
        submitButton.disabled = false;
        loading.style.display = 'none';

        chatInput.focus(); //put the cursor back into the textarea

        messageElement.scrollIntoView({
            behavior: 'smooth', // for smooth scrolling animation
            block: 'start'      // aligns the top of the element with the top of the viewport
        });

    }).catch(error => {
        console.error('Error sending chat:', error);
    });

}

function textAreaListener(event) {
    const submitButton = document.getElementById('chat-submit');
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent the default Enter key behavior (e.g., new line)
        submitButton.click(); // Trigger the form submission
    }
}

function downloadMessage(element) {
    let downloadImg = null;
    for (const child of element.children) {
        if (child.id == 'download') { //remove image for downloaded file
            downloadImg = child;
            element.removeChild(child);
        }
    }

    //create a download link for the html data
    const blob = new Blob([element.innerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "OWF-"+new Date().toISOString()+".html";
    a.click();
    URL.revokeObjectURL(url);

    //add image back
    element.appendChild(downloadImg);
}