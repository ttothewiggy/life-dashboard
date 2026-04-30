import { useEffect, useMemo, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './dashboard.css'
import { getActivityStatuses } from './activityStatus.js'
import { skyLabels, upcomingItems, weatherSnapshot } from './mockData.js'
import { WindCompass } from './WindCompass.jsx'
import { fetchWeatherAndMarine, reverseGeocodeBest } from './weatherApi.js'



function badgeClass(label) {
  if (label === 'Good') return 'activity-badge activity-badge--good'
  if (label === 'Fair') return 'activity-badge activity-badge--fair'
  return 'activity-badge activity-badge--bad'
}

function formatEventDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  return {
    month: d.toLocaleString('en', { month: 'short' }),
    day: d.getDate(),
    weekday: d.toLocaleString('en', { weekday: 'short' }),
  }
}

export default function App() {
  const [weather, setWeather] = useState(weatherSnapshot)
  const [weatherStatus, setWeatherStatus] = useState({ state: 'idle', message: '' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setWeatherStatus({ state: 'loading', message: 'Getting your location…' })

      const coords = await new Promise((resolve) => {
        if (!('geolocation' in navigator)) return resolve(null)
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
        )
      })

      if (!coords) {
        if (cancelled) return
        setWeather((prev) => ({ ...prev, locationLabel: 'Location permission required' }))
        setWeatherStatus({
          state: 'error',
          message: 'Enable location access to show your live location and local weather.',
        })
        return
      }

      try {
        setWeatherStatus({ state: 'loading', message: 'Fetching live weather…' })
        const [live, label] = await Promise.all([
          fetchWeatherAndMarine(coords),
          reverseGeocodeBest(coords).catch(() => null),
        ])

        if (cancelled) return

        setWeather((prev) => ({
          ...prev,
          locationLabel: label ?? 'Your location',
          tempC: live.tempC ?? prev.tempC,
          windKph: live.windKph ?? prev.windKph,
          windDirection: live.windDirection ?? prev.windDirection,
          sky: live.sky ?? prev.sky,
          humidityPct: live.humidityPct ?? prev.humidityPct,
          swellM: live.swellM ?? prev.swellM,
          swellPeriodS: live.swellPeriodS ?? prev.swellPeriodS,
        }))
        setWeatherStatus({ state: 'live', message: 'Live weather loaded.' })
      } catch {
        if (cancelled) return
        setWeatherStatus({
          state: 'error',
          message: 'Could not load live weather. Location is live, but weather is unavailable right now.',
        })
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const activities = useMemo(() => getActivityStatuses(weather), [weather])

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Life dashboard</h1>
        <p className="dashboard__subtitle">Local weather uses your live location (browser permission required).</p>
      </header>

      <div className="dashboard__grid">
        <article className="card">
          <p className="card__eyebrow">Weather</p>
          <h2 className="card__title">{weather.locationLabel}</h2>
          <div className="weather-hero">
            <span className="weather-hero__value">{weather.tempC}</span>
            <span className="weather-hero__unit">°C</span>
          </div>
          <dl className="weather-rows">
            <div className="weather-row">
              <dt>Sky</dt>
              <dd>{skyLabels[weather.sky]}</dd>
            </div>
            <div className="weather-row">
              <dt>Wind</dt>
              <dd>
                {weather.windKph} kph {weather.windDirection}
              </dd>
            </div>
            <div className="weather-row">
              <dt>Humidity</dt>
              <dd>{weather.humidityPct}%</dd>
            </div>
          </dl>
          <div className="wind-control">
            <label className="wind-control__label" htmlFor="wind-slider">
              <span className="wind-control__title">Wind (what-if)</span>
              <span className="wind-control__value" aria-live="polite">
                {weather.windKph} kph
              </span>
            </label>
            <input
              id="wind-slider"
              className="wind-slider"
              type="range"
              min={0}
              max={80}
              step={1}
              value={weather.windKph}
              onChange={(e) =>
                setWeather((prev) => ({
                  ...prev,
                  windKph: Number(e.target.value),
                }))
              }
              aria-valuemin={0}
              aria-valuemax={80}
              aria-valuenow={weather.windKph}
              aria-valuetext={`${weather.windKph} kilometers per hour`}
            />
            <WindCompass
              value={weather.windDirection}
              onChange={(dir) => setWeather((prev) => ({ ...prev, windDirection: dir }))}
            />
            <p className="wind-control__hint" aria-live="polite">
              {weatherStatus.state === 'loading' ? weatherStatus.message : null}
              {weatherStatus.state === 'error' ? weatherStatus.message : null}
            </p>
          </div>
        </article>

        <article className="card">
          <p className="card__eyebrow">Activities</p>
          <h2 className="card__title">Today&apos;s conditions</h2>
          <p className="card__meta">
            Updates when you move the wind slider on the weather card (other fields stay
            from the mock snapshot).
          </p>
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-item__row">
                <p className="activity-item__name">Paddleboarding</p>
                <span className={badgeClass(activities.paddleboarding.label)}>
                  {activities.paddleboarding.label}
                </span>
              </div>
              <p className="activity-item__detail">{activities.paddleboarding.detail}</p>
            </li>
            <li className="activity-item">
              <div className="activity-item__row">
                <p className="activity-item__name">Surfing</p>
                <span className={badgeClass(activities.surfing.label)}>
                  {activities.surfing.label}
                </span>
              </div>
              <p className="activity-item__detail">{activities.surfing.detail}</p>
            </li>
            <li className="activity-item">
              <div className="activity-item__row">
                <p className="activity-item__name">Boating</p>
                <span className={badgeClass(activities.boating.label)}>
                  {activities.boating.label}
                </span>
              </div>
              <p className="activity-item__detail">{activities.boating.detail}</p>
            </li>
          </ul>
          <p className="activity-footnote">
            Thresholds are placeholders — tune them for your coast and craft.
          </p>
        </article>

        <article className="card">
          <p className="card__eyebrow">Important dates</p>
          <h2 className="card__title">Coming up</h2>
          <ul className="events-list">
            {upcomingItems.map((item) => {
              const { month, day, weekday } = formatEventDate(item.date)
              return (
                <li key={item.id} className="event-row">
                  <div className="event-date" aria-hidden>
                    <span className="event-date__month">{month}</span>
                    <span className="event-date__day">{day}</span>
                  </div>
                  <div className="event-body">
                    <p className="event-title">{item.title}</p>
                    <p className="event-kind">
                      {item.kind} · {weekday}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </article>
      </div>
      <Analytics />
    </div>
  )
}
