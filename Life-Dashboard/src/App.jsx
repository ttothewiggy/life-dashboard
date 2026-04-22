import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './dashboard.css'
import { getActivityStatuses } from './activityStatus.js'
import { skyLabels, upcomingItems, weatherSnapshot } from './mockData.js'
import { WindCompass } from './WindCompass.jsx'



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
  const [windKph, setWindKph] = useState(weatherSnapshot.windKph)
  const [windDirection, setWindDirection] = useState(weatherSnapshot.windDirection)
  const liveWeather = { ...weatherSnapshot, windKph, windDirection }
  const activities = getActivityStatuses(liveWeather)

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Life dashboard</h1>
        <p className="dashboard__subtitle">Sample data — I'm going to wire up live API's soon. 
      </header>

      <div className="dashboard__grid">
        <article className="card">
          <p className="card__eyebrow">Weather</p>
          <h2 className="card__title">{weatherSnapshot.locationLabel}</h2>
          <div className="weather-hero">
            <span className="weather-hero__value">{weatherSnapshot.tempC}</span>
            <span className="weather-hero__unit">°C</span>
          </div>
          <dl className="weather-rows">
            <div className="weather-row">
              <dt>Sky</dt>
              <dd>{skyLabels[weatherSnapshot.sky]}</dd>
            </div>
            <div className="weather-row">
              <dt>Wind</dt>
              <dd>
                {liveWeather.windKph} kph {liveWeather.windDirection}
              </dd>
            </div>
            <div className="weather-row">
              <dt>Humidity</dt>
              <dd>{weatherSnapshot.humidityPct}%</dd>
            </div>
          </dl>
          <div className="wind-control">
            <label className="wind-control__label" htmlFor="wind-slider">
              <span className="wind-control__title">Wind speed</span>
              <span className="wind-control__value" aria-live="polite">
                {windKph} kph
              </span>
            </label>
            <input
              id="wind-slider"
              className="wind-slider"
              type="range"
              min={0}
              max={80}
              step={1}
              value={windKph}
              onChange={(e) => setWindKph(Number(e.target.value))}
              aria-valuemin={0}
              aria-valuemax={80}
              aria-valuenow={windKph}
              aria-valuetext={`${windKph} kilometers per hour`}
            />
            <WindCompass value={windDirection} onChange={setWindDirection} />
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
