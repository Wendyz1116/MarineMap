import React from "react";
import Map from "./Map";
import Timeline from "./Timeline";

function MapSection({
  currSpeciesRegions,
  pastSpeciesRegions,
  regionsDetail,
  currRasSites,
  speciesYears,
  allYearRegionMap,
  setNewYear,
  showTimeline,
}) {
  
  // turn set into list
  pastSpeciesRegions = Array.from(pastSpeciesRegions);

  console.log("making map with", currSpeciesRegions, pastSpeciesRegions);

  return (
    <div className="relative flex flex-col h-full w-full">
      <Map
        currRegions={currSpeciesRegions}
        pastRegions={pastSpeciesRegions}
        regionsDetail={regionsDetail}
        currSites={currRasSites}
      />
      {showTimeline && (
        <Timeline allowedYears={speciesYears} setNewYear={setNewYear} />
      )}
    </div>
  );
}

export default MapSection;
