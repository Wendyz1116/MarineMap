import { useState, useEffect } from "react";
import "../index.css";
import OneSpeciesSelection from "./OneSpeciesSelection";
import MultipleSpeciesSelection from "./MultipleSpeciesSelection";
import { use } from "react";
// import ObisApi from "./fetchObisData";

function Sidebar({
  selectedSpeciesInfo,
  selectedSpeciesBInfo,
  onSpeciesSelect,
  onSpeciesSelectB,
  showingSpeciesDetail,
  nemesisRegionNames,
  expandSide,
  setExpandSide,
}) {
  const [selectedTab, setSelectedTab] = useState("oneSpecies");

  console.log("selectedSpeciesInfo", selectedSpeciesInfo, selectedSpeciesBInfo);

  return (
    <div className="z-50 fixed w-fit h-full border-r-2 shadow-md border-primary flex flex-row bg-base-100">
      {/* Collapse sidebar with icons only */}
      <div className="flex flex-col bg-secondary items-center w-8">
        <div
          className={`cursor-pointer w-full py-2 text-center ${
            selectedTab === "oneSpecies" ? "bg-base-200" : ""
          }`}
          onClick={() => {
            setSelectedTab("oneSpecies");
            setExpandSide(true);
          }}
        >
          S
        </div>
        <div
          className={`cursor-pointer w-full py-2 text-center ${
            selectedTab === "multipleSpecies" ? "bg-base-200" : ""
          }`}
          onClick={() => {
            setSelectedTab("multipleSpecies");
            setExpandSide(true);
            onSpeciesSelect(null);
          }}
        >
          M
        </div>
      </div>

      {/* Expanded sidebar */}
      {expandSide && (
        <div className="flex flex-col w-52 h-full">
          <div
            className="cursor-pointer w-full p-2 flex justify-end align-bottom items-end"
            onClick={() => {
              setExpandSide(false);
              onSpeciesSelect(null);
            }}
          >
            ✕
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            <div className="">
              {selectedTab === "oneSpecies" ? (
                <div>
                  <p className="font-bold text-center">Review One Species</p>
                  <OneSpeciesSelection
                    selectedSpeciesRegionalInfo={selectedSpeciesInfo}
                    onSpeciesSelect={onSpeciesSelect}
                    showingSpeciesDetail={showingSpeciesDetail}
                    nemesisRegionNames={nemesisRegionNames}
                                    />
                  {/* <ObisApi /> */}
                </div>
              ) : (
                <div>
                  <p className="font-bold text-center">Review Multiple Species</p>
                  <MultipleSpeciesSelection
                  selectedSpeciesARegionalInfo={selectedSpeciesInfo}
                  selectedSpeciesBRegionalInfo={selectedSpeciesBInfo}
                  onSpeciesSelect={onSpeciesSelect}
                  onSpeciesSelectB={onSpeciesSelectB}
                  showingSpeciesDetail={showingSpeciesDetail} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
