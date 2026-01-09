import React from "react";
import Map from "./Map";
import Timeline from "./Timeline";

function MapSection({
  allYears,
  currSpeciesRegions,
  pastSpeciesRegions,
  regionsDetail,
  currSites,
  speciesYears,
  allYearRegionMap,
  setNewYear,
  showTimeline,
  nemesisRegionNames,
  expandSide,
}) {
  // turn set into list
  pastSpeciesRegions = Array.from(pastSpeciesRegions);

  return (
    <div className="relative flex flex-col h-full w-full">
      <Map
        allYears={allYears}
        currRegions={currSpeciesRegions}
        pastRegions={pastSpeciesRegions}
        regionsDetail={regionsDetail}
        nemesisRegionNames={nemesisRegionNames}
        currSites={currSites}
        expandSide={expandSide}
      />
      {showTimeline && (
        <Timeline allowedYears={speciesYears} setNewYear={setNewYear} />
      )}
    </div>
  );
}

export default MapSection;
