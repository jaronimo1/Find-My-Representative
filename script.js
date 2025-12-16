// =======================
// script.js
// OpenStates Representative Lookup
// =======================

// Replace this with your actual OpenStates API key
const API_KEY = "YOUR_OPENSTATES_KEY_HERE";

/**
 * Main function to look up representatives by address
 */
async function lookupReps() {
  const addressInput = document.getElementById("addressInput");
  const resultsDiv = document.getElementById("results");
  const address = addressInput.value.trim();

  if (!address) {
    resultsDiv.innerHTML = "<p>Please enter a full address.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";

  // Construct OpenStates API URL
  const url = `https://v3.openstates.org/people?jurisdiction=US&address=${encodeURIComponent(address)}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      return;
    }

    const data = await response.json();

    // Render the results
    renderResults(data.results);

  } catch (error) {
    console.error("Network or fetch error:", error);
    resultsDiv.innerHTML = "<p>Network error while retrieving data.</p>";
  }
}

/**
 * Renders the representative results into the page
 * @param {Array} reps - Array of representative objects from OpenStates
 */
function renderResults(reps) {
  const resultsDiv = document.getElementById("results");

  if (!reps || reps.length === 0) {
    resultsDiv.innerHTML = "<p>No representatives found for this address.</p>";
    return;
  }

  // Build HTML for each representative
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

// Optional: Add listener to handle Enter key in the input field
document.getElementById("addressInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    lookupReps();
  }
});
