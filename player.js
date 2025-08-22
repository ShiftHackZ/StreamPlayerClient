const MPV = require('node-mpv');

class Player {
    constructor() {
        this.mpv = new MPV({ audio_only: false, auto_restart: true });
        this.defaultQueue = [];
        this.userQueue = [];
        this.current = null;

        this.mpv.on('stopped', () => this.handleStopped());
    }

    addDefault(url) {
        this.defaultQueue.push(url);
    }

    addUser(url) {
        this.userQueue.push(url);
    }

    async playNext() {
        if (this.current) return;

        let next = null;
        if (this.userQueue.length > 0) {
            next = this.userQueue[0];
        } else if (this.defaultQueue.length > 0) {
            next = this.defaultQueue[0];
        } else {
            this.current = null;
            return;
        }

        this.current = next;
        try {
            await this.mpv.load(this.current);
            await this.mpv.play();
        } catch (e) {
            console.warn('mpv load/play failed:', e.message);
            this.handleStopped();
        }
    }

    async handleStopped() {
        if (!this.current) {
            await this.playNext();
            return;
        }

        const currentUrl = this.current;
        let isUser = this.userQueue[0] === currentUrl;

        if (isUser) {
            this.userQueue.shift(); // удаляем user после окончания
        } else if (this.defaultQueue[0] === currentUrl) {
            const finished = this.defaultQueue.shift();
            this.defaultQueue.push(finished); // зацикливаем
        }

        this.current = null;
        await this.playNext();
    }

    getStatus() {
        return {
            current: this.current,
            userQueue: [...this.userQueue],
            defaultQueue: [...this.defaultQueue]
        };
    }
}

module.exports = Player;
