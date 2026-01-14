import React from "react";
import Map from "./Map";
import Timeline from "./Timeline";

function MapSection({
  allYears,
  currSpeciesRegions,
  pastSpeciesRegions,
  pastSpeciesRegionsB,
  regionsDetail,
  regionsDetailB,
  currSites,
  currSitesB,
  speciesYears,
  speciesYearsB,
  allYearRegionMap,
  setNewYear,
  showTimeline,
  nemesisRegionNames,
  expandSide,
}) {
  console.log("---------------------------");
  console.log("MapSection allYears", allYears);
  console.log("MapSection currSpeciesRegions", currSpeciesRegions);
  console.log("MapSection pastSpeciesRegions", pastSpeciesRegions);
  console.log("MapSection pastSpeciesRegionsB", pastSpeciesRegionsB);
  console.log("MapSection regionsDetail", regionsDetail);
  console.log("MapSection regionsDetailB", regionsDetailB);
  console.log("MapSection currSites", currSites);
  console.log("MapSection currSitesB", currSitesB);
  console.log("MapSection speciesYears", speciesYears);
  console.log("MapSection speciesYearsB", speciesYearsB);
  console.log("MapSection allYearRegionMap", allYearRegionMap);
  console.log("---------------------------");
  // turn set into list
  pastSpeciesRegions = Array.from(pastSpeciesRegions);

  return (
    <div className="relative flex flex-col h-full w-full">
      <Map
        allYears={allYears}
        currRegions={currSpeciesRegions}
        pastRegions={pastSpeciesRegions}
        pastRegionsB={pastSpeciesRegionsB}
        regionsDetailB={regionsDetailB}
        regionsDetail={regionsDetail}
        nemesisRegionNames={nemesisRegionNames}
        currSites={currSites}
        currSitesB={currSitesB}
        expandSide={expandSide}
      />
      {showTimeline && (
        <Timeline allowedYears={speciesYears} allowedYearsB={speciesYearsB} setNewYear={setNewYear} />
      )}
    </div>
  );
}

export default MapSection;
