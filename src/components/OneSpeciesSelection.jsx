import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { IoIosArrowDown } from "react-icons/io";
import CollapsibleSection from "./CollapsibleSection";
import { use } from "react";

function OneSpeciesSelection({
  selectedSpeciesRegionalInfo,
  onSpeciesSelect,
  showingSpeciesDetail,
  nemesisRegionNames,
}) {
  const [speciesData, setSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [showSpeciesDetail, setShowSpeciesDetail] = useState(false); // Track sidebar visibility
  const [speciesFormatedRegionalInfo, setSpeciesFormatedRegionalInfo] =
    useState("");

  const [nemesisLink, setNemesisLink] = useState("");
  const handleSpeciesChange = (event) => {
    setSelectedSpecies(event.target.value);
  };

  useEffect(() => {
    // console.log("selectedSpeciesRegionalInfo updated:");
    console.log("nemesisRegionNames");
    console.log(nemesisRegionNames);
    if (selectedSpeciesRegionalInfo) {
      let body = Object.entries(selectedSpeciesRegionalInfo[0]).map(
        ([region, details]) => {
          const { Year, Vectors, ...rest } = details;
          return (
            <div key={region} className="py-1">
              <span className="font-bold">
                {nemesisRegionNames[region]} ({Year}):
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
      setSpeciesFormatedRegionalInfo(body);
    }
  }, [selectedSpeciesRegionalInfo]);

  const handleButtonClick = () => {
    if (selectedSpeciesInfo) {
      // onSpeciesSelect(selectedSpecies); set to species name
      setNemesisLink(
        <a
          href={
            "https://invasions.si.edu/nemesis/species_summary/" +
            selectedSpeciesInfo["Species Nemesis ID"]
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Nemesis page
        </a>
      );
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

  // reat the nemesis species info csv
  useEffect(() => {
    fetch("/descriptions/nemesisSpeciesInfo.csv")
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setSpeciesData(results.data);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV file:", error));
  }, []);

  const formattedCollapsible = (() => {
    if (!selectedSpeciesRegionalInfo) {
      return;
    }
    {/* <CollapsibleSection title="Classification:" body="Classification" /> */}
    if (selectedSpeciesRegionalInfo[1]) {
      return (
        <>
        <CollapsibleSection
          title="First records:"
          body={speciesFormatedRegionalInfo}
        />
        
        <CollapsibleSection
          title="More details:"
          body={nemesisLink}
          bodyStyle="text-primary"
        />
        </>
      )
    } else if (!selectedSpeciesRegionalInfo[1]) {
      return (
        <>
        <CollapsibleSection
          title="First records:"
          body={
          <>
            {selectedSpeciesRegionalInfo[0][0]["First records"]}
          </>
        }
        />
        
        <CollapsibleSection
          title="More details:"
          body={selectedSpeciesRegionalInfo[0][0]["More details"]}
          // bodyStyle="text-primary"
        />
        </>
      )
    }
  });

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
            {speciesData.sort((a,b) =>
              a["Species Name"].localeCompare(b["Species Name"])
              )
              .map((species, index) => (
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

          {formattedCollapsible()}

          <button
            className="mt-4 btn btn-sm btn-secondary"
            onClick={() => {
              setShowSpeciesDetail(false);
              showingSpeciesDetail(false);
              onSpeciesSelect(null);
              setSelectedSpecies(null);   // clear this component's selection
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
