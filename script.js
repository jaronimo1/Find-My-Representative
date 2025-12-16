// =======================
// Civic Representatives Lookup
// =======================

// Your OpenStates API key
const API_KEY = "68fbc8ef-b90c-4e6c-bdfe-55469607ff45";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("findButton");
  if (!button) return;

  button.addEventListener("click", lookupReps);

  ["streetInput", "cityInput", "stateInput"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("keypress", e => {
        if (e.key === "Enter") lookupReps();
      });
    }
  });
});

async function lookupReps() {
  const street = document.getElementById("streetInput")?.value.trim();
  const city = document.getElementById("cityInput")?.value.trim();
  const state = document.getElementById("stateInput")?.value.trim().toUpperCase();

  const resultsDiv = document.getElementById("results");
  const federalSenateDiv = document.getElementById("federalSenate");
  const federalHouseDiv = document.getElementById("federalHouse");
  const stateDiv = document.getElementById("stateReps");

  if (!resultsDiv || !federalSenateDiv || !federalHouseDiv || !stateDiv) {
    console.error("One or more result containers not found.");
    return;
  }

  if (!street || !city || !state) {
    resultsDiv.innerHTML = "<p>Please fill in Street, City, and State.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";
  federalSenateDiv.innerHTML = "";
  federalHouseDiv.innerHTML = "";
  stateDiv.innerHTML = "";

  const fullAddress = `${street}, ${city}, ${state}`;
  const url = `http://localhost:3000/getReps?address=${encodeURIComponent(fullAddress)}&state=${state}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      return;
    }

    const data = await response.json();

    // === Handle empty results ===
    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p>No state representatives found for this address.</p>";
      federalSenateDiv.innerHTML = "<h2>U.S. Senators</h2><p>Federal representatives are not available through OpenStates.</p>";
      federalHouseDiv.innerHTML = "<h2>U.S. House Representatives</h2><p>Federal representatives are not available through OpenStates.</p>";
      return;
    }

    resultsDiv.innerHTML = ""; // clear loading

    // Show state reps
    renderResults(data.results, stateDiv, "State Representatives");

    // Show message for federal reps
    federalSenateDiv.innerHTML = "<h2>U.S. Senators</h2><p>Federal representatives are not available through OpenStates.</p>";
    federalHouseDiv.innerHTML = "<h2>U.S. House Representatives</h2><p>Federal representatives are not available through OpenStates.</p>";

  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "<p>Network error while retrieving data.</p>";
  }
}

function renderResults(reps, container, title) {
  if (!reps || reps.length === 0) {
    container.innerHTML += `<h2>${title}</h2><p>No representatives found.</p>`;
    return;
  }

  container.innerHTML += `<h2>${title}</h2>` + reps.map(rep => {
    const name = rep.name || "Unknown";
    const party = rep.party ? ` (${rep.party})` : "";
    const role = rep.current_role ? rep.current_role.org_classification : "";
    const phones = rep.offices && rep.offices.length
      ? rep.offices.map(o => o.phone).filter(Boolean).join(", ")
      : "No phone listed";
    const urls = rep.urls && rep.urls.length ? rep.urls[0] : "#";

    return `
      <div class="rep-card">
        <h3>${name}${party}</h3>
        <p>Office: ${role}</p>
        <p>Phone: ${phones}</p>
        <p><a href="${urls}" target="_blank">Website</a></p>
      </div>
    `;
  }).join("");
}
