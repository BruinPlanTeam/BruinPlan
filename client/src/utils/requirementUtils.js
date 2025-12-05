export function getRequirementDisplayName(name) {
  if (!name) return '';
  const nameStr = String(name);
  
  // special case: Writing II in GE should show as "Engineering Writing"
  if (nameStr.toLowerCase().includes('writing ii')) {
    return 'Engineering Writing';
  }
  
  const parts = nameStr.split(' - ');
  return parts[parts.length - 1];
}