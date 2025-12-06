export function getRequirementDisplayName(name) {
  if (!name) return '';
  const nameStr = String(name);
  
  // special case: writing ii in ge should show as "engineering writing"
  if (nameStr.toLowerCase().includes('writing ii')) {
    return 'Engineering Writing';
  }
  
  const parts = nameStr.split(' - ');
  return parts[parts.length - 1];
}