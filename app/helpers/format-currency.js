import { helper } from '@ember/component/helper';

export function formatCurrency([value, ...rest]) {
  const dollars = Math.floor(value / 100);
  return `$${dollars}`;
}

export default helper(formatCurrency);

