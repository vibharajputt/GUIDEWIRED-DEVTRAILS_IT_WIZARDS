import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getRiskMapData, scanAllZones, getForecast } from '../services/api';

const RISK_COLORS = {
  LOW: '#22c55e',
  MEDIUM: '#f97316',
  HIGH: '#ef4444',
  'VERY HIGH': '#991b1b',
};

const RISK_BG = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
  'VERY HIGH': 'bg-red-200 text-red-900',
};

function RiskMap() {
  const [zones, setZones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveWeather, setLiveWeather] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      const res = await getRiskMapData();
      setZones(res.data.zones);
      setSummary(res.data.risk_summary);
    } catch (err) {
      console.error('Failed to load risk map:', err);
    }
    setLoading(false);
  };

  const handleLiveScan = async () => {
    setScanning(true);
    try {
      const res = await scanAllZones();
      setLiveWeather(res.data);
    } catch (err) {
      console.error('Live scan failed:', err);
      alert('Live scan failed. Make sure you have API keys set in backend.');
    }
    setScanning(false);
  };

  const handleZoneClick = async (zone) => {
    setSelectedZone(zone);
    setForecastLoading(true);
    try {
      const res = await getForecast(zone.pincode);
      setForecast(res.data);
    } catch (err) {
      console.error('Forecast failed:', err);
      setForecast(null);
    }
    setForecastLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🗺️</div>
          <p className="text-xl text-gray-600">Loading Risk Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🗺️ Zone Risk Heatmap</h1>
            <p className="text-gray-500 text-sm">
              Real-time risk levels across all operational zones
            </p>
          </div>
          <button
            onClick={handleLiveScan}
            disabled={scanning}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:bg-gray-400 transition flex items-center space-x-2"
          >
            {scanning ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Live Weather Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {summary && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border-2 border-blue-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-700">{zones.length}</div>
              <div className="text-xs text-blue-600 font-medium">Total Zones</div>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-700">{summary.low}</div>
              <div className="text-xs text-green-600 font-medium">🟢 Low Risk</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-700">{summary.medium}</div>
              <div className="text-xs text-orange-600 font-medium">🟠 Medium Risk</div>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-700">{summary.high}</div>
              <div className="text-xs text-red-600 font-medium">🔴 High Risk</div>
            </div>
            <div className="bg-red-100 border border-red-300 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-900">{summary.very_high}</div>
              <div className="text-xs text-red-700 font-medium">⛔ Very High</div>
            </div>
          </div>
        </div>
      )}

      {liveWeather && liveWeather.alerts && liveWeather.alerts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl">
            <h3 className="font-bold text-red-700 mb-3 flex items-center">
              <span className="text-xl mr-2">🚨</span>
              LIVE ALERTS — {liveWeather.zones_with_alerts} zone
              {liveWeather.zones_with_alerts > 1 ? 's' : ''} affected
            </h3>
            <div className="space-y-2">
              {liveWeather.alerts.map((alert, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-red-700">{alert.zone}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({alert.city} — {alert.pincode})
                      </span>
                    </div>
                    {alert.temperature && (
                      <span className="text-sm text-gray-600">
                        {Math.round(alert.temperature)}°C | 💨 {alert.wind_kmh} km/h
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {alert.weather_triggers &&
                      alert.weather_triggers.map((t, j) => (
                        <span
                          key={`w${j}`}
                          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          🌧️ {t.description}
                        </span>
                      ))}
                    {alert.aqi_triggers &&
                      alert.aqi_triggers.map((t, j) => (
                        <span
                          key={`a${j}`}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          🏭 {t.description}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-500 mt-3">
              ⏱️ Scanned at: {liveWeather.scanned_at} | {liveWeather.zones_safe} zones safe,{' '}
              {liveWeather.zones_with_alerts} zones alert
            </p>
          </div>
        </div>
      )}

      {liveWeather && (!liveWeather.alerts || liveWeather.alerts.length === 0) && (
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
            <span className="text-2xl mr-2">✅</span>
            <span className="text-green-700 font-medium">
              All {liveWeather.total_zones_scanned} zones are safe! No active weather alerts.
            </span>
            <p className="text-xs text-green-500 mt-1">
              Scanned at: {liveWeather.scanned_at}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="md:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden"
            style={{ height: '520px' }}
          >
            <MapContainer
              center={[22.5, 78.0]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {zones.map((zone) => {
                const isSelected = selectedZone?.pincode === zone.pincode;
                const hasLiveAlert = liveWeather?.alerts?.some(
                  (a) => a.pincode === zone.pincode
                );

                return (
                  <CircleMarker
                    key={zone.pincode}
                    center={[zone.lat, zone.lon]}
                    radius={isSelected ? 18 : Math.max(10, zone.workers * 2 + 8)}
                    fillColor={
                      hasLiveAlert
                        ? '#dc2626'
                        : RISK_COLORS[zone.risk_level] || '#gray'
                    }
                    color={
                      isSelected
                        ? '#1d4ed8'
                        : hasLiveAlert
                        ? '#dc2626'
                        : RISK_COLORS[zone.risk_level] || '#gray'
                    }
                    weight={isSelected ? 4 : 2}
                    opacity={0.9}
                    fillOpacity={hasLiveAlert ? 0.7 : 0.5}
                    eventHandlers={{
                      click: () => handleZoneClick(zone),
                    }}
                  >
                    <Popup>
                      <div className="text-sm" style={{ minWidth: '220px' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                          {zone.zone}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                          {zone.city} — {zone.pincode}
                        </p>
                        <hr style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Risk Level</span>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: RISK_COLORS[zone.risk_level],
                              }}
                            >
                              {zone.risk_level}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Risk Score</span>
                            <span style={{ fontWeight: 'bold' }}>{zone.risk_score}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Workers</span>
                            <span style={{ fontWeight: 'bold' }}>{zone.workers}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Active Policies</span>
                            <span style={{ fontWeight: 'bold' }}>{zone.active_policies}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Claims (7d)</span>
                            <span style={{ fontWeight: 'bold' }}>{zone.recent_claims}</span>
                          </div>
                        </div>
                        {hasLiveAlert && (
                          <div
                            style={{
                              marginTop: '8px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '6px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                            }}
                          >
                            🚨 LIVE ALERT ACTIVE
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div className="space-y-4" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            {selectedZone ? (
              <div className="bg-white p-5 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{selectedZone.zone}</h3>
                    <p className="text-gray-500 text-sm">
                      {selectedZone.city} — {selectedZone.pincode}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: RISK_COLORS[selectedZone.risk_level] }}
                  >
                    {selectedZone.risk_level}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Risk Score</span>
                    <span className="font-bold">{selectedZone.risk_score}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${selectedZone.risk_score * 100}%`,
                        backgroundColor: RISK_COLORS[selectedZone.risk_level],
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-700">
                      {selectedZone.workers}
                    </div>
                    <div className="text-xs text-blue-500">Workers</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-700">
                      {selectedZone.active_policies}
                    </div>
                    <div className="text-xs text-green-500">Policies</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-orange-700">
                      {selectedZone.recent_claims}
                    </div>
                    <div className="text-xs text-orange-500">Claims 7d</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-lg text-center">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-gray-500 text-sm">
                  Click a zone on the map to see details and forecast
                </p>
              </div>
            )}

            {selectedZone && forecastLoading && (
              <div className="bg-white p-5 rounded-2xl shadow-lg text-center">
                <div className="animate-pulse text-gray-400">Loading forecast...</div>
              </div>
            )}

            {selectedZone && forecast && !forecastLoading && (
              <div className="bg-white p-5 rounded-2xl shadow-lg">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📅</span>
                  Next Week Forecast
                </h4>

                <div className="space-y-3">
                  {Object.entries(forecast.predictions).map(([key, pred]) => {
                    const labels = {
                      heavy_rain: { icon: '🌧️', name: 'Rain' },
                      severe_aqi: { icon: '🏭', name: 'AQI' },
                      flooding: { icon: '🌊', name: 'Flood' },
                      curfew_bandh: { icon: '🚫', name: 'Curfew' },
                    };
                    const label = labels[key] || { icon: '⚡', name: key };

                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span>
                            {label.icon} {label.name}
                          </span>
                          <span
                            className={`font-bold ${
                              pred.probability > 60
                                ? 'text-red-600'
                                : pred.probability > 30
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {pred.probability}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              pred.probability > 60
                                ? 'bg-red-400'
                                : pred.probability > 30
                                ? 'bg-yellow-400'
                                : 'bg-green-400'
                            }`}
                            style={{
                              width: `${Math.min(pred.probability, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 bg-gray-50 p-3 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Expected Impact</div>
                  <div className="flex justify-between text-sm">
                    <span>
                      Claims:{' '}
                      <strong>{forecast.expected_impact.expected_claims}</strong>
                    </span>
                    <span>
                      Payout:{' '}
                      <strong>{forecast.expected_impact.expected_payout}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Reserve: {forecast.expected_impact.reserve_recommendation}
                  </div>
                </div>

                <div
                  className={`mt-3 p-2 rounded-lg text-xs ${
                    forecast.predictions.heavy_rain?.probability > 50
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  💡 {forecast.worker_advisory}
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <h4 className="font-bold text-gray-800 text-sm mb-3">🎨 Legend</h4>
              <div className="space-y-2">
                {[
                  { level: 'LOW', range: '0.0 - 0.3', desc: 'Minimal disruption risk' },
                  { level: 'MEDIUM', range: '0.3 - 0.6', desc: 'Moderate risk' },
                  { level: 'HIGH', range: '0.6 - 0.8', desc: 'Frequent disruptions' },
                  { level: 'VERY HIGH', range: '0.8 - 1.0', desc: 'Severe risk zone' },
                ].map((item) => (
                  <div key={item.level} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: RISK_COLORS[item.level] }}
                    />
                    <div>
                      <span className="text-xs font-bold">{item.level}</span>
                      <span className="text-xs text-gray-400 ml-1">({item.range})</span>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
                <span className="text-xs font-bold text-red-600">🚨 Live Alert Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">📊 All Zones — Risk Rankings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Zone</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Pincode</th>
                  <th className="p-3 text-left">Risk Level</th>
                  <th className="p-3 text-left">Score</th>
                  <th className="p-3 text-left">Workers</th>
                  <th className="p-3 text-left">Policies</th>
                  <th className="p-3 text-left">Claims (7d)</th>
                </tr>
              </thead>
              <tbody>
                {zones
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .map((zone, index) => {
                    const hasLiveAlert = liveWeather?.alerts?.some(
                      (a) => a.pincode === zone.pincode
                    );
                    const isSelected = selectedZone?.pincode === zone.pincode;

                    return (
                      <tr
                        key={zone.pincode}
                        className={`border-b cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-50'
                            : hasLiveAlert
                            ? 'bg-red-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleZoneClick(zone)}
                      >
                        <td className="p-3 text-gray-400">{index + 1}</td>
                        <td className="p-3">
                          <span className="font-medium">{zone.zone}</span>
                          {hasLiveAlert && (
                            <span className="ml-2 text-xs text-red-600 animate-pulse">
                              🚨
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600">{zone.city}</td>
                        <td className="p-3 font-mono text-gray-500 text-xs">
                          {zone.pincode}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              RISK_BG[zone.risk_level]
                            }`}
                          >
                            {zone.risk_level}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${zone.risk_score * 100}%`,
                                  backgroundColor: RISK_COLORS[zone.risk_level],
                                }}
                              />
                            </div>
                            <span className="font-bold text-xs">{zone.risk_score}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium">{zone.workers}</td>
                        <td className="p-3">{zone.active_policies}</td>
                        <td className="p-3">
                          <span
                            className={`font-bold ${
                              zone.recent_claims > 0
                                ? 'text-orange-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {zone.recent_claims}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskMap;