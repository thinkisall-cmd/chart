const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 아이콘 크기들
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// icons 디렉토리 생성
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 배경 (다크 네이비)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // 차트 그래픽 그리기
  const centerX = size / 2;
  const centerY = size / 2;
  const barWidth = size * 0.08;
  const maxBarHeight = size * 0.4;

  // 막대 차트 그리기 (상승 트렌드)
  ctx.fillStyle = '#10b981';
  for (let i = 0; i < 5; i++) {
    const x = centerX - (2.5 * barWidth) + (i * barWidth * 1.2);
    const height = maxBarHeight * (0.3 + (i * 0.15));
    const y = centerY + (maxBarHeight / 2) - height;

    ctx.fillRect(x, y, barWidth, height);
  }

  // 상승 화살표 그리기
  if (size >= 128) {
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = size * 0.02;

    const arrowSize = size * 0.15;
    const arrowX = centerX + size * 0.2;
    const arrowY = centerY - size * 0.1;

    // 화살표 그리기
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + arrowSize);
    ctx.lineTo(arrowX, arrowY);
    ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize * 0.5);
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize * 0.5);
    ctx.stroke();
  }

  // 텍스트 추가 (크기에 따라 조정)
  if (size >= 192) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.08}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('NextChart', centerX, centerY + maxBarHeight * 0.8);
  } else if (size >= 144) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.1}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('NC', centerX, centerY + maxBarHeight * 0.8);
  }

  // PNG 파일로 저장
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, buffer);

  console.log(`Generated: icon-${size}x${size}.png`);
});

console.log('All icons generated successfully!');