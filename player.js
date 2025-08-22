const MPV = require('node-mpv');

class Player {
    constructor() {
        this.mpv = new MPV({ audio_only: false, auto_restart: true });
        this.defaultQueue = [];
        this.userQueue = [];
        this.current = null;

        // слушаем всегда завершение трека
        this.mpv.on('stopped', () => this.handleStopped());
    }

    addDefault(url) {
        this.defaultQueue.push(url);
    }

    addUser(url) {
        this.userQueue.push(url);
    }

    async playNext() {
        // если что-то уже играет, не трогаем (стартуем только когда нет current)
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
            // если mpv упал, сразу пробуем следующий
            this.handleStopped();
        }
    }

    async handleStopped() {
        if (!this.current) {
            // ничего не играет, просто пытаемся стартовать
            await this.playNext();
            return;
        }

        const currentUrl = this.current;
        let isUser = this.userQueue[0] === currentUrl;

        // обработка завершения
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
