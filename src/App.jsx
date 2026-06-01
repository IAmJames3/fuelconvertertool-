import { useEffect, useMemo, useState } from "react";

const presets = {
  US: { distanceUnit: "miles", fuelUnit: "gallons", currency: "USD" },
  Canada: { distanceUnit: "km", fuelUnit: "liters", currency: "CAD" },
  Mexico: { distanceUnit: "km", fuelUnit: "liters", currency: "MXN" },
};

const fallbackExchangeRatesToUSD = {
  USD: 1,
  CAD: 0.72,
  MXN: 0.059,
};

function toMiles(value, unit) {
  return unit === "km" ? value * 0.621371 : value;
}

function toGallons(value, unit) {
  return unit === "liters" ? value * 0.264172 : value;
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCurrency(value, currency) {
  if (!Number.isFinite(value)) value = 0;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);

  if (currency === "USD" && !formatted.includes("US$")) {
    return formatted.replace("$", "US$");
  }

  return formatted;
}

export default function App() {
const savedForm =
  JSON.parse(localStorage.getItem("fuelConverterForm")) || {};

const [country, setCountry] = useState(savedForm.country || "US");
const [trackingCountry, setTrackingCountry] = useState(
  savedForm.trackingCountry || "US"
);
const [odometer, setOdometer] = useState(savedForm.odometer || 0);
const [pricePerUnit, setPricePerUnit] = useState(savedForm.pricePerUnit || 0);
const [fuelAmount, setFuelAmount] = useState(savedForm.fuelAmount || 0);
const [distanceUnit, setDistanceUnit] = useState(
  savedForm.distanceUnit || "miles"
);

const [currency, setCurrency] = useState(
  savedForm.currency || "USD"
);
  
const [fuelUnit, setFuelUnit] = useState(
  savedForm.fuelUnit || "gallons"
);
  
const [exchangeRatesToUSD, setExchangeRatesToUSD] = useState(
  fallbackExchangeRatesToUSD
);
const [exchangeRateDate, setExchangeRateDate] = useState("Checking...");
const [exchangeRateCheckedAt, setExchangeRateCheckedAt] = useState("");
const [exchangeRateSource, setExchangeRateSource] = useState(
  "Frankfurter Exchange Rates"
);
useEffect(() => {
const formData = {
  country,
  trackingCountry,
  odometer,
  pricePerUnit,
  fuelAmount,
  distanceUnit,
  fuelUnit,
  currency,
};

  localStorage.setItem("fuelConverterForm", JSON.stringify(formData));
}, [
  country,
  trackingCountry,
  odometer,
  pricePerUnit,
  fuelAmount,
  distanceUnit,
  fuelUnit,
  currency,
]);

useEffect(() => {
  async function fetchExchangeRates() {
    try {
      const response = await fetch(
        "https://api.frankfurter.dev/v1/latest?base=USD&symbols=CAD,MXN"
      );

      if (!response.ok) {
        throw new Error("Exchange rate request failed");
      }

      const data = await response.json();

      setExchangeRatesToUSD({
        USD: 1,
        CAD: 1 / data.rates.CAD,
        MXN: 1 / data.rates.MXN,
      });

      setExchangeRateDate(data.date);
      setExchangeRateCheckedAt(new Date().toLocaleString());
      setExchangeRateSource("Frankfurter Exchange Rates");
    } catch (error) {
      setExchangeRatesToUSD(fallbackExchangeRatesToUSD);
      setExchangeRateDate("Using fallback rates");
      setExchangeRateCheckedAt(new Date().toLocaleString());
      setExchangeRateSource("Fallback estimate");
    }
  }

  fetchExchangeRates();
}, []);

  function applyPreset(selectedCountry) {
    setCountry(selectedCountry);
    setDistanceUnit(presets[selectedCountry].distanceUnit);
    setFuelUnit(presets[selectedCountry].fuelUnit);
    setCurrency(presets[selectedCountry].currency);
  }

const results = useMemo(() => {
  const odometerValue = Number(odometer) || 0;
  const priceValue = Number(pricePerUnit) || 0;
  const fuelValue = Number(fuelAmount) || 0;

  const totalCost = priceValue * fuelValue;

  const outputPreset = presets[trackingCountry];
  const outputDistanceUnit = outputPreset.distanceUnit;
  const outputFuelUnit = outputPreset.fuelUnit;
  const outputCurrency = outputPreset.currency;

  const inputMiles = toMiles(odometerValue, distanceUnit);
  const outputOdometer =
    outputDistanceUnit === "miles" ? inputMiles : inputMiles * 1.60934;

  const inputGallons = toGallons(fuelValue, fuelUnit);
  const outputFuelAmount =
    outputFuelUnit === "gallons" ? inputGallons : inputGallons * 3.78541;

  const totalCostUSD = totalCost * exchangeRatesToUSD[currency];
  const outputTotalCost = totalCostUSD / exchangeRatesToUSD[outputCurrency];

  const inputPricePerGallonUSD =
    fuelUnit === "liters"
      ? priceValue * 3.78541 * exchangeRatesToUSD[currency]
      : priceValue * exchangeRatesToUSD[currency];

  const outputPricePerUnit =
    outputFuelUnit === "gallons"
      ? inputPricePerGallonUSD / exchangeRatesToUSD[outputCurrency]
      : inputPricePerGallonUSD / 3.78541 / exchangeRatesToUSD[outputCurrency];

  return {
    totalCost,
    outputDistanceUnit,
    outputFuelUnit,
    outputCurrency,
    outputOdometer,
    outputFuelAmount,
    outputPricePerUnit,
    outputTotalCost,
  };
}, [
  odometer,
  pricePerUnit,
  fuelAmount,
  distanceUnit,
  fuelUnit,
  currency,
  trackingCountry,
  exchangeRatesToUSD,
]);

  const exchangeRateText =
    currency === "USD"
      ? "USD → USD: 1.00"
      : `${currency} → USD: ${exchangeRatesToUSD[currency]}`;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Fuel Converter Tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fuel Converter Tool helps drivers convert fuel purchases between the United States, Canada, and Mexico into the units and currency used by their preferred fuel-tracking app.",
      },
    },
    {
      "@type": "Question",
      name: "Why would I need Fuel Converter Tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you purchase fuel in another country, the measurements and currency shown on the pump may not match the format used by your fuel-tracking app. Fuel Converter Tool helps convert the information into the units and currency you need.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Fuel Converter Tool with Fuelly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Fuel Converter Tool can help convert fuel purchases into the format expected by Fuelly.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Fuel Converter Tool with Fuelio, Drivvo, Simply Auto, or other fuel-tracking apps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Fuel Converter Tool is designed to work with any fuel-tracking or mileage-tracking app that requires fuel purchases to be entered in a specific unit or currency format.",
      },
    },
    {
      "@type": "Question",
      name: "Does Fuel Converter Tool work for cars, trucks, RVs, and motorcycles?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Fuel Converter Tool can be used with any vehicle where fuel purchases are tracked, including cars, trucks, RVs, motorcycles, vans, and fleet vehicles.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert fuel prices between USD, CAD, and MXN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Fuel Converter Tool uses live exchange rates when available to convert fuel prices and fuel purchase totals between U.S. Dollars, Canadian Dollars, and Mexican Pesos.",
      },
    },
    {
      "@type": "Question",
      name: "Is Fuel Converter Tool free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Fuel Converter Tool is free to use.",
      },
    },
  ],
};
  
