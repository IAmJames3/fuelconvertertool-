import test from "node:test";
import assert from "node:assert/strict";

import {
  EXCHANGE_RATE_STORAGE_KEY,
  loadSavedExchangeRates,
  ratesFromFrankfurter,
  saveExchangeRates,
} from "../src/exchangeRates.js";

function createStorage(initialValue = null) {
  const values = new Map();
  if (initialValue !== null) values.set(EXCHANGE_RATE_STORAGE_KEY, initialValue);

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("converts Frankfurter rates into values relative to USD", () => {
  const record = ratesFromFrankfurter({
    date: "2026-08-07",
    rates: { CAD: 1.37, MXN: 18.6 },
  });

  assert.equal(record.date, "2026-08-07");
  assert.equal(record.rates.USD, 1);
  assert.equal(record.rates.CAD, 1 / 1.37);
  assert.equal(record.rates.MXN, 1 / 18.6);
  assert.ok(!Number.isNaN(Date.parse(record.checkedAt)));
});

test("saves and reloads a valid exchange-rate record", () => {
  const storage = createStorage();
  const record = {
    rates: { USD: 1, CAD: 0.73, MXN: 0.054 },
    date: "2026-08-07",
    checkedAt: "2026-08-08T12:00:00.000Z",
  };

  assert.equal(saveExchangeRates(record, storage), true);
  assert.deepEqual(loadSavedExchangeRates(storage), record);
});

test("keeps live conversion usable when browser storage is unavailable", () => {
  const unavailableStorage = {
    setItem() {
      throw new Error("Storage unavailable");
    },
  };

  assert.equal(
    saveExchangeRates(
      {
        rates: { USD: 1, CAD: 0.73, MXN: 0.054 },
        date: "2026-08-07",
        checkedAt: "2026-08-08T12:00:00.000Z",
      },
      unavailableStorage
    ),
    false
  );
});

test("ignores malformed or incomplete saved rates", () => {
  assert.equal(loadSavedExchangeRates(createStorage("not json")), null);
  assert.equal(
    loadSavedExchangeRates(
      createStorage(
        JSON.stringify({
          rates: { USD: 1, CAD: 0, MXN: 0.054 },
          date: "2026-08-07",
          checkedAt: "2026-08-08T12:00:00.000Z",
        })
      )
    ),
    null
  );
});
