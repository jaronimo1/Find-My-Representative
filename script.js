// =======================
// script.js
// OpenStates Representative Lookup
// =======================

// Replace this with your OpenStates API key
const API_KEY = "68fbc8ef-b90c-4e6c-bdfe-55469607ff45";

/**
 * Main function to look up representatives by address
 */
async function lookupReps() {
  const street = document.getElementById("streetInput").value.trim();
  const city = document.getElementById("cityInput").value.trim();
  const state = document.getElementById("stateInput").value.trim().toUpperCase();

  const resultsDiv = document.getElementById("results");

  if (!street || !city || !state) {
    resultsDiv.innerHTML = "<p>Please fill in Street, City, and State (2-letter code).</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";

  const fullAddress = `${street}, ${city}, ${state}`;

  // Construct OpenStates API URL
  const url = `https://v3.openstates.org/people?jurisdiction=${state}&address=${encodeURIComponent(fullAddress)}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      return;
    }

    const data = await response.json();
    renderResults(data.results, resultsDiv);

  } catch (error) {
    console.error("Network or fetch error:", error);
    resultsDiv.innerHTML = "<p>Network error while retrieving data.</p>";
  }
}

/**
 * Render representatives into the page
 * @param {Array} reps
 * @param {HTMLElement} resultsDiv
 */
function renderResults(reps, resultsDiv) {
  if (!reps || reps.length === 0) {
    resultsDiv.innerHTML = "<p>No representatives found for this address.</p>";
    return;
  }

  resultsDiv.innerHTML = reps
    .map(rep => {
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
    })
    .join("");
}

// Optional: allow Enter key on any input to trigger lookup
["streetInput", "cityInput", "stateInput"].forEach(id => {
  document.getElementById(id).addEventListener("keypress", function(e) {
    if (e.key === "Enter") lookupReps();
  });
});
