/** Fake snapshot for the dashboard — swap for API data later. */

export const skyLabels = {
  sunny: 'Sunny',
  partly_cloudy: 'Partly cloudy',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  stormy: 'Stormy',
}

export const weatherSnapshot = {
  locationLabel: 'Coastal Bay',
  tempC: 24,
  windKph: 18,
  windDirection: 'NW',
  /** @type {'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'stormy'} */
  sky: 'partly_cloudy',
  humidityPct: 58,
  /** Approximate swell height for surf logic */
  swellM: 1.2,
  /** Seconds — longer often means cleaner waves */
  swellPeriodS: 12,
}

export const upcomingItems = [
  {
    id: '1',
    title: "Diomedes's birthday",
    date: '2026-04-22',
    kind: 'birthday',
  },
  {
    id: '2',
    title: "Alex's birthday",
    date: '2026-04-23',
    kind: 'birthday',
  },
  {
    id: '3',
    title: 'Annual physical',
    date: '2026-04-26',
    kind: 'appointment',
  },
  {
    id: '4',
    title: 'Weekend marina reservation',
    date: '2026-05-03',
    kind: 'event',
  },
]
