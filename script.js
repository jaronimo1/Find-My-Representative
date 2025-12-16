const API_KEY = "AIzaSyB3JXwEtBwtZGUesSJWM2QsI4IJWgyxeVs";

async function lookupReps() {
  const addressInput = document.getElementById("addressInput");
  const resultsDiv = document.getElementById("results");
  const address = addressInput.value.trim();

  if (!address) {
    resultsDiv.innerHTML = "<p>Please enter a full address.</p>";
    return;
  }

  const url =
    "https://civicinfo.googleapis.com/civicinfo/v2/representatives" +
    "?address=" + encodeURIComponent(address) +
    "&key=" + API_KEY;

  console.log("Request URL:", url);

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("API error:", response.status, text);
      resultsDiv.innerHTML =
        `<p>Error ${response.status}: Unable to retrieve representative data.</p>`;
      return;
    }

    const data = await response.json();
    renderResults(data);

  } catch (error) {
    console.error("Fetch failed:", error);
    resultsDiv.innerHTML = "<p>Network error contacting data service.</p>";
  }
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
