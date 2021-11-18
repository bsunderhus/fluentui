import prettyBytes from 'pretty-bytes';

export function formatBytes(value: number) {
  return prettyBytes(value, { maximumFractionDigits: 3 });
}

export function hrToSeconds(hrtime: [number, number]) {
  const raw = hrtime[0] + hrtime[1] / 1e9;

  return raw.toFixed(2) + 's';
}
