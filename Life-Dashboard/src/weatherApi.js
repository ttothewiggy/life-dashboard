const DIR_16 = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
]

function clampDeg(deg) {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

export function degToCompass16(deg) {
  const step = 360 / 16
  const idx = Math.round(clampDeg(deg) / step) % 16
  return DIR_16[idx]
}

function weatherCodeToSky(code) {
  if (code === 0) return 'sunny'
  if (code === 1 || code === 2) return 'partly_cloudy'
  if (code === 3 || code === 45 || code === 48) return 'cloudy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy'
  if (code >= 95 && code <= 99) return 'stormy'
  return 'cloudy'
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function fetchWeatherAndMarine({ latitude, longitude }) {
  const baseParams = `latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(
    longitude,
  )}&timezone=auto`

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${baseParams}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&temperature_unit=celsius&wind_speed_unit=kmh`

  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?${baseParams}&current=wave_height,wave_period`

  const [weather, marine] = await Promise.all([fetchJson(weatherUrl), fetchJson(marineUrl)])

  const cw = weather.current ?? {}
  const cm = marine.current ?? {}

  const windDeg = typeof cw.wind_direction_10m === 'number' ? cw.wind_direction_10m : 0
  const windDirection = degToCompass16(windDeg)

  return {
    tempC: typeof cw.temperature_2m === 'number' ? Math.round(cw.temperature_2m) : null,
    windKph: typeof cw.wind_speed_10m === 'number' ? Math.round(cw.wind_speed_10m) : null,
    windDirection,
    windDirectionDeg: Math.round(windDeg),
    humidityPct: typeof cw.relative_humidity_2m === 'number' ? Math.round(cw.relative_humidity_2m) : null,
    sky: weatherCodeToSky(cw.weather_code),
    swellM: typeof cm.wave_height === 'number' ? Number(cm.wave_height.toFixed(1)) : null,
    swellPeriodS: typeof cm.wave_period === 'number' ? Math.round(cm.wave_period) : null,
    fetchedAtIso: new Date().toISOString(),
  }
}

export async function reverseGeocodeOpenMeteo({ latitude, longitude }) {
  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(
    latitude,
  )}&longitude=${encodeURIComponent(longitude)}&count=1&language=en&format=json`
  const data = await fetchJson(url)
  const top = data?.results?.[0]
  if (!top) return null
  const parts = [top.name, top.admin1, top.country].filter(Boolean)
  return parts.join(', ')
}

export async function reverseGeocodeBigDataCloud({ latitude, longitude }) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
    latitude,
  )}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`
  const data = await fetchJson(url)

  const townish =
    data?.city ||
    data?.locality ||
    data?.principalSubdivision ||
    data?.adminArea ||
    data?.countryName ||
    null

  const regionish = data?.principalSubdivision || data?.countryName || null
  const country = data?.countryName || null

  const parts = [townish, regionish, country].filter(Boolean)
  if (parts.length === 0) return null

  // De-dupe when townish === regionish, etc.
  return [...new Set(parts)].join(', ')
}

export async function reverseGeocodeBest(coords) {
  const primary = await reverseGeocodeOpenMeteo(coords).catch(() => null)
  if (primary) return primary
  const fallback = await reverseGeocodeBigDataCloud(coords).catch(() => null)
  return fallback
}

