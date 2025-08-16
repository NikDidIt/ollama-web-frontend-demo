const express = require('express');
const path = require('path'); // Required for path.join
const { Ollama } = require('ollama');
const showdown = require('showdown');

const app = express();
const port = process.env.PORT || 3005;

const ollamaHost = process.env.OLLAMAHOST || 'http://localhost:11434'
const ollamaDefaultModel = process.env.OLLAMADEFAULTMODEL || 'qwen2.5:1.5b'
const ollamaObj = new Ollama({ host: ollamaHost });

let availibleModels = [];
getOllamaModels(availibleModels);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'web')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.htm'));
});

app.get('/api/v0/models', (req, res) => {
    let sendModels = [];
    availibleModels.forEach(model => {
        if (model == ollamaDefaultModel) {
            sendModels.push({ name: model, default: true})
        } else
            sendModels.push({ name: model, default: false})
    });    
    res.json({ models: sendModels });
});

app.post('/api/v0/chat', (req, res) => {
    //console.log(req.body);
    const chat = req.body.chat;
    const model = req.body.model;

    ollamaObj.chat({
        model: model,
        messages: [{ role: 'user', content: chat }],
        stream: false
    }).then(response => {
        //console.log(response);
        let converter = new showdown.Converter();
        let html = converter.makeHtml(response.message.content);
        response.message.html = html;
        res.json(response.message);
    }).catch(error => {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    });

});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


async function getOllamaModels(availibleModels) {
    try {
        const ollama = ollamaObj; //new Ollama({ host: host });
        const models = await ollama.list();
        models.models.forEach(model => {
            availibleModels.push(model.name);
        });
    } catch (error) {
        console.error('Error fetching Ollama models:', error);
    }
}
