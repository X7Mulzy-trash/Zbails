import makeWASocket from './Socket/index.js';
import chalk from "chalk";

const gradients = [
    [[255, 80, 120], [255, 180, 210]],
    [[140, 90, 255], [90, 200, 255]],
    [[0, 200, 255], [120, 255, 220]],
    [[255, 170, 0], [255, 255, 120]],
    [[255, 0, 0], [255, 140, 0], [255, 230, 0], [0, 200, 0], [0, 120, 255], [75, 0, 200], [160, 0, 220]]
];

const g = gradients[Math.floor(Math.random() * gradients.length)];

const gradient = (text) => {
    const lines = text.split("\n");
    const w = Math.max(...lines.map(l => l.length)) - 1 || 1;
    return lines.map(line => line.split("").map((ch, i) => {
        const t = (i / w) * (g.length - 1);
        const k = Math.min(Math.floor(t), g.length - 2);
        const [r, gg, b] = g[k].map((v, j) => Math.round(v + (g[k + 1][j] - v) * (t - k)));
        return `\x1b[38;2;${r};${gg};${b}m${ch}`;
    }).join("") + "\x1b[0m").join("\n");
};

console.log(`${gradient(`
╔═╗╔═╗╦═╗╔═╗  ╔╗ ╔═╗╦╦  ╔═╗╦ ╦╔═╗
╔═╝║╣ ╠╦╝║ ║  ╠╩╗╠═╣║║  ║╣ ╚╦╝╚═╗
╚═╝╚═╝╩╚═╚═╝  ╚═╝╩ ╩╩╩═╝╚═╝ ╩ ╚═╝
`)}`);
console.log(`${gradient("Whatsapp botz baileys modification")}`);
console.log(`${gradient("Telegram creator: https://t.me/xpossed404")}`);
console.log(`${gradient("Telegram channel: https://t.me/coresix6")}`);

export * from '../WAProto/index.js';
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';
export * from './Store/index.js';
export { makeWASocket };
export default makeWASocket;
//# sourceMappingURL=index.js.map