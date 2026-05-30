export default function App() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#F7F9FB",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#2563EB",
            marginBottom: "10px",
          }}
        >
          Fuel Converter Tool
        </h1>

        <p style={{ color: "#4B5563" }}>
          Cross-border fuel conversions for the United States, Canada, and
          Mexico.
        </p>

        <button
          style={{
            background: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 16px",
            cursor: "pointer",
            marginTop: "15px",
          }}
        >
          Start Converting
        </button>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,.1)",
          }}
        >
          <h2>Fuel Converter</h2>

          <p>Odometer</p>
          <input
            type="number"
            defaultValue="0"
            style={{ width: "100%", padding: "10px" }}
          />

          <p style={{ marginTop: "15px" }}>Price Per Unit</p>
          <input
            type="number"
            defaultValue="0"
            style={{ width: "100%", padding: "10px" }}
          />

          <p style={{ marginTop: "15px" }}>Fuel Amount</p>
          <input
            type="number"
            defaultValue="0"
            style={{ width: "100%", padding: "10px" }}
          />

          <small>What the pump says after fill up</small>
        </div>
      </div>
    </div>
  );
}
