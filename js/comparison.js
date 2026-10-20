const comparison = document.querySelector('[data-comparison]');
const comparisonControl = document.querySelector('.compare-control');
const comparisonRange = document.querySelector('#room-comparison');
if (comparison && comparisonControl && comparisonRange) {
  comparison.classList.add('is-interactive');
  comparisonControl.hidden = false;
  const updateComparison = () => {
    const value = Number(comparisonRange.value);
    comparison.style.setProperty('--split', `${100 - value}%`);
    comparisonRange.setAttribute('aria-valuetext', `${value} percent of the AI design revealed`);
  };
  comparisonRange.addEventListener('input', updateComparison);
  updateComparison();
}
