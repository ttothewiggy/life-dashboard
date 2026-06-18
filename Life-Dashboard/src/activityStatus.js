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
  const { tempC, windKph, sky, swellM, swellPeriodS, seaTempC } = env
  const skyRank = SKY[sky] ?? 1

  return {
    paddleboarding: statusPaddle(tempC, windKph, skyRank),
    surfing: statusSurf(windKph, skyRank, swellM, swellPeriodS),
    boating: statusBoat(windKph, skyRank),
    wetsuit: statusWetsuit(seaTempC, windKph),
  }
}

function statusPaddle(tempC, windKph, skyRank) {
  // 22 mph ≈ 35 km/h
  if (skyRank >= SKY.stormy || windKph > 35) {
    return { label: 'Not ideal', detail: 'Strong wind or storms — stay off the water.' }
  }
  // 52°F–93°F ≈ 11°C–34°C
  if (tempC < 11 || tempC > 34) {
    return { label: 'Fair', detail: 'Temperature is at the edge of comfortable paddling.' }
  }
  // 14 mph ≈ 23 km/h
  if (skyRank >= SKY.rainy || windKph > 23) {
    return { label: 'Fair', detail: 'Rain or breezy conditions — fine for experienced paddlers.' }
  }
  return { label: 'Good', detail: 'Light wind, mild temps — great day on flat water.' }
}

function statusSurf(windKph, skyRank, swellM, swellPeriodS) {
  // 28 mph ≈ 45 km/h
  if (skyRank >= SKY.stormy || windKph > 45) {
    return { label: 'Not ideal', detail: 'Stormy or dangerously windy for most spots.' }
  }
  // 2 ft ≈ 0.6 m
  if (swellM < 0.6) {
    return { label: 'Fair', detail: 'Very small swell — longboard or skip unless you enjoy flat days.' }
  }
  // 10 ft ≈ 3.0 m
  // 18 mph ≈ 29 km/h
  if (swellM > 3.0 && windKph > 29) {
    return { label: 'Not ideal', detail: 'Large swell with strong onshore-style wind — expert-only.' }
  }
  // 3–7 ft ≈ 0.9–2.1 m
  // 18 mph ≈ 29 km/h
  if (swellM >= 0.9 && swellM <= 2.1 && swellPeriodS >= 10 && windKph <= 29) {
    return { label: 'Good', detail: 'Decent size and period with manageable wind.' }
  }
  // 2.5 ft ≈ 0.76 m
  if (swellM >= 0.76 && skyRank <= SKY.cloudy) {
    return { label: 'Fair', detail: 'Rideable; check your local break for tide and crowd.' }
  }
  return { label: 'Fair', detail: 'Mixed signals — worth a look at the cam before you go.' }
}

function statusBoat(windKph, skyRank) {
  // 38 mph ≈ 61 km/h
  if (skyRank >= SKY.stormy || windKph > 61) {
    return { label: 'Not ideal', detail: 'Small craft advisory territory — postpone if you can.' }
  }
  // 22 mph ≈ 35 km/h
  if (skyRank >= SKY.rainy && windKph > 35) {
    return { label: 'Not ideal', detail: 'Rain plus wind reduces comfort and visibility.' }
  }
  // 22 mph ≈ 35 km/h
  if (skyRank >= SKY.cloudy && windKph < 35) {
    return { label: 'Not ideal', detail: 'Cloudy plus low wind increases chances of fish.' }
  }
  // 28 mph ≈ 45 km/h
  if (windKph > 45 || skyRank >= SKY.rainy) {
    return { label: 'Fair', detail: 'Experienced crews only; watch gusts and squalls.' }
  }
  return { label: 'Good', detail: 'Moderate breeze and stable sky — routine day on the water.' }
}

function statusWetsuit(seaTempC, windKph) {
  if (typeof seaTempC !== 'number') {
    return {
      label: 'Unknown',
      detail: 'Sea temperature unavailable — check temp on locals bouys yourself you lazy bum.',
    }
  }

  const windChill = windKph >= 25

  if (seaTempC >= 22) {
    return {
      label: windChill ? 'Spring suit' : 'Boardshorts',
      detail: windChill
        ? 'Warm water, but the wind may make a spring suit more comfortable.'
        : 'Warm water — boardshorts or a light rash vest should be fine.',
    }
  }

  if (seaTempC >= 19) {
    return {
      label: windChill ? '3/2 full suit' : 'Spring suit',
      detail: windChill
        ? 'Mild water with wind chill — a 3/2 is the safer call.'
        : 'Mild water — a spring suit should be enough for most sessions.',
    }
  }

  if (seaTempC >= 16) {
    return {
      label: '3/2 full suit',
      detail: 'Cool water — a 3/2 full suit is the one.',
    }
  }

  if (seaTempC >= 13) {
    return {
      label: '4/3 full suit',
      detail: 'Cold water — a 4/3 is the comfortable choice.',
    }
  }

  return {
    label: '5/4 full suit',
    detail: 'Very cold water — consider hood, boots, and gloves depending on exposure.',
  }
}