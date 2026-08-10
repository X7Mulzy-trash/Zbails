import test from 'node:test';
import assert from 'node:assert/strict';
import { isLikelyVideoBuffer } from '../lib/Utils/sticker.js';

test('detects common video container signatures', () => {
    assert.equal(isLikelyVideoBuffer(Buffer.from('ftypmp4')), true);
    assert.equal(isLikelyVideoBuffer(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00])), true);
    assert.equal(isLikelyVideoBuffer(Buffer.from('RIFF....AVI ')), true);
    assert.equal(isLikelyVideoBuffer(Buffer.from('PNG')), false);
});
