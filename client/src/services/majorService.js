export async function retrieveMajors() {
  try {
    const response = await fetch('/api/majors', {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`An error has occurred: ${response.status} `)
    }

    const majorNamesList = await response.json()
    
    return majorNamesList;

  } catch (error) {
    console.error("Fetch Error:", error);
    throw error
  }
}
