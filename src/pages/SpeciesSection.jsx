import { useEffect, useState } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Timeline from "../components/Timeline";
import Papa from "papaparse";
import MapSection from "../components/MapSection";

export default function SpeciesSection() {
  // States for sidebar
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedSpeciesInfo, setSelectedSpeciesInfo] = useState(null);
  const [speciesRegions, setSpeciesRegions] = useState([]);
  const [pastSpeciesRegions, setPastSpeciesRegions] = useState(new Set());

  // Nemesis Data
  const [NAET1Data, setNAET1Data] = useState(null);
  const [NAET2Data, setNAET2Data] = useState(null);
  const [NAET3Data, setNAET3Data] = useState(null);

  const [NAET1SpeciesInfo, setNAET1SpeciesInfo] = useState(null);
  const [NAET2SpeciesInfo, setNAET2SpeciesInfo] = useState(null);
  const [NAET3SpeciesInfo, setNAET3SpeciesInfo] = useState(null);
  const [nemesisRegionNames, setNemesisRegionNames] = useState([]);
  const [nemesisRegionMap, setNemesisRegionMap] = useState({});

  // RAS Data
  // TODO3, change ras to all sentence case
  const [rasSiteLocData, setRasSiteLocData] = useState(null);
  const [ras2019SurveyData, setRas2019SurveyData] = useState(null);
  const [allYearRasData, setAllYearRasData] = useState([]); // {year: [record1, record2]}
  const [speciesRasData, setSpeciesRasData] = useState([]);

  // Store info abt speciifc sites
  const [currYearSiteData, setCurrYearSiteData] = useState([]) // {"RAS": [record1, record2], "Nemesis": [record3]}

  // States for map/timeline
  const [allYears, setAllYears] = useState(false);
  const [showingSpeciesDetail, setShowingSpeciesDetail] = useState(false);
  const [allYearRegionDetail, setAllYearRegionDetail] = useState({});
  const [currYearDetail, setCurrYearDetail] = useState([]);
  const [allYearRegionMap, setAllYearRegionMap] = useState({});
  const [regionYearMap, setRegionYearMap] = useState({
    "NA-ET1": [],
    "NA-ET2": [],
    "NA-ET3": [],
  });
  const [allYearNemesisSiteData, setAllYearNemesisSiteData] = useState([]); // {year: [record1, record2]}

  const [speciesYears, setSpeciesYears] = useState([]);
  const [newYear, setNewYear] = useState(null);

  // extract data from the csv file for regions NA-ET1, Na-ET2, and Na-ET3
  function extractFromRegionsCSV(csvPath, setRegionsData) {
    fetch(csvPath)
      .then((response) => response.text())
      .then((csvData) => {
        // Parse the CSV data
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setRegionsData(results.data);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV file:", error));
  }

  // Fetch the CSV file for species
  useEffect(() => {
    extractFromRegionsCSV("/data/nemesisNAET1.csv", setNAET1SpeciesInfo);
    extractFromRegionsCSV("/data/nemesisNAET2.csv", setNAET2SpeciesInfo);
    extractFromRegionsCSV("/data/nemesisNAET3.csv", setNAET3SpeciesInfo);
  }, []);

  // extract data from the csv file for regions NA-ET1, Na-ET2, and Na-ET3

  // CHANGE extract from NAET1SourcesWithLatLong instead of nemesisSpeciesWithBaysNAET1.csv
  useEffect(() => {
    extractFromRegionsCSV("/data/NAET1SourcesWithLatLong.csv", setNAET1Data);
    extractFromRegionsCSV("/data/NAET2SourcesWithLatLong.csv", setNAET2Data);
    extractFromRegionsCSV("/data/NAET3SourcesWithLatLong.csv", setNAET3Data);

    extractFromRegionsCSV("/RAS data/ras2019Sites.csv", setRasSiteLocData);
    extractFromRegionsCSV("/RAS data/ras2019Survey.csv", setRas2019SurveyData);
    extractFromRegionsCSV(
      "/descriptions/nemesisRegionName.csv",
      setNemesisRegionNames
    );
  }, []);

  // Set nemesis region:name map
  useEffect(() => {
    let regionNameMap = {};
    nemesisRegionNames.forEach((region) => {
      regionNameMap[region["Code"]] = region["Region Name"];
    });
    setNemesisRegionMap(regionNameMap);
  }, [nemesisRegionNames]);

  // Use the species name, filter from the smaller region files
  // TODO2: split up general region data cleaning and ras/specific site data cleaning
  useEffect(() => {
    if (selectedSpecies) {
      // ----------------------------------------------------------------//
      // Functions to filter data based on species name or RAS Site Code //
      // ----------------------------------------------------------------//
      // Filter the data from NAET1Data, NAET2Data, NAET3Data based on selectedSpecies
      const filterBySpeciesID = (data) => {
        return data
          ? data.filter(
              (item) => item.SpeciesID === selectedSpecies["Species Nemesis ID"]
            )
          : [];
      };
      const filterBySpeciesName = (data) => {
        return data
          ? data.filter((item) => item.Name === selectedSpecies["Species Name"])
          : [];
      };
      // Filter the RAS data based on selectedSpecies name
      const filterRASBySpecies = (data, selectedGenus, selectedSpecies) => {
        return data.filter(
          (item) =>
            item.Species.trim() === selectedSpecies &&
            item.Genus.trim() === selectedGenus
        );
      };
      const filterRASBySite = (data, siteCodes) => {
        return data.filter((item) => siteCodes.includes(item["Site Code"]));
      };

      // --------------------------------------------//
      // Working with RAS species specific site data //
      // --------------------------------------------//
      // Update species' sites base on RAS data
      const filteredRAS = filterRASBySpecies(
        ras2019SurveyData,
        selectedSpecies["RAS Genus Name"],
        selectedSpecies["RAS Species Name"]
      )[0];

      // TODO3 dk if i need a temp?
      let tempSpeciesRASData = [];

      Object.keys(filteredRAS).forEach((key) => {
        filteredRAS[key] === "x" ? tempSpeciesRASData.push(key) : null;
      });

      // console.log("rasSiteLocData", rasSiteLocData);
      // console.log("tempSpeciesRASData", tempSpeciesRASData);

      const filteredRASSite = filterRASBySite(
        rasSiteLocData,
        tempSpeciesRASData
      );

      let tempAllYearRasData = {};

      tempAllYearRasData["2019"] = filteredRASSite;
      tempAllYearRasData["all years"] = filteredRASSite;
      setAllYearRasData(tempAllYearRasData);

      // --------------------------------------------------------//
      // Working with Nemesis species specific first record info //
      // --------------------------------------------------------//
      // Set first record info abt species in each region
      const filteredNAET1Species = filterBySpeciesName(NAET1SpeciesInfo);
      const filteredNAET2Species = filterBySpeciesName(NAET2SpeciesInfo);
      const filteredNAET3Species = filterBySpeciesName(NAET3SpeciesInfo);
      const regionSpeciesData = {};

      if (filteredNAET1Species[0]) {
        regionSpeciesData["NA-ET1"] = filteredNAET1Species[0];
      }
      if (filteredNAET2Species[0]) {
        regionSpeciesData["NA-ET2"] = filteredNAET2Species[0];
      }
      if (filteredNAET3Species[0]) {
        regionSpeciesData["NA-ET3"] = filteredNAET3Species[0];
      }
      setSelectedSpeciesInfo(regionSpeciesData);

      // ----------------------------------------------------//
      // Working with Nemesis species specific location data //
      // ----------------------------------------------------//
      const filteredNAET1 = filterBySpeciesID(NAET1Data);
      const filteredNAET2 = filterBySpeciesID(NAET2Data);
      const filteredNAET3 = filterBySpeciesID(NAET3Data);

      const yearRegionMap = {};
      yearRegionMap["all years"] = new Set();
      const yearRegionDetails = {};
      // {"NA-ET1": {}, "NA-ET2": {}, "NA-ET3": {}};
      yearRegionDetails["all years"] = {
        "NA-ET1": [],
        "NA-ET2": [],
        "NA-ET3": [],
      };

      // Loops through the regions info and add year: region pairs
      const addYearRegion = (region, data) => {
        data.forEach((record) => {
          const currYear =
            !Number.isNaN(record.Date) &&
            Number(record.Date) >= 1800 &&
            Number(record.Date <= 2030)
              ? record.Date
              : "Unknown Date";
          if (currYear in yearRegionMap) {
            yearRegionMap[currYear].add(region);
            if (region in yearRegionDetails[currYear])
              yearRegionDetails[currYear][region].push(record);
            else yearRegionDetails[currYear][region] = [record];
          } else if (currYear != "Unknown Date") {
            yearRegionMap[currYear] = new Set([region]);
            yearRegionDetails[currYear] = { [region]: [record] };
          }
          yearRegionMap["all years"].add(region);
          yearRegionDetails["all years"][region].push[record];
        });
      };

      // If there exists data for the species in a region, add info
      // from the region to the yearRegionMap
      if (filteredNAET1[0]) {
        addYearRegion("NA-ET1", filteredNAET1);
      }
      if (filteredNAET2[0]) {
        addYearRegion("NA-ET2", filteredNAET2);
      }
      if (filteredNAET3[0]) {
        addYearRegion("NA-ET3", filteredNAET3);
      }

      // Create map in the form region: years
      Object.entries(yearRegionMap).forEach(([year, regions]) => {
        regions.forEach((region) => {
          if (year != "all years") {
            regionYearMap[region].push(year);
          }
        });
      });
      setAllYearRegionDetail(yearRegionDetails);

      // convert sets back to lists
      Object.keys(yearRegionMap).forEach((key) => {
        yearRegionMap[key] = Array.from(yearRegionMap[key]);
      });

      // Extract years from the filtered data
      const years = Object.keys(yearRegionMap).filter(
        (key) => key !== "all years"
      );
      setSpeciesYears(years);
      setNewYear(years[0]);

      setAllYearRegionMap(yearRegionMap);
      setSpeciesRegions(yearRegionMap[years[0]]);

      // Adding lat and long from source sites
      const tempAllYearNemesisSiteData = {};
      const extractYearsWithGeoloc = (yearRegionDetails) => {
        Object.entries(yearRegionDetails).forEach(([year, regions]) => {
          Object.entries(regions).forEach(([region, records]) => {
            if (region == "NA-ET1" || region == "NA-ET2") {
              console.log(records);
              records.forEach((record) => {
                if (record["Latitude"]) {
                  tempAllYearNemesisSiteData[year]
                    ? tempAllYearNemesisSiteData[year].push(record)
                    : (tempAllYearNemesisSiteData[year] = [record]);
                }
              });
            }
          });
        });
      };

      extractYearsWithGeoloc(yearRegionDetails);
      setAllYearNemesisSiteData(tempAllYearNemesisSiteData);
    }
  }, [selectedSpecies]);

  
  // Depending on the selected year, update the pastSpeciesRegions and current speciesRegions
  useEffect(() => {
    const pastSpeciesRegionsList = [];
    Object.keys(allYearRegionMap).forEach((key) => {
      key < newYear ? pastSpeciesRegionsList.push(allYearRegionMap[key]) : null;
    });
    setPastSpeciesRegions(new Set(pastSpeciesRegionsList.flat()));
    setSpeciesRegions([allYearRegionMap[newYear]]);

    if (allYearRegionDetail[newYear]) {
      setCurrYearDetail(allYearRegionDetail[newYear]);
    }



    // if (newYear in allYearRasData) setSpeciesRasData(allYearRasData[newYear]);
    // else setSpeciesRasData([]);

    const tempCurrYearSiteData = {};

    if (newYear in allYearRasData) {
      tempCurrYearSiteData["rasSites"] = (allYearRasData[newYear]);
    }

    if (newYear in allYearNemesisSiteData) {
      tempCurrYearSiteData["nemesisSpecificSites"] = (allYearNemesisSiteData[newYear]);
    }

    setCurrYearSiteData(tempCurrYearSiteData);
    console.log("currYearSiteData", currYearSiteData);
    if (newYear == "all years") {
      setAllYears(true);
      setCurrYearDetail(regionYearMap);
    } else setAllYears(false);
  }, [newYear]);

  return (
    <div className="flex flex-row flex-grow overflow-hidden h-full w-full">
      <Sidebar
        selectedSpeciesInfo={selectedSpeciesInfo}
        onSpeciesSelect={setSelectedSpecies}
        showingSpeciesDetail={setShowingSpeciesDetail}
        nemesisRegionNames={nemesisRegionMap}
      />
      <MapSection
        allYears={allYears}
        currSpeciesRegions={speciesRegions}
        pastSpeciesRegions={pastSpeciesRegions}
        regionsDetail={currYearDetail}
        speciesYears={speciesYears}
        allYearRegionMap={allYearRegionMap}
        setNewYear={setNewYear}
        showTimeline={showingSpeciesDetail}
        currSites={currYearSiteData}
        nemesisRegionNames={nemesisRegionMap}
      />
    </div>
  );
}
