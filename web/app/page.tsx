"use client";

import { useState } from "react";

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [secureMessage, setSecureMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state

const API_URL = "https://tarea-luis-tls.click/api"; // Update to your domain or proxy

const getJWT = async () => {
  setError(null);
  setLoading(true); // Set loading state to true
  try {
    const resp = await fetch(`${API_URL}/getJWT`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://tarea-luis-tls.click', // Add the Origin header explicitly
      },
    });

    if (!resp.ok) {
      throw new Error('Failed to fetch JWT');
    }

    const data = await resp.json();
    setToken(data.token);
    localStorage.setItem("jwt", data.token);
  } catch (err) {
    setError("Error solicitando token");
  } finally {
    setLoading(false); // Set loading state to false after the fetch
  }
};


  const accessSecure = async () => {
    setError(null);
    const stored = token || localStorage.getItem("jwt");

    if (!stored) {
      setError("No hay token. Primero presiona 'Obtener Token'");
      return;
    }

    setLoading(true); // Set loading state to true
    try {
      const resp = await fetch(`${API_URL}/secure`, {
        headers: {
          "Authorization": `Bearer ${stored}`
        }
      });

      if (!resp.ok) {
        const detail = await resp.json();
        if (detail.detail && detail.detail.toLowerCase().includes('expired')) {
          setError("El token ha expirado. Por favor, obtén un nuevo token.");
          localStorage.removeItem("jwt"); // Remove expired token from localStorage
        } else {
          setError(`Error: ${detail.detail}`);
        }
        return;
      }

      const data = await resp.json();
      setSecureMessage(JSON.stringify(data, null, 2));
    } catch (err) {
      setError("Error al conectar con /secure");
    } finally {
      setLoading(false); // Set loading state to false after the fetch
    }
  };

  return (
    <main className="p-6">
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Frontend Básico — Next.js + FastAPI
      </h1>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={getJWT}
          style={{
            padding: "10px",
            background: "blue",
            color: "white",
            borderRadius: "6px",
            marginRight: "10px"
          }}
          disabled={loading} // Disable button when loading
        >
          {loading ? "Cargando..." : "Obtener Token"}
        </button>

        <button
          onClick={accessSecure}
          style={{
            padding: "10px",
            background: "green",
            color: "white",
            borderRadius: "6px"
          }}
          disabled={loading} // Disable button when loading
        >
          {loading ? "Cargando..." : "Ingresar a /secure"}
        </button>
      </div>

      {token && (
        <div style={{ marginTop: "20px" }}>
          <strong>Token almacenado:</strong>
          <pre style={{ background: "#eee", padding: "10px" }}>{token}</pre>
        </div>
      )}

      {secureMessage && (
        <div style={{ marginTop: "20px" }}>
          <strong>Respuesta de /secure:</strong>
          <pre style={{ background: "#eee", padding: "10px" }}>{secureMessage}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <strong>{error}</strong>
        </div>
      )}
    </main>
  );
}
