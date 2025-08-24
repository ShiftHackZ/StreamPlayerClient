# StreamClient

StreamClient is an open-source music streaming backend designed to run on an OBS (Open Broadcaster Software) streamer machine. It manages a music queue with a default playlist and allows external sources (such as Telegram bots or other backends) to add YouTube links or other audio sources to the queue via a simple HTTP API.

## Features

- **Default Playlist**: Plays a pre-defined list of tracks (local files or URLs) from an `.m3u` file.
- **User Queue**: Accepts YouTube links or other URLs from external sources via HTTP API.
- **Metadata Resolution**: Fetches and displays track titles from YouTube or local files.
- **WebSocket Status**: Provides real-time status updates for connected clients.
- **OBS Integration**: Designed to be used as an audio source in OBS for live streaming.

## Architecture

- **Electron**: Provides a minimal GUI for local control.
- **Express.js**: Serves as the HTTP API backend.
- **WebSocket**: Broadcasts player status to connected clients.
- **node-mpv**: Controls the MPV media player for playback.
- **music-metadata**: Extracts metadata from local audio files.
- **ytdl-core**: Fetches metadata and streams from YouTube links.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MPV Media Player](https://mpv.io/) installed and available in your system PATH
- (Optional) [OBS Studio](https://obsproject.com/) for streaming

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/StreamClient.git
   cd StreamClient
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Prepare your default playlist:**
   - Create a `default.m3u` file in the project root.
   - Add local file paths or URLs, one per line.

4. **Start the application:**
   ```sh
   npm start
   ```
   
### Building

To build the application for distribution (Windows x64 for example), run this command:

```sh
npx electron-packager . StreamClient --platform=win32 --arch=x64 --out=dist --overwrite
```

### Usage

- **Streaming**: Add the system's audio output (or MPV's output) as an audio source in OBS.
- **API**: Interact with the backend via HTTP requests.

#### API Endpoints

- `POST /queue`  
  Add a track to the queue.  
  Body: `{ "url": "<YouTube or audio URL>", "user": true }`

- `POST /play`  
  Start playback of the next track.

- `POST /toggle`  
  Toggle pause/resume.

- `POST /skip`  
  Skip the current track.

- `GET /status`  
  Get current status, including current track and queue.

#### WebSocket

- Connect to `ws://localhost:3001` to receive real-time status updates.

### Example Integration (Telegram Bot)

You can build a Telegram bot or other backend that sends YouTube links to the `/queue` endpoint to allow viewers or admins to add music to the stream.

## File Structure

- `main.js` — Main Electron and backend logic.
- `player.js` — Queue and playback management (not shown here).
- `metadata.js` — Metadata resolution for tracks.
- `default.m3u` — Default playlist file.
- `renderer/` — (Optional) GUI frontend.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, features, or documentation improvements.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgements

- [node-mpv](https://github.com/j-holub/node-mpv)
- [music-metadata](https://github.com/Borewit/music-metadata)
- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [Electron](https://www.electronjs.org/)
- [Express](https://expressjs.com/)

