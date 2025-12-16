const API_KEY = "68fbc8ef-b90c-4e6c-bdfe-55469607ff45";

async function lookupReps() {
  const addressInput = document.getElementById("addressInput");
  const resultsDiv = document.getElementById("results");
  const address = addressInput.value.trim();

  if (!address) {
    resultsDiv.innerHTML = "<p>Please enter a full address.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";

  const url = `https://v3.openstates.org/people?jurisdiction=US&address=${encodeURIComponent(address)}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error ${response.status}: Could not retrieve representatives.</p>`;
      return;
    }

    const data = await response.json();
    renderResults(data.results);
  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "<p>Network error while retrieving data.</p>";
  }
}

function renderResults(reps) {
  const resultsDiv = document.getElementById("results");
  if (!reps || reps.length === 0) {
    resultsDiv.innerHTML = "<p>No representatives found for this address.</p>";
    return;
  }

  resultsDiv.innerHTML = reps
    .map(
      (rep) => `
    <div class="rep-card">
      <h3>${rep.name}</h3>
      <p>${rep.party ? rep.party : ""} — ${rep.current_role ? rep.current_role.org_classification : ""}</p>
      <p>${rep.offices && rep.offices.length ? rep.offices.map(o => o.phone || "").join(", ") : ""}</p>
      <p><a href="${rep.urls && rep.urls.length ? rep.urls[0] : "#"}" target="_blank">Website</a></p>
    </div>
  `
    )
    .join("");
}


function renderResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const offices = data.offices || [];
  const officials = data.officials || [];

  const sections = {
    Federal: ["President", "Vice President", "United States Senate", "United States House of Representatives"],
    State: ["Governor", "Lieutenant Governor", "State Senate", "State House"],
    County: ["County"],
    Local: ["Mayor", "City Council", "Town Council", "Local"]
  };

  const levelGroups = {
    Federal: [],
    State: [],
    County: [],
    Local: []
  };

  offices.forEach((office, idx) => {
    const officeName = office.name;
    const indices = office.officialIndices || [];

    let level = "Local"; 
    if (sections.Federal.some(t => officeName.includes(t))) level = "Federal";
    else if (sections.State.some(t => officeName.includes(t))) level = "State";
    else if (sections.County.some(t => officeName.includes(t))) level = "County";

    indices.forEach(i => {
      const official = officials[i];
      levelGroups[level].push({ office: officeName, official });
    });
  });

  Object.keys(levelGroups).forEach(level => {
    if (levelGroups[level].length > 0) {
      const sectionDiv = document.createElement("div");
      sectionDiv.className = "section";
      sectionDiv.innerHTML = `<h2>${level}</h2>`;

      levelGroups[level].forEach(item => {
        const card = document.createElement("div");
        card.className = "official-card";

        card.innerHTML = `
          <div class="office-title">${item.office}</div>
          <div><strong>${item.official.name || ""}</strong></div>
          <div>${item.official.party || ""}</div>
          <div>${item.official.phones ? item.official.phones.join(", ") : ""}</div>
          <div>${item.official.emails ? item.official.emails.join(", ") : ""}</div>
          <div>${item.official.urls ? item.official.urls.join(", ") : ""}</div>
        `;
        sectionDiv.appendChild(card);
      });

      resultsDiv.appendChild(sectionDiv);
    }
  });
}
