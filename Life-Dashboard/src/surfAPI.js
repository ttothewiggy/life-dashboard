import mockSwell from './fixtures/swellResponse.json'

export async function fetchSwell(coords) {
  await new Promise((r) => setTimeout(r, 300))
  return {
    swellM: mockSwell.current.wave_height,
    swellPeriodS: mockSwell.current.wave_period,
    source: 'mock',
  }
}
