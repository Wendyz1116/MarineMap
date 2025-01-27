import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { IoIosArrowDown } from "react-icons/io";
import CollapsibleSection from "./CollapsibleSection";

function OneSpeciesSelection({ onSpeciesSelect, showingSpeciesDetail }) {
  const [speciesData, setSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [showSpeciesDetail, setShowSpeciesDetail] = useState(false); // Track sidebar visibility

  const handleSpeciesChange = (event) => {
    setSelectedSpecies(event.target.value);
  };

  const handleButtonClick = () => {
    if (selectedSpeciesInfo) {
      // onSpeciesSelect(selectedSpecies); set to species name
      onSpeciesSelect(selectedSpeciesInfo); //set to species id
      setShowSpeciesDetail(true); // Populate sidebar with species' detail when a species is selected
      showingSpeciesDetail(true); // For communicating with timeline that species is selected
    } else {
      alert("Please select a species.");
    }
  };

  // updated selectedSpeciesInfo to store info abt the current selected species
  const selectedSpeciesInfo = speciesData.find(
    (species) => species["Species Name"] === selectedSpecies
  );

  // useEffect(() => {
  //   onSpeciesSelect(selectedSpecies);
  // }, [selectedSpeciesInfo]);

  useEffect(() => {
    // Fetch the CSV file
    fetch("/descriptions/nemesisSpeciesInfo.csv")
      .then((response) => response.text())
      .then((csvData) => {
        // Parse the CSV data
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // console.log("in results");
            setSpeciesData(results.data);
            // console.log(results);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV file:", error));
  }, []);

  return (
    <div>
      {!showSpeciesDetail && (
        <div className="m-2 flex flex-col">
          <div className="text-sm">Select a species:</div>

          <select
            className="select focus:outline-none outline-none select-xs w-full select-secondary rounded-md text-xs"
            onChange={handleSpeciesChange}
          >
            <option disabled selected>
              Select a species
            </option>
            {speciesData.map((species, index) => (
              <option key={index} value={species["Species Name"]}>
                {species["Species Name"]}
              </option>
            ))}
          </select>

          <button
            onClick={handleButtonClick}
            className="btn btn-sm m-4 items-center align-middle justify-center btn-secondary"
          >
            Generate map
          </button>
        </div>
      )}

      {/* Sidebar for species info */}
      {/*         <div className="sidebar bg-gray-200 p-4 rounded-md w-1/3 h-full fixed right-0 top-0">
       */}
      {showSpeciesDetail && selectedSpeciesInfo && (
        <div className="m-2 flex flex-col">
          <h2 className="text-xl font-semibold">
            {selectedSpeciesInfo["Species Name"]}
          </h2>
          <p className="text-sm mt-2">
            {selectedSpeciesInfo["Species Description"]}
          </p>
          <img
            src={selectedSpeciesInfo["Species Img"]}
            alt={selectedSpeciesInfo["Species Name"]}
            className="w-full h-auto"
          />

          <CollapsibleSection title="First record:" body="First record" />
          <CollapsibleSection title="Classification:" body="Classification" />
          <CollapsibleSection title="More details:" body="More details" />

          <button
            className="mt-4 btn btn-sm btn-secondary"
            onClick={() => {
              setShowSpeciesDetail(false);
              showingSpeciesDetail(false);
            }}
          >
            Review new species
          </button>
        </div>
      )}
    </div>
  );
}

export default OneSpeciesSelection;
