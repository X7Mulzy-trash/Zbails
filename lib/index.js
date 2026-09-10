import makeWASocket from './Socket/index.js';
import chalk from "chalk";
const gradients = [
    { c1: [255, 80, 120], c2: [255, 180, 210] },
    { c1: [140, 90, 255], c2: [90, 200, 255] },
    { c1: [0, 200, 255], c2: [120, 255, 220] },
    { c1: [255, 170, 0], c2: [255, 255, 120] }
];
const g = gradients[Math.floor(Math.random() * gradients.length)];
const gradient = (text) => text.split("").map((ch, i, arr) => {
 const t = i / (arr.length - 1 || 1);
 const r = Math.round(g.c1[0] + (g.c2[0] - g.c1[0]) * t);
 const gg = Math.round(g.c1[1] + (g.c2[1] - g.c1[1]) * t);
 const b = Math.round(g.c1[2] + (g.c2[2] - g.c1[2]) * t);
 return `\x1b[38;2;${r};${gg};${b}m${ch}`;
}).join("") + "\x1b[0m";
console.log(`${gradient(`
╔═╗╔═╗╦═╗╔═╗  ╔╗ ╔═╗╦╦  ╔═╗╦ ╦╔═╗
╔═╝║╣ ╠╦╝║ ║  ╠╩╗╠═╣║║  ║╣ ╚╦╝╚═╗
╚═╝╚═╝╩╚═╚═╝  ╚═╝╩ ╩╩╩═╝╚═╝ ╩ ╚═╝
`)}`);
console.log(`${gradient("Baileys modified by: MulzyX7")}`);
console.log(`${gradient("Support channel: t.me/coresix6")}`);
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