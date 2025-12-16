const API_KEY = "68fbc8ef-b90c-4e6c-bdfe-55469607ff45";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("findButton");
  if (button) button.addEventListener("click", lookupReps);

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
  resultsDiv.innerHTML = "<p>Loading...</p>";

  const federalDiv = document.getElementById("federalReps");
  const stateDiv = document.getElementById("stateReps");

  federalDiv.innerHTML = "";
  stateDiv.innerHTML = "";

  if (!street || !city || !state) {
    resultsDiv.innerHTML = "<p>Please fill in Street, City, and State (2-letter code).</p>";
    return;
  }

  const fullAddress = `${street}, ${city}, ${state}`;
  const url = `https://v3.openstates.org/people?jurisdiction=${state}&address=${encodeURIComponent(fullAddress)}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      return;
    }

    const data = await response.json();
    resultsDiv.innerHTML = ""; // Clear loading

    // Filter federal and state reps
    const federalReps = data.results.filter(r =>
      r.current_role &&
      r.current_role.org_classification === "upper" &&
      r.current_role.org.name.includes("United States")
    );

    const federalHouse = federalReps.filter(r =>
      r.current_role.org_classification === "lower" &&
      r.current_role.org.name.includes("United States")
    );

    const federalSenate = federalReps.filter(r =>
      r.current_role.org_classification === "upper" &&
      r.current_role.org.name.includes("United States")
    );

    const stateReps = data.results.filter(r => !federalReps.includes(r));

    // Render sections
    renderResults(federalSenate, federalDiv, "U.S. Senators");
    renderResults(federalHouse, federalDiv, "U.S. House Representatives");
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
