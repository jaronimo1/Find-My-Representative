document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("findButton");
  if (!button) return;

  button.addEventListener("click", lookupReps);

  // Allow pressing Enter in any input to trigger lookup
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
  const stateDiv = document.getElementById("stateReps");

  if (!resultsDiv || !stateDiv) return;

  if (!street || !city || !state) {
    resultsDiv.innerHTML = "<p>Please fill in Street, City, and State.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";
  stateDiv.innerHTML = "";

  const fullAddress = `${street}, ${city}, ${state}`;
  const url = `http://localhost:3000/getReps?address=${encodeURIComponent(fullAddress)}&state=${state}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        resultsDiv.innerHTML = "<p>No representatives found for this address.</p>";
      } else {
        resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      }
      return;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p>No representatives found for this address.</p>";
      return;
    }

    resultsDiv.innerHTML = "";
    renderResults(data.results, stateDiv, "State Representatives");

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
