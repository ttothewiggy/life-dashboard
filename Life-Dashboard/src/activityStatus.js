/**
 * Derive plain-language activity guidance from the same environmental
 * inputs you would eventually get from forecasts + buoys.
 */

const SKY = {
  sunny: 0,
  partly_cloudy: 1,
  cloudy: 2,
  rainy: 3,
  stormy: 4,
}

/**
 * @param {typeof import('./mockData.js').weatherSnapshot} env
 */
export function getActivityStatuses(env) {
  const { tempC, windMph, sky, swellM, swellPeriodS } = env
  const skyRank = SKY[sky] ?? 1

  return {
    paddleboarding: statusPaddle(tempC, windMph, skyRank),
    surfing: statusSurf(windMph, skyRank, swellM, swellPeriodS),
    boating: statusBoat(windMph, skyRank),
  }
}

function statusPaddle(tempC, windMph, skyRank) {
  if (skyRank >= SKY.stormy || windMph > 22) {
    return { label: 'Not ideal', detail: 'Strong wind or storms — stay off the water.' }
  }
  // 52°F–93°F ≈ 11°C–34°C
  if (tempC < 11 || tempC > 34) {
    return { label: 'Fair', detail: 'Temperature is at the edge of comfortable paddling.' }
  }
  if (skyRank >= SKY.rainy || windMph > 14) {
    return { label: 'Fair', detail: 'Rain or breezy conditions — fine for experienced paddlers.' }
  }
  return { label: 'Good', detail: 'Light wind, mild temps — great day on flat water.' }
}

function statusSurf(windMph, skyRank, swellM, swellPeriodS) {
  if (skyRank >= SKY.stormy || windMph > 28) {
    return { label: 'Not ideal', detail: 'Stormy or dangerously windy for most spots.' }
  }
  // 2 ft ≈ 0.6 m
  if (swellM < 0.6) {
    return { label: 'Fair', detail: 'Very small swell — longboard or skip unless you enjoy flat days.' }
  }
  // 10 ft ≈ 3.0 m
  if (swellM > 3.0 && windMph > 18) {
    return { label: 'Not ideal', detail: 'Large swell with strong onshore-style wind — expert-only.' }
  }
  // 3–7 ft ≈ 0.9–2.1 m
  if (swellM >= 0.9 && swellM <= 2.1 && swellPeriodS >= 10 && windMph <= 18) {
    return { label: 'Good', detail: 'Decent size and period with manageable wind.' }
  }
  // 2.5 ft ≈ 0.76 m
  if (swellM >= 0.76 && skyRank <= SKY.cloudy) {
    return { label: 'Fair', detail: 'Rideable; check your local break for tide and crowd.' }
  }
  return { label: 'Fair', detail: 'Mixed signals — worth a look at the cam before you go.' }
}

function statusBoat(windMph, skyRank) {
  if (skyRank >= SKY.stormy || windMph > 38) {
    return { label: 'Not ideal', detail: 'Small craft advisory territory — postpone if you can.' }
  }
  if (skyRank >= SKY.rainy && windMph > 22) {
    return { label: 'Not ideal', detail: 'Rain plus wind reduces comfort and visibility.' }
  }
  if (skyRank >= SKY.cloudy && windMph < 22) {
    return { label: 'Not ideal', detail: 'Cloudy plus low wind increases chances of fish.' }
  }
  if (windMph > 28 || skyRank >= SKY.rainy) {
    return { label: 'Fair', detail: 'Experienced crews only; watch gusts and squalls.' }
  }
  return { label: 'Good', detail: 'Moderate breeze and stable sky — routine day on the water.' }
}
