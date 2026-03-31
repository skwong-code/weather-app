import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

  // ... (the rest of the code stays exactly the same as the last version I gave you)

  const searchCities = async (query: string) => {
    if (!query.trim()) return;
    setSuggestions([]);

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&types=place&limit=8`
      );
      setSuggestions(response.data.features || []);
    } catch {
      setSuggestions([]);
    }
  };

  const fetchWeather = async (lat: number, lon: number, displayName: string) => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      setWeather({ ...response.data, displayName });
    } catch {
      setError('Unable to fetch weather data.');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!city.trim()) return;
    searchCities(city);
  };

  const selectSuggestion = (feature: any) => {
    const [lon, lat] = feature.center;
    const displayName = feature.place_name;
    setCity(displayName);
    fetchWeather(lat, lon, displayName);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">Weather App</h3>

              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter city name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-primary btn-lg" onClick={handleSearch}>
                  Search
                </button>
              </div>

              {loading && <p className="text-center">Loading...</p>}

              {error && <div className="alert alert-warning">{error}</div>}

              {suggestions.length > 0 && (
                <div className="alert alert-info">
                  <strong>Did you mean?</strong>
                  <ul className="list-group mt-2">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => selectSuggestion(s)}
                      >
                        {s.place_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {weather && (
                <div className="text-center">
                  <h2 className="mb-1">{weather.displayName}</h2>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].description}
                    style={{ width: '120px' }}
                  />
                  <h1 className="display-4 fw-bold">{Math.round(weather.main.temp)}°C</h1>
                  <p className="text-capitalize fs-4">{weather.weather[0].description}</p>

                  <div className="row mt-4 text-start">
                    <div className="col-4">
                      <strong>Feels Like</strong><br />
                      {Math.round(weather.main.feels_like)}°C
                    </div>
                    <div className="col-4">
                      <strong>Humidity</strong><br />
                      {weather.main.humidity}%
                    </div>
                    <div className="col-4">
                      <strong>Wind</strong><br />
                      {weather.wind.speed} m/s
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;