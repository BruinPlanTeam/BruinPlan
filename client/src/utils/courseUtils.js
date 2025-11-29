/**
 * Calculate the total units in a given zone
 * @param {string} targetZoneId - The ID of the zone to calculate units for
 * @param {Object} droppableZones - All droppable zones
 * @returns {number} Total units in the zone
 */
export function getCurrentUnits(targetZoneId, droppableZones) {
  if (!droppableZones) return 0;
  let totalUnits = 0;

  for (const [key, zone] of Object.entries(droppableZones)) {
    if (key === targetZoneId) {
      for (const item of zone.items) {
        totalUnits += item.units;
      }
    }
  }
  return totalUnits;
}

