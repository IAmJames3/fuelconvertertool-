export const EXCHANGE_RATE_STORAGE_KEY = "fuelConverterExchangeRates";

export const fallbackExchangeRatesToUSD = {
  USD: 1,
  CAD: 0.72,
  MXN: 0.059,
};

function hasValidRates(rates) {
  return (
    rates &&
    rates.USD === 1 &&
    Number.isFinite(rates.CAD) &&
    rates.CAD > 0 &&
    Number.isFinite(rates.MXN) &&
    rates.MXN > 0
  );
}

export function ratesFromFrankfurter(data) {
  const cad = Number(data?.rates?.CAD);
  const mxn = Number(data?.rates?.MXN);

  if (!data?.date || !Number.isFinite(cad) || cad <= 0 || !Number.isFinite(mxn) || mxn <= 0) {
    throw new Error("Exchange rate response was invalid");
  }

  return {
    rates: {
      USD: 1,
      CAD: 1 / cad,
      MXN: 1 / mxn,
    },
    date: data.date,
    checkedAt: new Date().toISOString(),
  };
}

export function loadSavedExchangeRates(storage = localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(EXCHANGE_RATE_STORAGE_KEY));

    if (!saved?.date || !saved?.checkedAt || !hasValidRates(saved.rates)) {
      return null;
    }

    return saved;
  } catch {
    return null;
  }
}

export function saveExchangeRates(record, storage = localStorage) {
  try {
    storage.setItem(EXCHANGE_RATE_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}
