const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

loadingSpinner.classList.add('hidden');
errorMessage.classList.add('hidden');

function setLoading(isLoading) {
  if (isLoading) loadingSpinner.classList.remove('hidden');
  else loadingSpinner.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function clearUI() {
  countryInfo.innerHTML = '';
  borderingCountries.innerHTML = '';
}

async function searchCountry(countryName) {
  const name = countryName.trim();

  if (!name) {
    clearUI();
    showError('Please enter a country name.');
    return;
  }

  clearError();
  clearUI();
  setLoading(true);

  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);

    if (!response.ok) {
      throw new Error('Country not found. Try another name.');
    }

    const data = await response.json();

    const country = data[0];

    const commonName = country?.name?.common ?? 'Unknown';
    const capital = (country?.capital && country.capital.length > 0) ? country.capital[0] : 'N/A';
    const population = (typeof country?.population === 'number') ? country.population.toLocaleString() : 'N/A';
    const region = country?.region ?? 'N/A';
    const flagUrl = country?.flags?.svg || country?.flags?.png || '';

    countryInfo.innerHTML = `
      <h2>${commonName}</h2>
      <p><strong>Capital:</strong> ${capital}</p>
      <p><strong>Population:</strong> ${population}</p>
      <p><strong>Region:</strong> ${region}</p>
      ${flagUrl ? `<img src="${flagUrl}" alt="${commonName} flag">` : ''}
    `;

    const borders = country?.borders;

    if (!borders || borders.length === 0) {
      borderingCountries.innerHTML = `<p><strong>Bordering Countries:</strong> None (island nation or no land borders).</p>`;
      return;
    }

    const borderFetches = borders.map(async (code) => {
      const r = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`);
      if (!r.ok) return null;
      const d = await r.json();
      return d[0];
    });

    const borderCountries = (await Promise.all(borderFetches)).filter(Boolean);

    borderingCountries.innerHTML = `
      <h3>Bordering Countries</h3>
      ${borderCountries.map((c) => {
        const n = c?.name?.common ?? 'Unknown';
        const f = c?.flags?.svg || c?.flags?.png || '';
        return `
          <div class="border-item">
            <p>${n}</p>
            ${f ? `<img src="${f}" alt="${n} flag">` : ''}
          </div>
        `;
      }).join('')}
    `;
  } catch (err) {
    showError(err?.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

searchBtn.addEventListener('click', () => {
  searchCountry(countryInput.value);
});


countryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchCountry(countryInput.value);
  }
});