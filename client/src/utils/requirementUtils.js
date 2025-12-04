export function getRequirementDisplayName(name) {
  if (!name) return '';
  const parts = String(name).split(' - ');
  return parts[parts.length - 1];
}


