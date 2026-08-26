import { toCamelCase } from '../../scripts/aem.js';

const PAGE_SIZE = 10;
const DEFAULT_SOURCE = '/employees.json';
const COLUMNS = ['Name', 'Department', 'Experience', 'City'];

let placeholdersPromise;

/**
 * Fetches and caches the site's placeholders sheet.
 * @returns {Promise<object>} placeholder text keyed by camelCased Key
 */
function fetchPlaceholders() {
  if (!placeholdersPromise) {
    placeholdersPromise = fetch('/placeholders.json')
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then(({ data }) => Object.fromEntries(
        data.map(({ Key, Text }) => [toCamelCase(Key), Text]),
      ))
      .catch(() => ({}));
  }
  return placeholdersPromise;
}

/**
 * Builds a table row for one employee record.
 * @param {object} employee Row from the employees JSON (keyed by column name)
 * @returns {HTMLTableRowElement}
 */
function renderRow(employee) {
  const row = document.createElement('tr');
  COLUMNS.forEach((key) => {
    const cell = document.createElement('td');
    cell.textContent = employee[key] || '';
    row.append(cell);
  });
  return row;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const source = link ? link.getAttribute('href') : DEFAULT_SOURCE;
  block.textContent = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  COLUMNS.forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const loadMoreWrapper = document.createElement('div');
  loadMoreWrapper.className = 'employee-list-load-more-wrapper';
  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'employee-list-load-more';
  loadMoreWrapper.append(loadMoreButton);

  block.append(table, loadMoreWrapper);

  const [resp, placeholders] = await Promise.all([
    fetch(source.endsWith('.json') ? source : `${source}.json`),
    fetchPlaceholders(),
  ]);
  loadMoreButton.textContent = placeholders.loadMore || 'Load more';

  if (!resp.ok) {
    loadMoreWrapper.remove();
    return;
  }

  const { data = [] } = await resp.json();
  let index = 0;

  const renderNextPage = () => {
    data.slice(index, index + PAGE_SIZE).forEach((employee) => {
      tbody.append(renderRow(employee));
    });
    index += PAGE_SIZE;
    if (index >= data.length) loadMoreWrapper.remove();
  };

  loadMoreButton.addEventListener('click', renderNextPage);
  renderNextPage();
}
