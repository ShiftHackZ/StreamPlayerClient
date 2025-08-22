const { app, BrowserWindow } = require('electron');
const express = require('express');
const WebSocket = require('ws');
const Player = require('./player');
const metadata = require('./metadata');
const fs = require('fs');
const path = require('path');

let mainWindow;
const player = new Player();

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: true }
    });
    mainWindow.loadFile('renderer/index.html');
}

app.on('ready', createWindow);

const defaultPlaylist = loadM3U(path.join(__dirname, 'default.m3u'));
defaultPlaylist.forEach(url => player.addDefault(url));

const api = express();
api.use(express.json());

api.post('/queue', (req, res) => {
    const { url, user = false } = req.body;
    if (user) player.addUser(url);
    else player.addDefault(url);
    res.json({ status: "queued" });
});

api.post('/play', async (req, res) => {
    await player.playNext()
    res.json({ status: "playing" });
});

api.post('/toggle', async (req, res) => {
    await player.mpv.togglePause();
    res.json({ status: "toggled pause" });
});

api.post('/skip', async (req, res) => {
    await player.mpv.stop();
    await player.playNext();
    res.json({ status: "skipped" });
});

api.get('/status', async (req, res) => {
    const st = player.getStatus();

    const [currentTitle, userTitles, defaultTitles] = await Promise.all([
        st.current ? metadata.getTitle(st.current) : Promise.resolve(null),
        metadata.getTitles(st.userQueue),
        metadata.getTitles(st.defaultQueue)
    ]);

    res.json({
        current: st.current ? { url: st.current, title: currentTitle } : null,
        userQueue: st.userQueue.map((url, i) => ({ url, title: userTitles[i] })),
        defaultQueue: st.defaultQueue.map((url, i) => ({ url, title: defaultTitles[i] }))
    });
});

api.listen(3000, () => console.log("API running on :3000"));

const wss = new WebSocket.Server({ port: 3001 });
wss.on('connection', ws => {
    ws.send(JSON.stringify(player.getStatus()));
});

function loadM3U(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const lines = fs.readFileSync(filePath, 'utf-8')
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
    return lines;
}
