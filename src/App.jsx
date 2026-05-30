import { useEffect, useMemo, useState } from "react";

const presets = {
  US: { distanceUnit: "miles", fuelUnit: "gallons", currency: "USD" },
  Canada: { distanceUnit: "km", fuelUnit: "liters", currency: "CAD" },
  Mexico: { distanceUnit: "km", fuelUnit: "liters", currency: "MXN" },
};

const exchangeRatesToUSD = {
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

  return formatted;
}
export default function App() {
const savedForm =
  JSON.parse(localStorage.getItem("fuelConverterForm")) || {};

const [country, setCountry] = useState(savedForm.country || "US");
const [odometer, setOdometer] = useState(savedForm.odometer || 0);
const [pricePerUnit, setPricePerUnit] = useState(savedForm.pricePerUnit || 0);
const [fuelAmount, setFuelAmount] = useState(savedForm.fuelAmount || 0);
const [distanceUnit, setDistanceUnit] = useState(
  savedForm.distanceUnit || "miles"
);
const [fuelUnit, setFuelUnit] = useState(
  savedForm.fuelUnit || "gallons"
);
const [currency, setCurrency] = useState(
  savedForm.currency || "USD"
);
useEffect(() => {
  const formData = {
    country,
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
  odometer,
  pricePerUnit,
  fuelAmount,
  distanceUnit,
  fuelUnit,
  currency,
]);

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

    const miles = toMiles(odometerValue, distanceUnit);
    const gallons = toGallons(fuelValue, fuelUnit);
    const totalCost = priceValue * fuelValue;

    const usdPricePerGallon =
      fuelUnit === "liters"
        ? priceValue * 3.78541 * exchangeRatesToUSD[currency]
        : priceValue * exchangeRatesToUSD[currency];

    const usdTotal = totalCost * exchangeRatesToUSD[currency];

    return {
      miles,
      gallons,
      totalCost,
      usdPricePerGallon,
      usdTotal,
    };
  }, [odometer, pricePerUnit, fuelAmount, distanceUnit, fuelUnit, currency]);

  const exchangeRateText =
    currency === "USD"
      ? "USD → USD: 1.00"
      : `${currency} → USD: ${exchangeRatesToUSD[currency]}`;

  return (
    <main className="page">
      <section className="hero">
        <h1>Fuel Converter Tool</h1>
        <p>
          Convert fuel prices, fuel amounts, and odometer readings across the
          United States, Canada, and Mexico.
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
        <h2>Exchange Rate</h2>
        <p className="exchangeRate">{exchangeRateText}</p>
        <p className="exchangeNote">
          Estimated exchange rates for testing. Live rates can be added later.
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

        <Result label="Odometer" value={`${formatNumber(results.miles, 0)} miles`} />
        <Result
  label="Fuel Price Comparison"
value={`${formatCurrency(Number(pricePerUnit), currency)} per ${fuelUnit === "liters" ? "liter" : "gallon"} = ${formatCurrency(results.usdPricePerGallon, "USD")} per gallon`}
/>

<Result
  label="Fuel Purchased"
  value={`${formatNumber(Number(fuelAmount), 2)} ${fuelUnit} = ${formatNumber(results.gallons, 2)} gallons`}
/>

<Result
  label="Total Fuel Cost"
  value={`${formatCurrency(results.totalCost, currency)} = ${formatCurrency(results.usdTotal, "USD")}`}
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
  <h2>Cross-border fuel conversion made simple</h2>
  <p>
    Fuel prices can be confusing when you cross between the United States,
    Canada, and Mexico. This tool helps convert miles to kilometers, kilometers
    to miles, gallons to liters, liters to gallons, and fuel prices between USD,
    CAD, and MXN.
  </p>

  <h3>Why fuel prices look different by country</h3>
  <p>
    U.S. fuel prices are usually shown per gallon, while Canadian and Mexican
    fuel prices are usually shown per liter. That makes it hard to quickly know
    whether a posted fuel price is cheaper or more expensive than what you are
    used to at home.
  </p>

  <h3>What this calculator helps compare</h3>
  <p>
    Use this fuel converter to compare price per gallon, price per liter, total
    fill-up cost, fuel amount, and odometer readings when driving across borders.
  </p>
</section>
    </main>
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
        <strong>
          {displayValue[0].trim()}
          <br />
          =
          <br />
          {displayValue[1].trim()}
        </strong>
      ) : (
        <strong>{value}</strong>
      )}
    </div>
  );
}
