
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("ASTRA HEALTH API Error:", error);
    throw error;
  }
}

async function postAPI(endpoint, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.detail ||
        result.message ||
        `API request failed: ${response.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("ASTRA HEALTH API Error:", error);
    throw error;
  }
}

export function getSystemHealth() {
  return fetchAPI("/health");
}

export function getCardiovascularData() {
  return fetchAPI("/cardiovascular");
}

export function getSleepFatigueData() {
  return fetchAPI("/sleep-fatigue");
}

export function getRadiationData() {
  return fetchAPI("/radiation");
}

export async function askAstraAI(question) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  if (!response.ok) {
    throw new Error("ASTRA AI request failed");
  }

  return response.json();
}

// BONE HEALTH / DXA

export function importDXAData(records) {
  return postAPI("/bone-loss/import", { records });
}

export function getBoneHealthData(astronautId) {
  return fetchAPI(
    `/bone-loss/astronaut/${encodeURIComponent(astronautId)}`
  );
}
