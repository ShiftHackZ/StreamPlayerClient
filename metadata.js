const ytdl = require('@distube/ytdl-core');
const path = require('path');
const fs = require('fs');

class MetadataResolver {
    constructor() {
        this.cache = new Map();
    }

    isHttp(url) {
        return /^https?:\/\//i.test(url);
    }

    looksLocalPath(url) {
        return path.isAbsolute(url) || url.startsWith('\\\\');
    }

    async titleFromLocalFile(filePath) {
        try {
            const { parseFile } = await import('music-metadata');
            const meta = await parseFile(filePath);
            const title = meta?.common?.title || path.basename(filePath);
            const artist = meta?.common?.artist;
            return artist ? `${artist} — ${title}` : title;
        } catch {
            return path.basename(filePath);
        }
    }

    async getTitle(url) {
        if (this.cache.has(url)) return this.cache.get(url);

        let title = url;

        try {
            if (ytdl.validateURL(url)) {
                const info = await ytdl.getInfo(url);
                title = info?.videoDetails?.title || url;
            } else if (this.looksLocalPath(url) && fs.existsSync(url)) {
                title = await this.titleFromLocalFile(url);
            } else if (this.isHttp(url)) {
                const pathname = new URL(url).pathname || '';
                const last = decodeURIComponent(pathname.split('/').pop() || '');
                title = last || url;
            } else {
                title = path.basename(url);
            }
        } catch {

        }

        this.cache.set(url, title);
        return title;
    }

    async getTitles(urls) {
        return Promise.all((urls || []).map(u => this.getTitle(u)));
    }
}

module.exports = new MetadataResolver();
