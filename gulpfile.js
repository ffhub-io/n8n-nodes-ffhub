const { src, dest } = require('gulp');

// 复制图标文件到 dist 目录
function buildIcons() {
  return src('nodes/**/*.{svg,png}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
