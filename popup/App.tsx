import React, { useState, useEffect } from 'react';

const modes = [
  { name: 'Off', value: 'off', description: 'Disable reading aid' },
  { name: 'Black & White', value: 'bw', description: 'High-contrast grayscale' },
  { name: 'Night Light', value: 'night', description: 'Warm tint, softer contrast' },
  { name: 'Reading Mode', value: 'reading', description: 'Old paper, off-white tint' },
];

function App() {
  const [mode, setMode] = useState('off');
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['mode', 'musicEnabled'], (result) => {
      if (result.mode) setMode(result.mode);
      if (result.musicEnabled !== undefined) setMusicEnabled(result.musicEnabled);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ mode });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_MODE', mode });
      }
    });
  }, [mode]);

  useEffect(() => {
    chrome.storage.local.set({ musicEnabled });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_MUSIC', enabled: musicEnabled });
      }
    });
  }, [musicEnabled]);

  const handleModeClick = (value: string) => {
    setMode(value);
  };

  return (
    <div className="popup-container">
      <h2 className="title">Sakura: Reading masks</h2>
      <p className="shortcut">Toggle: <strong>Ctrl+Shift+Y</strong></p>

      <div className="mode-grid">
        {modes.map((m) => (
          <button
            key={m.value}
            className={`mode-card ${mode === m.value ? 'selected' : ''}`}
            onClick={() => handleModeClick(m.value)}
            aria-pressed={mode === m.value}
            title={m.description}
          >
            <span className="mode-name">{m.name}</span>
            <span className="mode-desc">{m.description}</span>
          </button>
        ))}
      </div>

      <div className="controls">
        <label className="toggle">
          <input
            type="checkbox"
            checked={musicEnabled}
            onChange={(e) => setMusicEnabled(e.target.checked)}
          />
          <span>Ambient music</span>
        </label>
      </div>
    </div>
  );
}

export default App;
