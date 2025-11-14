export default function Layout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        textAlign: "center",        // <-- center all text
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          display: "flex",          // <-- stack children vertically
          flexDirection: "column",  // <-- each element on new line
          gap: "1rem",              // <-- spacing between elements
          alignItems: "center",     // <-- center items horizontally
        }}
      >
        {children}
      </div>
    </div>
  );
}