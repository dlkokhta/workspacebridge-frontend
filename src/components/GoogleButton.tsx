export default function GoogleButton() {
  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <button
      type="button" // <-- important
      onClick={handleGoogleAuth}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 16px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#fff",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        style={{
          width: "20px",
          position: "absolute",
          left: "16px",
        }}
      />
      Continue with Google
    </button>
  );
}
