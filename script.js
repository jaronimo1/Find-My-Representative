// =======================
// Civic Representatives Lookup
// =======================

// Replace with your OpenStates API key
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
  const url = `https://v3.openstates.org/people?jurisdiction=${state}&address=${encodeURIComponent(fullAddress)}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      return;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p>No representatives found for this address.</p>";
      return;
    }

    resultsDiv.innerHTML = ""; // clear loading

    const federalReps = data.results.filter(r =>
      r.current_role && r.current_role.org.name.includes("United States")
    );

    const federalSenate = federalReps.filter(r => r.current_role.org_classification === "upper");
    const federalHouse = federalReps.filter(r => r.current_role.org_classification === "lower");
    const stateReps = data.results.filter(r => !federalReps.includes(r));

    renderResults(federalSenate, federalSenateDiv, "U.S. Senators");
    renderResults(federalHouse, federalHouseDiv, "U.S. House Representatives");
    renderResults(stateReps, stateDiv, "State Representatives");

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