return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />

    <main className="page">
      <section className="hero">
        <h1>Fuel Converter Tool</h1>
        <p>
Convert fuel purchases between the United States, Canada, and Mexico into the units and currency used by your preferred fuel-tracking app.
        </p>
        <button
          className="primaryButton"
          onClick={() =>
            document.getElementById("converter").scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          Start Converting
        </button>
      </section>

      <section id="converter" className="card">
        <h2>Fuel Converter</h2>

<label>Where are you filling up?</label>
<div className="buttonGrid">
  {["US", "Canada", "Mexico"].map((item) => (
    <button
      key={item}
      className={country === item ? "activeButton" : "secondaryButton"}
      onClick={() => applyPreset(item)}
    >
      {item}
    </button>
  ))}
</div>

<label style={{ marginTop: "16px", display: "block" }}>
  My Tracking App Uses
</label>
<div className="buttonGrid">
  {["US", "Canada", "Mexico"].map((item) => (
    <button
      key={`tracking-${item}`}
      className={
        trackingCountry === item ? "activeButton" : "secondaryButton"
      }
      onClick={() => setTrackingCountry(item)}
    >
      {item}
    </button>
  ))}
</div>

        <div className="field">
          <label>Odometer</label>
          <div className="inputRow">
            <input
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
            >
              <option value="miles">Miles</option>
              <option value="km">KM</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Price per unit</label>
          <div className="inputRow">
            <input
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Fuel amount</label>
          <div className="inputRow">
            <input
              type="number"
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
            />
            <select
              value={fuelUnit}
              onChange={(e) => setFuelUnit(e.target.value)}
            >
              <option value="gallons">Gallons</option>
              <option value="liters">Liters</option>
            </select>
          </div>
          <small>What the pump says after fill up</small>
        </div>
      </section>

<section className="card exchangeCard">
  <h2>Exchange Rates</h2>

  <p className="exchangeNote">
    Live exchange rates are used for USD, CAD, and MXN conversions.
  </p>

  <p className="exchangeNote">
    Last updated: {exchangeRateDate}
  </p>

  <p className="exchangeNote">
    Last checked: {exchangeRateCheckedAt}
  </p>

  <p className="exchangeNote">
    Source: {exchangeRateSource}
  </p>
</section>
<section className="card adCard">
  <h2>Advertisement</h2>
  <p className="exchangeNote">
    Future ad placement. This space is reserved for Google AdSense.
  </p>
</section>
  
<section className="card resultsCard">
  <h2>Converted Results</h2>

  <Result
    label="Odometer"
    value={`${formatNumber(results.outputOdometer, 0)} ${results.outputDistanceUnit}`}
  />

  <Result
    label="Fuel Price Comparison"
    value={`${formatCurrency(Number(pricePerUnit), currency)} per ${
      fuelUnit === "liters" ? "liter" : "gallon"
    } = ${formatCurrency(results.outputPricePerUnit, results.outputCurrency)} per ${
      results.outputFuelUnit === "liters" ? "liter" : "gallon"
    }`}
  />

  <Result
    label="Fuel Purchased"
    value={`${formatNumber(Number(fuelAmount), 2)} ${fuelUnit} = ${formatNumber(
      results.outputFuelAmount,
      2
    )} ${results.outputFuelUnit}`}
  />

  <Result
    label="Total Fuel Cost"
    value={`${formatCurrency(results.totalCost, currency)} = ${formatCurrency(
      results.outputTotalCost,
      results.outputCurrency
    )}`}
  />
</section>

<section className="card saveCard">
  <h2>Last Entry Saved Automatically</h2>

  <p className="exchangeNote">
    Your latest entry is automatically stored on this device and browser.
  </p>

  <div className="lastSaved">
    <p>
      <strong>Current Entry</strong>
    </p>

    <p>
      {formatNumber(Number(fuelAmount), 2)} {fuelUnit}
    </p>

    <p>
      {formatCurrency(results.totalCost, currency)}
    </p>
  </div>
</section>

<section className="seoText">
  <h2>Cross-border fuel purchases, converted for your fuel-tracking app</h2>

  <p>
    Tracking fuel purchases across the United States, Canada, and Mexico can be
    frustrating when the measurements and currency on the pump don't match the
    format used by your fuel-tracking app.
  </p>

  <p>
    If you track your fuel purchases, a fill-up in another country can quickly
    turn into a series of conversions before the information can be entered into
    your preferred fuel-tracking app accurately and consistently.
  </p>

  <p>
    Fuel Converter Tool helps simplify that process. Enter your odometer
    reading, fuel price, and fuel amount exactly as they appear, then instantly
    convert the results into the units and currency you need.
  </p>

  <p>
    Whether your vehicle displays miles or kilometers, gallons or liters, Fuel
    Converter Tool makes it easy to prepare fuel purchase information for your
    preferred fuel-tracking app.
  </p>

  <p>
    Designed for drivers who care about accurate fuel records, Fuel Converter
    Tool supports conversions between the United States, Canada, and Mexico,
    helping you spend less time doing math and more time enjoying the journey.
  </p>
</section>

<section className="seoText">
  <h2>Frequently Asked Questions</h2>

  <h3>What is Fuel Converter Tool?</h3>
  <p>
    Fuel Converter Tool helps drivers convert fuel purchases between the
    United States, Canada, and Mexico into the units and currency used by
    their preferred fuel-tracking app. Convert odometer readings, fuel prices,
    fuel amounts, and currency values so fuel purchases can be recorded
    accurately and consistently.
  </p>

  <h3>Why would I need Fuel Converter Tool?</h3>
  <p>
    If you purchase fuel in another country, the measurements and currency
    shown on the pump may not match the format used by your fuel-tracking app.
    Fuel Converter Tool helps eliminate manual calculations by converting the
    information into the units and currency you need.
  </p>

  <h3>Can I use Fuel Converter Tool with Fuelly?</h3>
  <p>
    Yes. Fuel Converter Tool can help convert fuel purchases into the format
    expected by Fuelly. Enter the values exactly as they appear on the pump
    and dashboard, then use the converted results when recording your fuel
    purchase.
  </p>

  <h3>Can I use Fuel Converter Tool with Fuelio, Drivvo, Simply Auto, or other fuel-tracking apps?</h3>
  <p>
    Yes. Fuel Converter Tool is designed to work with any fuel-tracking or
    mileage-tracking app that requires fuel purchases to be entered in a
    specific unit or currency format.
  </p>

  <h3>Does Fuel Converter Tool work for cars, trucks, RVs, and motorcycles?</h3>
  <p>
    Yes. Fuel Converter Tool can be used with any vehicle where fuel purchases
    are tracked, including cars, trucks, RVs, motorcycles, vans, and fleet
    vehicles.
  </p>

  <h3>Do I need to change my vehicle settings when traveling?</h3>
  <p>
    No. Fuel Converter Tool works whether your vehicle displays miles or
    kilometers and whether fuel is purchased in gallons or liters. You can
    select the units that match the information you want to record.
  </p>

  <h3>Can I convert fuel prices between USD, CAD, and MXN?</h3>
  <p>
    Yes. Fuel Converter Tool uses live exchange rates when available to
    convert fuel prices and fuel purchase totals between U.S. Dollars (USD),
    Canadian Dollars (CAD), and Mexican Pesos (MXN). If live rates are
    temporarily unavailable, fallback exchange rates may be used to keep
    conversions available.
  </p>

  <h3>Does Fuel Converter Tool save my information?</h3>
  <p>
    Yes. Fuel Converter Tool automatically saves your most recently selected
    country, units, currency, and entered values in your browser. This makes
    it easy to continue where you left off when you return to the site. Fuel
    Converter Tool does not store a history of fuel purchases or maintain a
    fuel log.
  </p>

  <h3>Does Fuel Converter Tool keep a history of my fuel purchases?</h3>
  <p>
    No. Fuel Converter Tool is designed to convert fuel purchase information
    into the format needed for your preferred fuel-tracking app. Fuel purchase
    history and fuel economy records should be maintained within your
    fuel-tracking app or record-keeping system.
  </p>

  <h3>Is Fuel Converter Tool free to use?</h3>
  <p>
    Yes. Fuel Converter Tool is free to use.
  </p>
      </section>
    <footer className="footer">
  <div>
    <a href="/privacy-policy.html">Privacy Policy</a>
    {" | "}
    <a href="mailto:fuelconvertertool@gmail.com">Contact</a>
  </div>

  <small>© 2026 Fuel Converter Tool</small>
</footer>
    </main>
    </main>
  </>
  );
}

function Result({ label, value }) {
  const displayValue =
    typeof value === "string" && value.includes("=")
      ? value.split("=")
      : null;

  return (
    <div className="result">
      <span>{label}</span>

      {displayValue ? (
        <div className="resultComparison">
          <div>
            <small>Original</small>
            <strong>{displayValue[0].trim()}</strong>
          </div>

          <div>
            <small>Use in Tracking App</small>
            <strong>{displayValue[1].trim()}</strong>
          </div>
        </div>
      ) : (
        <strong>{value}</strong>
      )}
    </div>
  );
}
