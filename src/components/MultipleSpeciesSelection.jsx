import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import CollapsibleSection from "./CollapsibleSection";

/**
 * Component for selecting and displaying information about multiple species.
 *
 * @param {Object} props - Component props
 * @param {Object} props.selectedSpeciesARegionalInfo - Regional info for species A
 * @param {Object} props.selectedSpeciesBRegionalInfo - Regional info for species B
 * @param {Function} props.onSpeciesSelect - Callback when species A is selected
 * @param {Function} props.onSpeciesSelectB - Callback when species B is selected
 * @param {Function} props.showingSpeciesDetail - Callback to indicate if species detail is shown
 * @param {Object} props.nemesisRegionNames - Mapping of region codes to region names
 * @returns {JSX.Element} - Rendered component
 */
function MultipleSpeciesSelection({
    selectedSpeciesARegionalInfo,
    selectedSpeciesBRegionalInfo,
    onSpeciesSelect,
    onSpeciesSelectB,
    showingSpeciesDetail,
    nemesisRegionNames,
  }) {
  const [speciesData, setSpeciesData] = useState([]);
  const [selectedSpeciesA, setSelectedSpeciesA] = useState(null);
  const [selectedSpeciesB, setSelectedSpeciesB] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Track sidebar visibility
  const [speciesFormattedRegionalInfoA, setSpeciesFormattedRegionalInfoA] =
    useState("");
  const [speciesFormattedRegionalInfoB, setSpeciesFormattedRegionalInfoB] =
    useState("");
  const [speciesFormattedOccA, setSpeciesFormattedOccA] =
    useState("");
  const [speciesFormattedOccB, setSpeciesFormattedOccB] =
    useState("");

  const [nemesisLinkA, setNemesisLinkA] = useState("");
  const [nemesisLinkB, setNemesisLinkB] = useState("");

  const [WoRMSLinkA, setWoRMSLinkA] = useState("")
  const [WoRMSLinkB, setWoRMSLinkB] = useState("")


  // Functions to handle species selection
  const handleSpeciesAChange = (event) => {
    console.log("Selected species A:", event.target.value);
    setSelectedSpeciesA(event.target.value);
  };

  const handleSpeciesBChange = (event) => {
    console.log("Selected species B:", event.target.value);
    setSelectedSpeciesB(event.target.value);
  };

  /**
   * helper function to create body content from regional info
   * @param {*} regionalInfo the regional info object
   * @param {*} nemesisRegionNames mapping of region codes to region names
   * @param {*} setSpeciesFormattedRegionalInfo a callback to set the formatted regional info state
   * @param {*} setSpeciesFormattedOcc a callback to set the formatted occurrence state
   * @returns JSX body content
   */
  function createBodyFromRegionalInfo(regionalInfo, nemesisRegionNames, setSpeciesFormattedRegionalInfo, setSpeciesFormattedOcc) {
    if (regionalInfo[1]) {
      let body = Object.entries(regionalInfo[0]).map(
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
      setSpeciesFormattedRegionalInfo(body);
    } else {
      let body = Object.entries(regionalInfo[0]).map(
        (row) => {
          return (
            <div className="py-1">
              <span className="font-bold">
                {row[1]['Region']}:
              </span>
              <br />
              <span className="font-semibold"> Introduction Origin: </span>{" "}
              {row[1]["Introduction Origin"] || "Unknown"}
              <br />
              <span className="font-semibold"> Invasiveness: </span>{" "}
              {row[1]["Invasiveness"] || "Unknown"}
              <br />
              <span className="font-semibold"> Occurrence: </span>{" "}
              {row[1]["Occurrence"] || "Unknown"}
              <br />
              <span className="font-semibold"> Quality: </span>{" "}
              {row[1]["Quality"]}
            </div>
          );
        }
      );
      if (Object.keys(regionalInfo[0]).length === 0) {
        body = "No data"
      }
      setSpeciesFormattedOcc(body);
    }
  }

  // Update formatted regional info on sidebar when selected species info changes
  useEffect(() => {
    if (!selectedSpeciesARegionalInfo || !selectedSpeciesBRegionalInfo){
      return;
    }
    console.log("selectedSpeciesARegionalInfo:", selectedSpeciesARegionalInfo);
    console.log("selectedSpeciesBRegionalInfo:", selectedSpeciesBRegionalInfo);
    createBodyFromRegionalInfo(
      selectedSpeciesARegionalInfo,
      nemesisRegionNames,
      setSpeciesFormattedRegionalInfoA,
      setSpeciesFormattedOccA
    );
    createBodyFromRegionalInfo(
      selectedSpeciesBRegionalInfo,
      nemesisRegionNames,
      setSpeciesFormattedRegionalInfoB,
      setSpeciesFormattedOccB
    );
  }, [selectedSpeciesARegionalInfo, selectedSpeciesBRegionalInfo]);


  /**
   * Handles the button click to generate the map and show species details.
   * includes setting links to Nemesis and WoRMS pages
   * @returns {void}
   */
  const handleButtonClick = () => {
    if (selectedSpeciesAInfo && selectedSpeciesBInfo) {
      // TODO: Trigger map generation with selected species
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
      setWoRMSLinkA(
        <a
          href={
            selectedSpeciesAInfo["WoRMS URL"]
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          WoRMS page ({selectedSpeciesAInfo["Species Name"]})
        </a>
      )
      setWoRMSLinkB(
        <a
          href={
            selectedSpeciesBInfo["WoRMS URL"]
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          WoRMS page ({selectedSpeciesBInfo["Species Name"]})
        </a>
      )

      // use callbacks to give selected species info to parent component
      onSpeciesSelect(selectedSpeciesAInfo);
      onSpeciesSelectB(selectedSpeciesBInfo);
      console.log("Selected species A:", selectedSpeciesAInfo);
      console.log("Selected species B:", selectedSpeciesBInfo);

      setIsSidebarVisible(true); // Show sidebar when a species is selected
      showingSpeciesDetail(true); // For communicating with timeline that species is selected
    } else {
      alert("Please select a species.");
    }
  };

  // Filter for the two selected species nemesis descriptions based on their IDs
  const selectedSpeciesAInfo = speciesData.find(
    (species) => species["Species OBIS ID"] === selectedSpeciesA
  );
  const selectedSpeciesBInfo = speciesData.find(
    (species) => species["Species OBIS ID"] === selectedSpeciesB
  );

  // Fetches nemesis description for all species from csv on component mount
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
            // console.log(results);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV file:", error));
  }, []);

  /**
   * Formats the collapsible sections for the sidebar when multiple species are selected
   *
   * @returns {JSX.Element} - Formatted collapsible sections
   */
  const formattedCollapsible = (() => {
    if (!selectedSpeciesARegionalInfo || !selectedSpeciesBRegionalInfo) {
      return;
    }
    let firstRecordsFormattedA = (
      <CollapsibleSection
        title={`First records for ${selectedSpeciesAInfo["Species Name"]}:`}
        body={speciesFormattedRegionalInfoA}
      />
    );
    let firstRecordsFormattedB = (
      <CollapsibleSection
        title={`First records for ${selectedSpeciesBInfo["Species Name"]}:`}
        body={speciesFormattedRegionalInfoB}
      />
    );

    let moreDetailsFormattedA = nemesisLinkA;
    let moreDetailsFormattedB = nemesisLinkB;

    if (!selectedSpeciesARegionalInfo[1]) {
      firstRecordsFormattedA = (
        <CollapsibleSection
          title={`Occurences for ${selectedSpeciesAInfo["Species Name"]}:`}
          body={
          <>
            {speciesFormattedOccA}
          </>
        }
        />
      );
      moreDetailsFormattedA = WoRMSLinkA;
    }

    if (!selectedSpeciesBRegionalInfo[1]) {
      firstRecordsFormattedB = (
        <CollapsibleSection
          title={`Occurences for ${selectedSpeciesBInfo["Species Name"]}:`}
          body={
          <>
            {speciesFormattedOccB}
          </>
        }
        />
      );
      moreDetailsFormattedB = WoRMSLinkB;
    }

    return (
      <>
        {/* Add more species details */}
        {firstRecordsFormattedA}
        {firstRecordsFormattedB}
        {/* <CollapsibleSection title="Classification:" body="Classification" /> */}
        <CollapsibleSection
          title="More details:"
          body={
            <div>
              <p>{moreDetailsFormattedA}</p>
              <p>{moreDetailsFormattedB}</p>
            </div>
          }
          bodyStyle="text-primary"
        />
      </>
    )
  });

  return (
    <div>
      {!isSidebarVisible && (
        <div className="m-2 flex flex-col">
          <div className="text-sm">Select species 1 (circle):</div>

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
              <option key={index} value={species["Species OBIS ID"]}>
                {species["Species Name"]}
              </option>
            ))}
          </select>

          <div className="text-sm mt-4">Select species 2 (triangle):</div>
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
              <option key={index} value={species["Species OBIS ID"]}>
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
              <p className="text-sm mt-2">(circle)</p>
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
              <p className="text-sm mt-2">(triangle)</p>
            </div>
          </div>

          {formattedCollapsible()}
          <button
            className="mt-4 btn btn-sm btn-secondary"
            onClick={() => {
              setIsSidebarVisible(false)
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
