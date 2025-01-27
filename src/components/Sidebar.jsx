import React from "react";
import { useState } from "react";
import OneSpeciesSelection from "./oneSpeciesSelection";
import MultipleSpeciesSelection from "./MultipleSpeciesSelection";

function Sidebar({ onSpeciesSelect, showingSpeciesDetail }) {
  const [selectedTab, setSelectedTab] = useState("oneSpecies");
  const [expandSide, setExpandSide] = useState(true);

  return (
    <div className="z-50 w-fit h-full border-r-2 shadow-md border-primary flex flex-row">
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
          }}
        >
          M
        </div>
      </div>

      {/* Expanded sidebar */}
      {expandSide && (
        <div className="flex flex-col w-52">
          <div
            className="cursor-pointer w-full p-2 flex justify-end align-bottom items-end"
            onClick={() => {
              setExpandSide(false);
            }}
          >
            ✕
          </div>
          <div className="">
            {selectedTab === "oneSpecies" ? (
              <div>
                <p className="font-bold text-center">Review One Species</p>
                <OneSpeciesSelection onSpeciesSelect={onSpeciesSelect} showingSpeciesDetail={showingSpeciesDetail} />
              </div>
            ) : (
              <div>
                <p className="font-bold text-center">Review Multiple Species</p>
                <MultipleSpeciesSelection />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
