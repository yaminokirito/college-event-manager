// helper for timeslot overlap etc.
export function timesOverlap(aStart, aEnd, bStart, bEnd){
  return !(aEnd <= bStart || aStart >= bEnd)
}
