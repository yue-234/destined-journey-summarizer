/**
 * build.js
 * 构建脚本：将 src/ 下的模块按依赖顺序合并为单文件 IIFE
 *
 * 用法: node build.js
 * 输出: dist/命定之诗总结脚本v2.5.js
 */

const fs = require('fs');
const path = require('path');

// 模块加载顺序（按依赖拓扑排序）
const MODULE_ORDER = [
  'src/errorHandler.js',
  'src/config.js',
  'src/utils.js',
  'src/storage.js',
  'src/messages.js',
  'src/api.js',
  'src/worldbook.js',
  'src/prompt.js',
  'src/summary.js',
  'src/ui/styles.js',
  'src/ui/renderer.js',
  'src/ui/panel.js',
  'src/ui/panelEvents.js',
  'src/index.js',
];

const OUTPUT_DIR = 'dist';
const OUTPUT_FILE = '命定之诗总结脚本v2.5.js';

function build() {
  const baseDir = __dirname;
  const parts = [];

  // 文件头
  parts.push(`
/**
 * 命定之诗总结助手 V2.5 - 合并后的单文件脚本
 */

(function() {
'use strict';
`);

  // 按顺序读取并拼接模块
  for (const modulePath of MODULE_ORDER) {
    const fullPath = path.join(baseDir, modulePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[ERROR] 模块文件不存在: ${modulePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const sectionName = modulePath.replace('src/', '');
    parts.push(`// ============================================================`);
    parts.push(`//  ${sectionName}`);
    parts.push(`// ============================================================`);
    parts.push(content);
    parts.push('');
  }

  // 文件尾
  parts.push(`})();`);

  // 写入输出
  const outDir = path.join(baseDir, OUTPUT_DIR);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, OUTPUT_FILE);
  fs.writeFileSync(outPath, parts.join('\n'), 'utf-8');

  const stats = fs.statSync(outPath);
  console.log(`✅ 构建成功！`);
  console.log(`   输出: ${outPath}`);
  console.log(`   大小: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`   模块: ${MODULE_ORDER.length} 个`);
}

build();
