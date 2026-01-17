import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import CollapsibleSection from "./CollapsibleSection";

import { use } from "react";

function MultipleSpeciesSelection({
    selectedSpeciesARegionalInfo,
    selectedSpeciesBRegionalInfo,
    onSpeciesSelect,
    onSpeciesSelectB,
    showingSpeciesDetail
  }) {
  const [speciesData, setSpeciesData] = useState([]);
  const [selectedSpeciesA, setSelectedSpeciesA] = useState(null);
  const [selectedSpeciesB, setSelectedSpeciesB] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Track sidebar visibility
  const [showSpeciesDetail, setShowSpeciesDetail] = useState(false); // Track sidebar visibility
  const [speciesFormatedRegionalInfoA, setSpeciesFormatedRegionalInfoA] =
    useState("");
  const [speciesFormatedRegionalInfoB, setSpeciesFormatedRegionalInfoB] =
    useState("");

  const [nemesisLinkA, setNemesisLinkA] = useState("");
  const [nemesisLinkB, setNemesisLinkB] = useState("");


  const handleSpeciesAChange = (event) => {
    setSelectedSpeciesA(event.target.value);
  };

  const handleSpeciesBChange = (event) => {
    setSelectedSpeciesB(event.target.value);
  };

  console.log("selectedSpeciesARegionalInfo", selectedSpeciesARegionalInfo);
  console.log("selectedSpeciesBRegionalInfo", selectedSpeciesBRegionalInfo);

  useEffect(() => {
    // console.log("selectedSpeciesRegionalInfo updated:");
    console.log("updating multiple species regional info: ", selectedSpeciesARegionalInfo, selectedSpeciesBRegionalInfo);
    if (selectedSpeciesARegionalInfo && selectedSpeciesBRegionalInfo) {
      console.log("selectedSpeciesARegionalInfo", selectedSpeciesARegionalInfo);
      console.log("selectedSpeciesBRegionalInfo", selectedSpeciesBRegionalInfo);
      let bodyA = Object.entries(selectedSpeciesARegionalInfo).map(
        ([region, details]) => {
          const { Year, Vectors, ...rest } = details;
          return (
            <div key={region} className="py-1">
              <span className="font-bold">
                {region} ({Year}):
              </span>
              <br />
              <span className="font-semibold"> Invasion Status: </span>{" "}
              {rest["Invasion Status"]}
              <br />
              <span className="font-semibold"> Population Status: </span>{" "}
              {rest["Population Status"]}
              <br />
              <span className="font-semibold"> Vectors: </span> {Vectors}
            </div>
          );
        }
      );
      setSpeciesFormatedRegionalInfoA(bodyA);

      let bodyB = Object.entries(selectedSpeciesBRegionalInfo).map(
        ([region, details]) => {
          const { Year, Vectors, ...rest } = details;
          return (
            <div key={region} className="py-1">
              <span className="font-bold">
                {region} ({Year}):
              </span>
              <br />
              <span className="font-semibold"> Invasion Status: </span>{" "}
              {rest["Invasion Status"]}
              <br />
              <span className="font-semibold"> Population Status: </span>{" "}
              {rest["Population Status"]}
              <br />
              <span className="font-semibold"> Vectors: </span> {Vectors}
            </div>
          );
        }
      );

      setSpeciesFormatedRegionalInfoB(bodyB);
    }
  }, [selectedSpeciesARegionalInfo, selectedSpeciesBRegionalInfo]);

  const handleButtonClick = () => {
    if (selectedSpeciesAInfo && selectedSpeciesBInfo) {
      // TODO: Trigger map generation with selected species
      console.log("Generating map for species:", selectedSpeciesA, selectedSpeciesB);
      setNemesisLinkA(
        <a
          href={
            "https://invasions.si.edu/nemesis/species_summary/" +
            selectedSpeciesAInfo["Species Nemesis ID"]
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Nemesis page ({selectedSpeciesAInfo["Species Name"]})
        </a>
      );
      setNemesisLinkB(
        <a
          href={
            "https://invasions.si.edu/nemesis/species_summary/" +
            selectedSpeciesBInfo["Species Nemesis ID"]
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Nemesis page ({selectedSpeciesBInfo["Species Name"]})
        </a>
      );
      onSpeciesSelect(selectedSpeciesAInfo); //set to species id
      onSpeciesSelectB(selectedSpeciesBInfo); //set to species id

      setIsSidebarVisible(true); // Show sidebar when a species is selected
      setShowSpeciesDetail(true); // Populate sidebar with species' detail when a species is selected
      showingSpeciesDetail(true); // For communicating with timeline that species is selected
    } else {
      alert("Please select a species.");
    }
  };

  const selectedSpeciesAInfo = speciesData.find(
    (species) => species["Species Nemesis ID"] === selectedSpeciesA
  );
  const selectedSpeciesBInfo = speciesData.find(
    (species) => species["Species Nemesis ID"] === selectedSpeciesB
  );

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
            setSpeciesData(results.data);
            console.log(results);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV file:", error));
  }, []);

  return (
    <div>
      {!isSidebarVisible && (
        <div className="m-2 flex flex-col">
          <div className="text-sm">Select species 1:</div>

          <select
            className="select focus:outline-none outline-none select-xs w-full select-secondary rounded-md text-xs"
            onChange={handleSpeciesAChange}
          >
            <option disabled selected>
              Select a species
            </option>
            {speciesData.sort((a,b) =>
              a["Species Name"].localeCompare(b["Species Name"])
              )
            .map((species, index) => (
              <option key={index} value={species["Species Nemesis ID"]}>
                {species["Species Name"]}
              </option>
            ))}
          </select>

          <div className="text-sm mt-4">Select species 2:</div>
          <select
            className="select focus:outline-none outline-none select-xs w-full select-secondary rounded-md text-xs"
            onChange={handleSpeciesBChange}
          >
            <option disabled selected>
              Select a species
            </option>
            {speciesData.sort((a,b) =>
              a["Species Name"].localeCompare(b["Species Name"])
              )
            .map((species, index) => (
              <option key={index} value={species["Species Nemesis ID"]}>
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
      {isSidebarVisible && selectedSpeciesAInfo && selectedSpeciesBInfo && (
        <div className="flex flex-col p-2 w-full">
          <div className="flex gap-x-2 flex-row w-full border- border-blue-200">
            <div className="border- flex flex-col w-1/2 p-2 border-primary">
              <h2 className="text-sm font-semibold">
                {selectedSpeciesAInfo["Species Name"]}
              </h2>
              <p className="text-sm mt-2">
                {selectedSpeciesAInfo["Species Description"]}
              </p>
              <img
                src={selectedSpeciesAInfo["Species Img"]}
                alt={selectedSpeciesAInfo["Species Name"]}
                className="w-full h-auto"
              />
            </div>
            {/* <div className="items-center justify-center align-middle bg-slate-100">
              <hr className="h-32 border-l w-fit bg-red-600 border-primary"></hr>
            </div> */}
            <div className="bg-primary w-0.5"></div>
            <div className="flex flex-col w-1/2 p-2 border-">
              <h2 className="text-sm font-semibold">
                {selectedSpeciesBInfo["Species Name"]}
              </h2>
              <p className="text-sm mt-2">
                {selectedSpeciesBInfo["Species Description"]}
              </p>
              <img
                src={selectedSpeciesBInfo["Species Img"]}
                alt={selectedSpeciesBInfo["Species Name"]}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Add more species details */}
          <CollapsibleSection
            title={`First records for ${selectedSpeciesAInfo["Species Name"]}:`}
            body={speciesFormatedRegionalInfoA}
          />
          <CollapsibleSection
            title={`First records for ${selectedSpeciesBInfo["Species Name"]}:`}
            body={speciesFormatedRegionalInfoB}
          />
          {/* <CollapsibleSection title="Classification:" body="Classification" /> */}
          <CollapsibleSection
            title="More details:"
            body={
              <div><p>{nemesisLinkA}</p> <p>{nemesisLinkB}</p></div>
            }
            bodyStyle="text-primary"
          />
          <button
            className="mt-4 btn btn-sm btn-secondary"
            onClick={() => {
              setIsSidebarVisible(false)
              setShowSpeciesDetail(false);
              showingSpeciesDetail(false);
              onSpeciesSelect(null);
              onSpeciesSelectB(null);
              setSelectedSpeciesA(null);
              setSelectedSpeciesB(null);   // clear this component's selection
            }} // Close the sidebar
          >
            Review new species
          </button>
        </div>
      )}
    </div>
  );
}

export default MultipleSpeciesSelection;
