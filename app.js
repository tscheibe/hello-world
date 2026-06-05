const button = document.getElementById('greetButton');
const pdmButton = document.getElementById('pdmButton');
const message = document.getElementById('message');
const chart = document.getElementById('chart');
const chartStatus = document.getElementById('chartStatus');

const PDM_DATA_FALLBACK = `date,fraction_time_elapsed,fraction_PDM_spent
2025-11-26,0.1554,0.0992
2026-02-09,0.3494,0.2541
2026-02-24,0.3894,0.2843
2026-05-27,0.6508,0.6838`;

button.addEventListener('click', () => {
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : 'afternoon';
  message.textContent = `Good ${timeOfDay} Tim! You are ready to learn GitHub and Codex.`;
});

function parsePdmData(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [date, fractionElapsed, fractionSpent] = line.split(',');
      return {
        date,
        x: Number(fractionElapsed),
        y: Number(fractionSpent),
      };
    });
}

function drawPdmChart(points) {
  const width = 420;
  const height = 280;
  const padding = 50;

  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const minX = 0;
  const maxX = Math.max(1, ...xValues);
  const minY = 0;
  const maxY = Math.max(1, ...yValues);

  const scaleX = (value) => padding + ((value - minX) / (maxX - minX || 1)) * (width - padding * 2);
  const scaleY = (value) => height - padding - ((value - minY) / (maxY - minY || 1)) * (height - padding * 2);

  const tickStep = 0.2;
  const tickCountX = Math.ceil(maxX / tickStep);
  const tickCountY = Math.ceil(maxY / tickStep);

  const tickMarkup = Array.from({ length: tickCountX + 1 }, (_, index) => {
    const value = index * tickStep;
    const x = scaleX(value);
    return `
      <line x1="${x}" y1="${height - padding}" x2="${x}" y2="${height - padding + 6}" stroke="#64748b" stroke-width="1" />
      <text x="${x}" y="${height - 18}" text-anchor="middle" font-size="10" fill="#475569">${Math.round(value * 100)}%</text>
    `;
  }).join('');

  const tickMarkupY = Array.from({ length: tickCountY + 1 }, (_, index) => {
    const value = index * tickStep;
    const y = scaleY(value);
    return `
      <line x1="${padding - 6}" y1="${y}" x2="${padding}" y2="${y}" stroke="#64748b" stroke-width="1" />
      <text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#475569">${Math.round(value * 100)}%</text>
    `;
  }).join('');

  const lineYEqualsX = `
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${padding}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" />
  `;

  const axes = `
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#1e293b" stroke-width="2" />
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#1e293b" stroke-width="2" />
    <text x="${width / 2}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#475569">Percent of fiscal year elapsed</text>
    <text x="-2" y="${height / 2}" text-anchor="middle" font-size="11" fill="#475569" transform="rotate(-90 -2 ${height / 2})">Percent of total PDM spent</text>
  `;

  const pointMarkup = points
    .map((point) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5" fill="#2563eb" />`;
    })
    .join('');

  chart.innerHTML = `${lineYEqualsX}${tickMarkup}${tickMarkupY}${axes}${pointMarkup}`;
}

pdmButton.addEventListener('click', async () => {
  try {
    let text = PDM_DATA_FALLBACK;

    try {
      const response = await fetch('PDM_Data.txt');
      if (!response.ok) {
        throw new Error('Unable to load data file.');
      }
      text = await response.text();
    } catch (fetchError) {
      console.warn('Falling back to built-in PDM data.', fetchError);
    }

    const points = parsePdmData(text);

    if (!points.length) {
      throw new Error('No PDM data points were found.');
    }

    drawPdmChart(points);
    chartStatus.textContent = `Chart updated with ${points.length} PDM data points.`;
  } catch (error) {
    chartStatus.textContent = 'Could not load PDM data. Please check the data file or try again.';
    console.error(error);
  }
});
