import assert from 'node:assert/strict';
import { resolveImageUrl } from '../src/utils/imageUrl.js';

const apiBaseUrl = 'https://api.example.com/';
const r2PublicUrl = 'https://assets.example.com/';
const resolve = (value, options = {}) => resolveImageUrl(value, {
  apiBaseUrl,
  r2PublicUrl,
  ...options,
});

assert.equal(resolve('https://cdn.example.com/a.webp'), 'https://cdn.example.com/a.webp');
assert.equal(resolve('//cdn.example.com/a.webp'), '//cdn.example.com/a.webp');
assert.equal(resolve('blob:https://shop.example/a'), 'blob:https://shop.example/a');
assert.equal(resolve('data:image/png;base64,abc'), 'data:image/png;base64,abc');
assert.equal(resolve('products/cotton/blue.webp'), 'https://assets.example.com/products/cotton/blue.webp');
assert.equal(resolve('/products/cotton/blue.webp'), 'https://assets.example.com/products/cotton/blue.webp');
assert.equal(resolve('/uploads/legacy.webp'), 'https://api.example.com/uploads/legacy.webp');
assert.equal(resolve('uploads/legacy.webp'), 'https://api.example.com/uploads/legacy.webp');
assert.equal(resolve('products/legacy.webp', { r2PublicUrl: '' }), 'https://api.example.com/products/legacy.webp');
assert.equal(resolve(''), '');
assert.equal(resolve(null), '');

console.log('image URL resolver tests: passed');
