import React, { useEffect, useState } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Timeline from "../components/Timeline";
import Papa from "papaparse";
import MapSection from "../components/MapSection";
import useFetchObisData from "../dataProcessing/useFetchObisData";
import useNemesisData from "../dataProcessing/useNemesisData";
import useRASData from "../dataProcessing/useRASData";
import { use } from "react";

export default function SpeciesSection() {
  // States for sidebar
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedSpeciesInfo, setSelectedSpeciesInfo] = useState(null);
  const [expandSide, setExpandSide] = useState(true);
  const [speciesRegions, setSpeciesRegions] = useState([]);
  const [pastSpeciesRegions, setPastSpeciesRegions] = useState(new Set());
  const [pastSpeciesRegionsB, setPastSpeciesRegionsB] = useState(new Set());

  const [selectedSpeciesB, setSelectedSpeciesB] = useState(null);
  const [selectedSpeciesBInfo, setSelectedSpeciesBInfo] = useState(null);

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
  const [allYearRasData, setAllYearRasData] = useState([]); // {year: [record1, record2]}
  const [allYearRasDataB, setAllYearRasDataB] = useState([]); // need seperate state for species B

  // OBIS Data
  const [allYearObisSiteData, setAllYearObisSiteData] = useState([]); // {year: [record1, record2]}
  const [allYearObisSiteDataB, setAllYearObisSiteDataB] = useState([]); // need seperate state for species B

  // Store info abt speciifc sites
  const [currYearSiteData, setCurrYearSiteData] = useState([]); // {"RAS": [record1, record2], "Nemesis": [record3]}
  const [currYearSiteDataB, setCurrYearSiteDataB] = useState([]); // {"RAS": [record1, record2], "Nemesis": [record3]}

  // States for map/timeline
  const [allYears, setAllYears] = useState(false);
  const [showingSpeciesDetail, setShowingSpeciesDetail] = useState(false);
  const [allYearRegionDetail, setAllYearRegionDetail] = useState({});
  const [allYearRegionDetailB, setAllYearRegionDetailB] = useState({});
  const [currYearDetail, setCurrYearDetail] = useState([]);
  const [currYearDetailB, setCurrYearDetailB] = useState([]);
  const [allYearRegionMap, setAllYearRegionMap] = useState({});
  const [allYearRegionMapB, setAllYearRegionMapB] = useState({});
  const [regionYearMap, setRegionYearMap] = useState({
    "NA-ET1": [],
    "NA-ET2": [],
    "NA-ET3": [],
  });
  const [allYearNemesisSiteData, setAllYearNemesisSiteData] = useState([]); // {year: [record1, record2]}
  const [allYearNemesisSiteDataB, setAllYearNemesisSiteDataB] = useState([]); // need seperate state for species B

  const [speciesYears, setSpeciesYears] = useState([]);
  const [newYear, setNewYear] = useState(null);

  // fetch OBIS data
  // const speciesName = selectedSpecies ? selectedSpecies["Species Name"] : null;
  console.log("trying to fetch OBIS data for", selectedSpecies, selectedSpeciesB);
  const { combinedOBISData, combinedOBISDataB } =
    useFetchObisData(selectedSpecies, selectedSpeciesB);

  // should only have data for the selected species
  console.log("GOT combinedOBISData for selectedSpecies", combinedOBISData);
  console.log("GOT combinedOBISDataB for selectedSpeciesB", combinedOBISDataB);

  // fetch nemesis data
  console.log("running useNemesisData with", selectedSpecies);
  const { nemesisRegionData } =
    useNemesisData(selectedSpecies);

  // should have all nemesis data for all species
  console.log("GOT combinedNemesisData", nemesisRegionData);

  // fetch RAS data
  console.log("running useRASData with", selectedSpecies);
  const { RASRegionData } =
    useRASData(selectedSpecies);
  console.log("GOT combinedRASData", RASRegionData);


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

  const filterBySpeciesIDB = (data) => {
    return data
      ? data.filter(
          (item) => item.SpeciesID === selectedSpeciesB["Species Nemesis ID"]
        )
      : [];
  };

  const filterBySpeciesName = (data) => {
    return data
      ? data.filter((item) => item.Name === selectedSpecies["Species Name"])
      : [];
  };

  const filterBySpeciesNameB = (data) => {
    return data
      ? data.filter((item) => item.Name === selectedSpeciesB["Species Name"])
      : [];
  };

  // check if two species names are the same (ignores abbreviations)
  const checkSameSpecies = (speciesName, selectedSpecies) => {
    const speciesWords = selectedSpecies.toLowerCase().split(" ");
    for (const word of speciesWords) {
      if (!word.includes(".") && !speciesName.toLowerCase().includes(word)) {
        return false;
      }
    }
    return true;
  };

  // Filter the RAS data based on selectedSpecies name
  const filterRASBySpecies = (data, selectedSpecies) => {
    return data.filter(
      (item) => checkSameSpecies(item.SpeciesName, selectedSpecies)
    );
  };

  // function to extract year
  const extractYear = (rawDate) => {
    if (!rawDate) return "Unknown Date";
    // takes last part of mm/dd/yyyy
    let extractedYear = rawDate;
    if (rawDate.includes("/")) {
      const parts = rawDate.split("/");
      extractedYear = parts[parts.length - 1];
    } else {
      extractedYear = rawDate; // if already just a year
    }

    const yearNum = Number(extractedYear);
    const currYear =
      (!isNaN(yearNum) &&
      yearNum >= 1800 &&
      yearNum <= 2030)
        ? String(yearNum)
        : "Unknown Date";
    return currYear
  };

  // Adding lat and long from source sites
  const extractYearsWithGeoloc = (yearRegionDetails) => {
    const allYearSiteData = { "all years": [] };
    Object.entries(yearRegionDetails).forEach(([year, regions]) => {
      Object.entries(regions).forEach(([region, records]) => {
        records.forEach((record) => {
          if (record["Latitude"]) {
            const latitude = record["Latitude"];
            const longitude = record["Longitude"];
            const formattedRecord = { ...record };

            let site = null;
            try {
              site = formattedRecord["Site Location"];
              site = site.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            } catch {
              site = formattedRecord["SiteLocation"];
            }
            
            formattedRecord["Site Location"] = site;

            if (
              latitude < 48 &&
              latitude > 35 &&
              longitude < -55 &&
              longitude > -78
            ) {
              allYearSiteData[year]
                ? allYearSiteData[year].push(formattedRecord)
                : (allYearSiteData[year] = [formattedRecord]);
              allYearSiteData["all years"].push(formattedRecord);
            }
            else {
              console.log(
                "RECORD",
                record,
                "latitude",
                latitude,
                "longitude",
                longitude
              );
            }
          }
        });
      });
    });
    return allYearSiteData
  };

  // organizes by year and region
  const addYearRegion = (region, data, yearRegionMap, yearRegionDetails) => {
    console.log("region", region, "data", data);
    data.forEach((record) => {
      const currYear = extractYear(record.Date)
      // console.log("currYear", currYear);
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
      yearRegionDetails["all years"][region].push(record);
      // console.log("for year", currYear, "all year", yearRegionDetails["all years"]);
    });
  };

  // Fetch the CSV file for species
  useEffect(() => {
    extractFromRegionsCSV("/data/nemesisNAET1.csv", setNAET1SpeciesInfo);
    extractFromRegionsCSV("/data/nemesisNAET2.csv", setNAET2SpeciesInfo);
    extractFromRegionsCSV("/data/nemesisNAET3.csv", setNAET3SpeciesInfo);
  }, []);

  // extract data from the csv file for regions NA-ET1, Na-ET2, and Na-ET3
  useEffect(() => {
    extractFromRegionsCSV(
      "/descriptions/nemesisRegionName.csv",
      setNemesisRegionNames
    );
  }, []);

  useEffect(() => {
    console.log("IN useEffect for nemesisRegionData", nemesisRegionData);
    if (nemesisRegionData) {
      setNAET1Data(nemesisRegionData["NA-ET1"]);
      setNAET2Data(nemesisRegionData["NA-ET2"]);
      setNAET3Data(nemesisRegionData["NA-ET3"]);
    }
  }, [nemesisRegionData]);

  const clearData = () => {
    // clear all data related to species when none is selected
    console.log("Clearing all species data");
    setSelectedSpecies(null);
    setSelectedSpeciesInfo(null);
    setSelectedSpeciesB(null);
    setSelectedSpeciesBInfo(null);
    setSpeciesRegions([]);
    setPastSpeciesRegions(new Set());
    setPastSpeciesRegionsB(new Set());

    setAllYearRasData([]);
    setAllYearRasDataB([]);

    setAllYearObisSiteData([]);
    setAllYearObisSiteDataB([]);

    setCurrYearSiteData({});
    setCurrYearSiteDataB({});

    setAllYearRegionDetail({});
    setAllYearRegionDetailB({});
    setCurrYearDetail([]);
    setCurrYearDetailB([]);

    setAllYearRegionMap({});
    setAllYearRegionMapB({});
    setRegionYearMap({
      "NA-ET1": [],
      "NA-ET2": [],
      "NA-ET3": [],
    });
    setAllYearNemesisSiteData([]);
    setAllYearNemesisSiteDataB([]);

    setSpeciesYears([]);
    setNewYear(null);
    setAllYears(false);
    setShowingSpeciesDetail(false);
  }
  
  // clear all data related to species when none is selected
  useEffect(() => {
    if (!selectedSpecies && !selectedSpeciesB) {
      clearData();
    }
  }, [selectedSpecies, selectedSpeciesB]);

  // update Obis data
  useEffect(() => {
    console.log("OBIS data for A and B", combinedOBISData, combinedOBISDataB);

    setAllYearObisSiteData(combinedOBISData["combinedYearSiteMap"]);
    setAllYearObisSiteDataB(combinedOBISDataB["combinedYearSiteMap"]);

    // Combine combinedOBISData["combinedYearRegionMap"] with allYearRegion

    const obisRegionMap = combinedOBISData["combinedYearRegionMap"];
    setAllYearRegionMap((prevMap) => ({
      ...prevMap,
      ...obisRegionMap,
    }));

    const obisRegionMapB = combinedOBISDataB["combinedYearRegionMap"];
    setAllYearRegionMapB((prevMap) => ({
      ...prevMap,
      ...obisRegionMapB,
    }));

      // TODO: FINISH AFTER MEETING


    // Updating all the variables with bioregions to now include OBIS data
    const allYearRegionDetailWithObis = { ...allYearRegionDetail };
    const regionYearMapWithObis = { ...regionYearMap };

    console.log("ADDING OBIS DATA TO allYearRegionDetailWithObis", allYearRegionDetailWithObis);
    console.log("ADDING OBIS DATA TO regionYearMapWithObis", regionYearMapWithObis);

    for (let year in combinedOBISData["combinedYearRegionMap"]) {
      for (let region of combinedOBISData["combinedYearRegionMap"][year]) {
        if (!allYearRegionDetailWithObis[year]) {
          allYearRegionDetailWithObis[year] = {};
        }
        if (!allYearRegionDetailWithObis[year][region]) {
          allYearRegionDetailWithObis[year][region] = [];
          if (!regionYearMapWithObis[region]) {
            regionYearMapWithObis[region] = [];
          }
          regionYearMapWithObis[region].push(year);
        }
        allYearRegionDetailWithObis[year][region].push({
          RegionName: "Region undefined",
          "Source(s)": " OBIS Dataset",
        });
      }
    }

    for (let year in combinedOBISDataB["combinedYearRegionMap"]) {
      for (let region of combinedOBISDataB["combinedYearRegionMap"][year]) {
        if (!allYearRegionDetailWithObis[year]) {
          allYearRegionDetailWithObis[year] = {};
        }
        if (!allYearRegionDetailWithObis[year][region]) {
          allYearRegionDetailWithObis[year][region] = [];
          if (!regionYearMapWithObis[region]) {
            regionYearMapWithObis[region] = [];
          }
          regionYearMapWithObis[region].push(year);
        }
        allYearRegionDetailWithObis[year][region].push({
          RegionName: "Region undefined",
          "Source(s)": " OBIS Dataset B",
        });
      }
    }
    console.log("UPDATED allYearRegionDetailWithObis", allYearRegionDetailWithObis);
    console.log("UPDATED regionYearMapWithObis", regionYearMapWithObis);

    setRegionYearMap(regionYearMapWithObis);

    setAllYearRegionDetail(allYearRegionDetailWithObis);
  }, [combinedOBISData, combinedOBISDataB]);

  // Set nemesis region:name map
  useEffect(() => {
    let regionNameMap = {};
    nemesisRegionNames.forEach((region) => {
      regionNameMap[region["Code"]] = region["Region Name"];
    });
    setNemesisRegionMap(regionNameMap);
  }, [nemesisRegionNames]);

  // RAS
  useEffect(() => {
    if (selectedSpecies) {
      console.log("selected", selectedSpecies, selectedSpecies["Species Name"]);
      // --------------------------------------------//
      // Working with RAS species specific site data //
      // --------------------------------------------//

      if (Object.keys(RASRegionData).length > 0) {
        const filteredRASNAET1 = filterRASBySpecies(
          RASRegionData["NA-ET1"],
          selectedSpecies["Species Name"]
        );
        const filteredRASNAET2 = filterRASBySpecies(
          RASRegionData["NA-ET2"],
          selectedSpecies["Species Name"]
        );
        const filteredRASNAET3 = filterRASBySpecies(
          RASRegionData["NA-ET3"],
          selectedSpecies["Species Name"]
        );

        const yearRegionMap = {};
        yearRegionMap["all years"] = new Set();
        const yearRegionDetails = {};
        yearRegionDetails["all years"] = {
          "NA-ET1": [],
          "NA-ET2": [],
          "NA-ET3": [],
        };

        if (filteredRASNAET1[0]) {
          addYearRegion("NA-ET1", filteredRASNAET1, yearRegionMap, yearRegionDetails);
        }
        if (filteredRASNAET2[0]) {
          addYearRegion("NA-ET2", filteredRASNAET2, yearRegionMap, yearRegionDetails);
        }
        if (filteredRASNAET3[0]) {
          addYearRegion("NA-ET3", filteredRASNAET3, yearRegionMap, yearRegionDetails);
        }

        Object.entries(yearRegionMap).forEach(([year, regions]) => {
          regions.forEach((region) => {
            if (year != "all years") {
              regionYearMap[region].push(year);
            }
          });
        });
        const years = Object.keys(yearRegionMap).filter(
          (key) => key !== "all years"
        );

        setSpeciesYears(prevYears =>
          Array.from(new Set([...prevYears, ...years]))
            .sort((a, b) => Number(a) - Number(b))
        );
        
        setAllYearRegionMap((prevMap) => ({
          ...prevMap,
          ...yearRegionMap,
        }));

        setAllYearRasData(extractYearsWithGeoloc(yearRegionDetails))
      } 
    }
    if (selectedSpeciesB) {
      console.log("selected B", selectedSpeciesB, selectedSpeciesB["Species Name"]);
      // --------------------------------------------//
      // Working with RAS species specific site data //
      // --------------------------------------------//

      if (Object.keys(RASRegionData).length > 0) {
        const filteredRASNAET1 = filterRASBySpecies(
          RASRegionData["NA-ET1"],
          selectedSpeciesB["Species Name"]
        );
        const filteredRASNAET2 = filterRASBySpecies(
          RASRegionData["NA-ET2"],
          selectedSpeciesB["Species Name"]
        );
        const filteredRASNAET3 = filterRASBySpecies(
          RASRegionData["NA-ET3"],
          selectedSpeciesB["Species Name"]
        );

        const yearRegionMap = {};
        yearRegionMap["all years"] = new Set();
        const yearRegionDetails = {};
        yearRegionDetails["all years"] = {
          "NA-ET1": [],
          "NA-ET2": [],
          "NA-ET3": [],
        };

        if (filteredRASNAET1[0]) {
          addYearRegion("NA-ET1", filteredRASNAET1, yearRegionMap, yearRegionDetails);
        }
        if (filteredRASNAET2[0]) {
          addYearRegion("NA-ET2", filteredRASNAET2, yearRegionMap, yearRegionDetails);
        }
        if (filteredRASNAET3[0]) {
          addYearRegion("NA-ET3", filteredRASNAET3, yearRegionMap, yearRegionDetails);
        }

        Object.entries(yearRegionMap).forEach(([year, regions]) => {
          regions.forEach((region) => {
            if (year != "all years") {
              regionYearMap[region].push(year);
            }
          });
        });
        const years = Object.keys(yearRegionMap).filter(
          (key) => key !== "all years"
        );

        setSpeciesYears(prevYears =>
          Array.from(new Set([...prevYears, ...years]))
            .sort((a, b) => Number(a) - Number(b))
        );
        
        setAllYearRegionMapB((prevMap) => ({
          ...prevMap,
          ...yearRegionMap,
        }));

        setAllYearRasDataB(extractYearsWithGeoloc(yearRegionDetails))
      } 
    }
  }, [selectedSpecies, selectedSpeciesB, RASRegionData]);

  // NEMESIS
  useEffect(() => {
    console.log("NAETSpeciesInfo", NAET1SpeciesInfo, NAET2SpeciesInfo, NAET3SpeciesInfo);
    if (selectedSpecies) {
      // console.log("selectedSpecies changed to", selectedSpecies);
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
      console.log("regionSpeciesData for A", regionSpeciesData);
      setSelectedSpeciesInfo(regionSpeciesData);

      // ----------------------------------------------------//
      // Working with Nemesis species specific location data //
      // ----------------------------------------------------//
      console.log("before filter 2", NAET1Data);
      console.log("curr nemesisRegionsData", nemesisRegionData);
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
      console.log(
        "AHHH filteredNAET1",
        filteredNAET1,
        "filteredNAET2",
        filteredNAET2,
        "filteredNAET3",
        filteredNAET3
      );
      // If there exists data for the species in a region, add info
      // from the region to the yearRegionMap
      if (filteredNAET1[0]) {
        addYearRegion("NA-ET1", filteredNAET1, yearRegionMap, yearRegionDetails);
      }
      if (filteredNAET2[0]) {
        addYearRegion("NA-ET2", filteredNAET2, yearRegionMap, yearRegionDetails);
      }
      if (filteredNAET3[0]) {
        addYearRegion("NA-ET3", filteredNAET3, yearRegionMap, yearRegionDetails);
      }

      Object.entries(yearRegionMap).forEach(([year, regions]) => {
        regions.forEach((region) => {
          if (year != "all years") {
            regionYearMap[region].push(year);
          }
        });
      });

      console.log("yearRegionDetails for A", yearRegionDetails);
      setAllYearRegionDetail(yearRegionDetails);

      // console.log("***allYearRegionDetail", yearRegionDetails);
      // convert sets back to lists
      Object.keys(yearRegionMap).forEach((key) => {
        yearRegionMap[key] = Array.from(yearRegionMap[key]);
      });

      // Adding lat and long from source sites
      const tempAllYearNemesisSiteData = extractYearsWithGeoloc(yearRegionDetails);
      setAllYearNemesisSiteData(tempAllYearNemesisSiteData);
      console.log("tempAllYearNemesisSiteData", tempAllYearNemesisSiteData)

      // Extract years from the filtered data
      const years = Object.keys(yearRegionMap).filter(
        (key) => key !== "all years"
      );

      setSpeciesYears(prevYears =>
        Array.from(new Set([...prevYears, ...years]))
          .sort((a, b) => Number(a) - Number(b))
      );
      // console.log("SET YEARS NEMESIS", years)
      // console.log("NEW YEARS", speciesYears[0])
      console.log("yearRegionMap", yearRegionMap);
      setAllYearRegionMap((prevMap) => ({
        ...prevMap,
        ...yearRegionMap,
      }));
    }

    if (selectedSpeciesB) {

      console.log("selectedSpeciesB changed to", selectedSpeciesB);
      // --------------------------------------------------------//
      // Working with Nemesis species specific first record info //
      // --------------------------------------------------------//
      // Set first record info abt species in each region
      const filteredNAET1Species = filterBySpeciesNameB(NAET1SpeciesInfo);
      const filteredNAET2Species = filterBySpeciesNameB(NAET2SpeciesInfo);
      const filteredNAET3Species = filterBySpeciesNameB(NAET3SpeciesInfo);

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
      console.log("regionSpeciesData for B", regionSpeciesData);
      setSelectedSpeciesBInfo(regionSpeciesData);

      // ----------------------------------------------------//
      // Working with Nemesis species specific location data //
      // ----------------------------------------------------//
      console.log("before filter 2", NAET1Data);
      console.log("curr nemesisRegionsData", nemesisRegionData);
      const filteredNAET1 = filterBySpeciesIDB(NAET1Data);
      const filteredNAET2 = filterBySpeciesIDB(NAET2Data);
      const filteredNAET3 = filterBySpeciesIDB(NAET3Data);

      const yearRegionMap = {};
      yearRegionMap["all years"] = new Set();
      const yearRegionDetails = {};
      // {"NA-ET1": {}, "NA-ET2": {}, "NA-ET3": {}};
      yearRegionDetails["all years"] = {
        "NA-ET1": [],
        "NA-ET2": [],
        "NA-ET3": [],
      };

      console.log(
        "AHHH filteredNAET1",
        filteredNAET1,
        "filteredNAET2",
        filteredNAET2,
        "filteredNAET3",
        filteredNAET3
      );
      // If there exists data for the species in a region, add info
      // from the region to the yearRegionMap
      if (filteredNAET1[0]) {
        addYearRegion("NA-ET1", filteredNAET1, yearRegionMap, yearRegionDetails);
      }
      if (filteredNAET2[0]) {
        addYearRegion("NA-ET2", filteredNAET2, yearRegionMap, yearRegionDetails);
      }
      if (filteredNAET3[0]) {
        addYearRegion("NA-ET3", filteredNAET3, yearRegionMap, yearRegionDetails);
      }

      Object.entries(yearRegionMap).forEach(([year, regions]) => {
        regions.forEach((region) => {
          if (year != "all years") {
            regionYearMap[region].push(year);
          }
        });
      });

      console.log("yearRegionDetails for B", yearRegionDetails);
      setAllYearRegionDetailB(yearRegionDetails);

      // console.log("***allYearRegionDetail", yearRegionDetails);
      // convert sets back to lists
      Object.keys(yearRegionMap).forEach((key) => {
        yearRegionMap[key] = Array.from(yearRegionMap[key]);
      });

      // Adding lat and long from source sites
      const tempAllYearNemesisSiteData = extractYearsWithGeoloc(yearRegionDetails);
      setAllYearNemesisSiteDataB(tempAllYearNemesisSiteData);
      console.log("tempAllYearNemesisSiteData", tempAllYearNemesisSiteData)

      // Extract years from the filtered data
      const years = Object.keys(yearRegionMap).filter(
        (key) => key !== "all years"
      );

      setSpeciesYears(prevYears =>
        Array.from(new Set([...prevYears, ...years]))
          .sort((a, b) => Number(a) - Number(b))
      );
      // console.log("SET YEARS NEMESIS", years)
      // console.log("NEW YEARS", speciesYears[0])
      console.log("yearRegionMap", yearRegionMap);
      setAllYearRegionMapB((prevMap) => ({
        ...prevMap,
        ...yearRegionMap,
      }));
    }
  }, [selectedSpecies, selectedSpeciesB, NAET1Data, NAET2Data, NAET3Data]);
  
  // OBIS
  useEffect(() => {
    if (!allYearObisSiteData) return;
    const combinedObisYears = new Set();
    Object.keys(allYearObisSiteData).forEach((key) => {
      if (key !== "all years") combinedObisYears.add(key);
    });
    if (allYearObisSiteDataB) {
      Object.keys(allYearObisSiteDataB).forEach((key) => {
        if (key !== "all years") combinedObisYears.add(key);
      });
    }
    setSpeciesYears(prevYears =>
      Array.from(new Set([...prevYears, ...Array.from(combinedObisYears)]))
        .sort((a, b) => Number(a) - Number(b))
    );

  }, [allYearObisSiteData, allYearObisSiteDataB]);

  // update newYear and SpeciesRegions
  useEffect(() => {
    setNewYear(speciesYears[0]);
    setSpeciesRegions(allYearRegionMap[speciesYears[0]]);
  }, [speciesYears]);

  // Depending on the selected year, update the pastSpeciesRegions and current speciesRegions
  useEffect(() => {
    const pastSpeciesRegionsList = [];
    const pastSpeciesRegionsListB = [];
    Object.keys(allYearRegionMap).forEach((key) => {
      key <= newYear
        ? pastSpeciesRegionsList.push(allYearRegionMap[key])
        : null;
    });

    Object.keys(allYearRegionMapB).forEach((key) => {
      key <= newYear
        ? pastSpeciesRegionsListB.push(allYearRegionMapB[key])
        : null;
    });

    setPastSpeciesRegions(new Set(pastSpeciesRegionsList.flat()));
    setPastSpeciesRegionsB(new Set(pastSpeciesRegionsListB.flat()));

    const newSpeciesRegionsA = newYear in allYearRegionMap
      ? allYearRegionMap[newYear]
      : [];
    const newSpeciesRegionsB = newYear in allYearRegionMapB
      ? allYearRegionMapB[newYear]
      : [];
    setSpeciesRegions(Array.from(new Set([...newSpeciesRegionsA, ...newSpeciesRegionsB])));

    if (allYearRegionDetail[newYear]) {
      setCurrYearDetail(allYearRegionDetail[newYear]);
    }

    if (allYearRegionDetailB[newYear]) {
      setCurrYearDetailB(allYearRegionDetailB[newYear]);
    }

    const tempCurrYearSiteData = {};
    const tempCurrYearSiteDataB = {};
    if (newYear in allYearRasData) {
      tempCurrYearSiteData["rasSites"] = allYearRasData[newYear];
    }

    if (newYear in allYearRasDataB) {
      tempCurrYearSiteDataB["rasSites"] = allYearRasDataB[newYear];
    }

    if (newYear in allYearNemesisSiteData) {
      tempCurrYearSiteData["nemesisSpecificSites"] =
        allYearNemesisSiteData[newYear];
    }

    if (newYear in allYearNemesisSiteDataB) {
      tempCurrYearSiteDataB["nemesisSpecificSites"] =
        allYearNemesisSiteDataB[newYear];
    }

    console.log("allYearObisSiteData", allYearObisSiteData);
    console.log("newYear", newYear);

    if (allYearObisSiteData && newYear in allYearObisSiteData) {
      tempCurrYearSiteData["obisSites"] = allYearObisSiteData[newYear];
    }

    if (allYearObisSiteDataB && newYear in allYearObisSiteDataB) {
      tempCurrYearSiteDataB["obisSites"] = allYearObisSiteDataB[newYear];
    }

    console.log("CURRYEARSITEDATA", tempCurrYearSiteData)
    console.log("CURRYEARSITEDATAB", tempCurrYearSiteDataB)
    setCurrYearSiteData(tempCurrYearSiteData);
    setCurrYearSiteDataB(tempCurrYearSiteDataB);

    if (newYear == "all years") {
      setAllYears(true);
      setCurrYearDetail(regionYearMap);
      setCurrYearDetailB(regionYearMap);
    } else setAllYears(false);

  }, [newYear]);


  useEffect(() => {
    console.log("years changed", speciesYears)
  }, [speciesYears]);

  return (
    <div className="flex flex-row flex-grow overflow-hidden h-full w-full">
      <Sidebar
        selectedSpeciesInfo={selectedSpeciesInfo}
        selectedSpeciesBInfo={selectedSpeciesBInfo}
        onSpeciesSelect={setSelectedSpecies}
        onSpeciesSelectB={setSelectedSpeciesB}
        showingSpeciesDetail={setShowingSpeciesDetail}
        nemesisRegionNames={nemesisRegionMap}
        expandSide={expandSide}
        setExpandSide={setExpandSide}
        resetStates={() => {
          setAllYearRegionDetail({});
          setAllYearRegionDetailB({});
          setCurrYearDetail([]);
          setCurrYearDetailB([]);
          setAllYearRegionMap({});
          setAllYearRegionMapB({});
          setRegionYearMap({
            "NA-ET1": [],
            "NA-ET2": [],
            "NA-ET3": [],
          });
          setAllYearNemesisSiteData([]);
          setAllYearNemesisSiteDataB([]);
          setSpeciesYears([]);
          setNewYear(null);
          setAllYears(false);
          setShowingSpeciesDetail(false);
        }}
      />
      <MapSection
        allYears={allYears}
        currSpeciesRegions={speciesRegions}
        pastSpeciesRegions={pastSpeciesRegions}
        pastSpeciesRegionsB={pastSpeciesRegionsB}
        regionsDetail={currYearDetail}
        regionsDetailB={currYearDetailB}
        speciesYears={speciesYears}
        allYearRegionMap={allYearRegionMap}
        setNewYear={setNewYear}
        showTimeline={showingSpeciesDetail}
        currSites={currYearSiteData}
        currSitesB={currYearSiteDataB}
        nemesisRegionNames={nemesisRegionMap}
        expandSide={expandSide}
      />
    </div>
  );
}
