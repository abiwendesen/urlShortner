import { useMemo, useState } from "react";

const initialState = {
  shortUrl: "",
  error: "",
  loading: false
};

function normalizeForRequest(url) {
  return url.trim();
}

export default function App() {
  const [urlInput, setUrlInput] = useState("");
  const [state, setState] = useState(initialState);

  const canSubmit = useMemo(() => urlInput.trim().length > 0 && !state.loading, [urlInput, state.loading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedUrl = normalizeForRequest(urlInput);
    if (!cleanedUrl) {
      setState((prev) => ({ ...prev, error: "Please enter a valid URL." }));
      return;
    }

    setState({ shortUrl: "", error: "", loading: true });

    try {
      const response = await fetch("/api/short", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: cleanedUrl })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setState({ shortUrl: "", error: data.message || "Could not shorten URL.", loading: false });
        return;
      }

      setState({ shortUrl: data.message || "", error: "", loading: false });
    } catch (error) {
      setState({ shortUrl: "", error: "Unable to connect to the backend.", loading: false });
    }
  }

  async function handleCopy() {
    if (!state.shortUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(state.shortUrl);
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Copy failed. Please copy manually." }));
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Shorten a long link</h1>
        <p className="subtitle">Paste your long URL and get a clean short link instantly.</p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="url-input">Long URL</label>
          <input
            id="url-input"
            type="url"
            placeholder="https://example.com/very/long/link"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            required
          />

          <button type="submit" disabled={!canSubmit}>
            {state.loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {state.error ? <p className="error">{state.error}</p> : null}

        {state.shortUrl ? (
          <div className="result">
            <p className="result-label">Your short URL</p>
            <a href={state.shortUrl} target="_blank" rel="noreferrer">
              {state.shortUrl}
            </a>
            <div className="actions">
              <button type="button" onClick={handleCopy}>Copy</button>
              <a href={state.shortUrl} target="_blank" rel="noreferrer" className="open-link">Open</a>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
