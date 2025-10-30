// src/pages/TestAPI.tsx
import { useEffect, useState } from "react";
import api from "../api/api";

const TestAPI = () => {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/ride/rides");
        if (!mounted) return;
        console.log("API response /ride/rides:", res.data);
        setStatus(
          `OK — received ${
            Array.isArray(res.data) ? res.data.length : 1
          } item(s)`
        );
      } catch (err: any) {
        console.error("API error:", err);
        if (!mounted) return;
        if (err?.response)
          setStatus(`Error ${err.response.status}: ${err.response.statusText}`);
        else setStatus("Network/Error: check console");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-lg font-semibold mb-3">API Connection Test</h1>
      <p className="text-sm text-gray-700">
        Base URL:{" "}
        <code className="text-xs">{import.meta.env.VITE_API_BASE_URL}</code>
      </p>
      <div className="mt-6 p-4 bg-white rounded shadow">
        <p>{status}</p>
      </div>
    </div>
  );
};
export default TestAPI;
