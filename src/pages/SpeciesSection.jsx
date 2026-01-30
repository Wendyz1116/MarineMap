import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Papa from "papaparse";
import MapSection from "../components/MapSection";
import useFetchObisData from "../dataProcessing/useFetchObisData";
import useNemesisData from "../dataProcessing/useNemesisData";
import useRASData from "../dataProcessing/useRASData";

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
  const [noNemesisInfo, setNoNemesisInfo] = useState(null);
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
  const { combinedOBISData, combinedOBISDataB } =
    useFetchObisData(selectedSpecies, selectedSpeciesB);

  // fetch nemesis data
  const { nemesisRegionData } =
    useNemesisData(selectedSpecies);

  // fetch RAS data
  const { RASRegionData } =
    useRASData(selectedSpecies);

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
            // save to regionsData
            setRegionsData(results.data);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV file:", error));
  }

  // -------------------------------------------------------------//
  // Functions to filter data based on species name or species ID //
  // -------------------------------------------------------------//

  // Filter by speciesID given selected species data
  const filterBySpeciesID = (data, speciesData) => {
    return data
      ? data.filter(
          (item) => item.SpeciesID === speciesData["Species Nemesis ID"]
        )
      : [];
  };

  // Filter by scientific name given selected species data
  const filterBySpeciesName = (data, speciesData) => {
    return data
      ? data.filter((item) => item.Name === speciesData["Species Name"])
      : [];
  };

  // check if two species names are the same (ignores abbreviations)
  const checkSameSpecies = (speciesName, selectedSpecies) => {
    const speciesWords = selectedSpecies.toLowerCase().split(" ");
    // test if every word (not abbr.) in selectedSpecies name is in speciesName
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

  // function to extract year from string
  const extractYear = (rawDate) => {
    // no date data
    if (!rawDate) return "Unknown Date";

    // takes last part of mm/dd/yyyy if there are /'s
    let extractedYear = rawDate;
    if (rawDate.includes("/")) {
      const parts = rawDate.split("/");
      extractedYear = parts[parts.length - 1];
    } else {
      extractedYear = rawDate; // if already just a year
    }

    // make sure year value is reasonable
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
    // loop over years and records
    Object.entries(yearRegionDetails).forEach(([year, regions]) => {
      Object.entries(regions).forEach(([region, records]) => {
        records.forEach((record) => {
          if (record["Latitude"]) {
            const latitude = record["Latitude"];
            const longitude = record["Longitude"];
            const formattedRecord = { ...record };

            // allow for multiple formats of location column in data
            let site = null;
            try {
              // Nemesis data
              site = formattedRecord["Site Location"];
              site = site.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            } catch {
              // OBIS and RAS data
              site = formattedRecord["SiteLocation"];
            }

            formattedRecord["Site Location"] = site;

            // coords must point to rough region in N. Am Atlantic coast
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

  // using records, add regions to yearRegionMap[year][region]
  const addYearRegion = (region, data, yearRegionMap, yearRegionDetails) => {
    data.forEach((record) => {
      const currYear = extractYear(record.Date)

      // if year is already in yearRegionMap, push to region directly or add region
      if (currYear in yearRegionMap) {
        yearRegionMap[currYear].add(region);
        if (region in yearRegionDetails[currYear])
          yearRegionDetails[currYear][region].push(record);
        else yearRegionDetails[currYear][region] = [record];

      // create new year key for valid years
      } else if (currYear != "Unknown Date") {
        yearRegionMap[currYear] = new Set([region]);
        yearRegionDetails[currYear] = { [region]: [record] };
      }

      // add to all years
      yearRegionMap["all years"].add(region);
      yearRegionDetails["all years"][region].push(record);
    });
  };

  // extend allYearRegionMap with new data
  const addAllYearRegionMap = (prevMap, yearRegionMap) => {
    // make sure yearRegionMap exists
    if (!yearRegionMap || typeof yearRegionMap !== 'object') {
      return prevMap;
    }

    const newMap = { ...prevMap };

    Object.entries(yearRegionMap).forEach(([year, regions]) => {
      // add to existing set
      if (newMap[year]) {
        const combined = new Set([...newMap[year], ...regions]);
        newMap[year] = Array.from(combined);
      // create new key-value pair
      } else {
        newMap[year] = regions;
      }
    });
    return newMap;
  }

  // Fetch the CSV file for species
  useEffect(() => {
    extractFromRegionsCSV("/data/nemesisNAET1.csv", setNAET1SpeciesInfo);
    extractFromRegionsCSV("/data/nemesisNAET2.csv", setNAET2SpeciesInfo);
    extractFromRegionsCSV("/data/nemesisNAET3.csv", setNAET3SpeciesInfo);
    extractFromRegionsCSV("/data/speciesSetWithWoRMS.csv", setNoNemesisInfo)
  }, []);

  // extract data from the csv file for regions NA-ET1, Na-ET2, and Na-ET3
  useEffect(() => {
    extractFromRegionsCSV(
      "/descriptions/nemesisRegionName.csv",
      setNemesisRegionNames
    );
  }, []);

  // set Nemesis region data
  useEffect(() => {
    if (nemesisRegionData) {
      setNAET1Data(nemesisRegionData["NA-ET1"]);
      setNAET2Data(nemesisRegionData["NA-ET2"]);
      setNAET3Data(nemesisRegionData["NA-ET3"]);
    }
  }, [nemesisRegionData]);

  // function to clear species data between transitions
  const clearData = () => {
    // clear all data related to species when none is selected
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

  // update region detail information with OBIS
  const addAllYrDetailOBIS = (speciesOBISData, allYearRegionDetailWithObis, regionYearMapWithObis) => {
    for (let year in speciesOBISData["combinedYearRegionMap"]) {
      for (let region of speciesOBISData["combinedYearRegionMap"][year]) {
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
          RegionName: region, 
          "Source(s)": " OBIS Dataset",
        });
      }
    }
  }

  // update OBIS data
  useEffect(() => {
    setAllYearObisSiteData(combinedOBISData["combinedYearSiteMap"]);
    setAllYearObisSiteDataB(combinedOBISDataB["combinedYearSiteMap"]);

    // Combine combinedOBISData["combinedYearRegionMap"] with allYearRegion
    const obisRegionMap = combinedOBISData["combinedYearRegionMap"];
    setAllYearRegionMap((prevMap) => addAllYearRegionMap(prevMap, obisRegionMap));

    const obisRegionMapB = combinedOBISDataB["combinedYearRegionMap"];
    setAllYearRegionMapB((prevMap) => addAllYearRegionMap(prevMap, obisRegionMapB));

    // Updating all the variables with bioregions to now include OBIS data
    const allYearRegionDetailWithObis = { ...allYearRegionDetail };
    const regionYearMapWithObis = { ...regionYearMap };

    addAllYrDetailOBIS(combinedOBISData, allYearRegionDetailWithObis, regionYearMapWithObis);
    addAllYrDetailOBIS(combinedOBISDataB, allYearRegionDetailWithObis, regionYearMapWithObis);

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

  // extract data from RAS dataset for specific species
  const addRASData = (speciesData) => {
    // filter by species name
    const filteredRASNAET1 = filterRASBySpecies(
      RASRegionData["NA-ET1"],
      speciesData["Species Name"]
    );
    const filteredRASNAET2 = filterRASBySpecies(
      RASRegionData["NA-ET2"],
      speciesData["Species Name"]
    );
    const filteredRASNAET3 = filterRASBySpecies(
      RASRegionData["NA-ET3"],
      speciesData["Species Name"]
    );

    // add regions
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

    // add new years to speciesYears
    setSpeciesYears(prevYears =>
      Array.from(new Set([...prevYears, ...years]))
        .sort((a, b) => Number(a) - Number(b))
    );
    return { yearRegionMap, yearRegionDetails };
  }

  // update RAS data
  useEffect(() => {
    // --------------------------------------------//
    // Working with RAS species specific site data //
    // --------------------------------------------//
    if (selectedSpecies) {
      if (Object.keys(RASRegionData).length > 0) {
        const { yearRegionMap, yearRegionDetails } = addRASData(selectedSpecies);

        setAllYearRegionMap((prevMap) => addAllYearRegionMap(prevMap, yearRegionMap));
        setAllYearRasData(extractYearsWithGeoloc(yearRegionDetails))
      }
    }
    if (selectedSpeciesB) {
      if (Object.keys(RASRegionData).length > 0) {
        const { yearRegionMap, yearRegionDetails } = addRASData(selectedSpeciesB);

        setAllYearRegionMapB((prevMap) => addAllYearRegionMap(prevMap, yearRegionMap));
        setAllYearRasDataB(extractYearsWithGeoloc(yearRegionDetails))
      }
    }
  }, [selectedSpecies, selectedSpeciesB, RASRegionData]);

  // extract distribution data from Nemesis dataset for specific species
  const addNemesisData = (speciesData) => {
    // --------------------------------------------------------//
    // Working with Nemesis species specific first record info //
    // --------------------------------------------------------//
    // Set first record info abt species in each region
    const filteredNAET1Species = filterBySpeciesName(NAET1SpeciesInfo, speciesData);
    const filteredNAET2Species = filterBySpeciesName(NAET2SpeciesInfo, speciesData);
    const filteredNAET3Species = filterBySpeciesName(NAET3SpeciesInfo, speciesData);

    const regionSpeciesData = [{}, true];

    if (filteredNAET1Species[0]) {
      regionSpeciesData[0]["NA-ET1"] = filteredNAET1Species[0];
    }
    if (filteredNAET2Species[0]) {
      regionSpeciesData[0]["NA-ET2"] = filteredNAET2Species[0];
    }
    if (filteredNAET3Species[0]) {
      regionSpeciesData[0]["NA-ET3"] = filteredNAET3Species[0];
    }

    if (Object.keys(regionSpeciesData[0]).length === 0) {
      regionSpeciesData[0] = filterBySpeciesName(noNemesisInfo, speciesData);
      regionSpeciesData[1] = false;
    }

    // ----------------------------------------------------//
    // Working with Nemesis species specific location data //
    // ----------------------------------------------------//
    const filteredNAET1 = filterBySpeciesID(NAET1Data, speciesData);
    const filteredNAET2 = filterBySpeciesID(NAET2Data, speciesData);
    const filteredNAET3 = filterBySpeciesID(NAET3Data, speciesData);

    const yearRegionMap = {};
    yearRegionMap["all years"] = new Set();
    const yearRegionDetails = {};
    yearRegionDetails["all years"] = {
      "NA-ET1": [],
      "NA-ET2": [],
      "NA-ET3": [],
    };

    // Loops through the regions info and add year: region pairs
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

    // convert sets back to lists
    Object.keys(yearRegionMap).forEach((key) => {
      yearRegionMap[key] = Array.from(yearRegionMap[key]);
    });

    // Extract years from the filtered data
    const years = Object.keys(yearRegionMap).filter(
      (key) => key !== "all years"
    );
    return { regionSpeciesData, yearRegionDetails, yearRegionMap, years }
  }

  // update NEMESIS data
  useEffect(() => {
    if (selectedSpecies) {
      const { regionSpeciesData, yearRegionDetails, yearRegionMap, years } = addNemesisData(selectedSpecies);
      setSelectedSpeciesInfo(regionSpeciesData);
      setAllYearRegionDetail(yearRegionDetails);

      // Adding lat and long from source sites
      const tempAllYearNemesisSiteData = extractYearsWithGeoloc(yearRegionDetails);
      setAllYearNemesisSiteData(tempAllYearNemesisSiteData);

      setSpeciesYears(prevYears =>
        Array.from(new Set([...prevYears, ...years]))
          .sort((a, b) => Number(a) - Number(b))
      );

      setAllYearRegionMap((prevMap) => addAllYearRegionMap(prevMap, yearRegionMap));
    }

    if (selectedSpeciesB) {
      const { regionSpeciesData, yearRegionDetails, yearRegionMap, years } = addNemesisData(selectedSpeciesB);
      setSelectedSpeciesBInfo(regionSpeciesData);
      setAllYearRegionDetailB(yearRegionDetails);

      // Adding lat and long from source sites
      const tempAllYearNemesisSiteData = extractYearsWithGeoloc(yearRegionDetails);
      setAllYearNemesisSiteDataB(tempAllYearNemesisSiteData);

      setSpeciesYears(prevYears =>
        Array.from(new Set([...prevYears, ...years]))
          .sort((a, b) => Number(a) - Number(b))
      );

      setAllYearRegionMapB((prevMap) => addAllYearRegionMap(prevMap, yearRegionMap));
    }
  }, [selectedSpecies, selectedSpeciesB, NAET1Data, NAET2Data, NAET3Data]);

  // update OBIS data
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
    setSpeciesRegions(new Set(allYearRegionMap[speciesYears[0]]));
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

    const newCurrYearDetail = {
      "NA-ET1": [],
      "NA-ET2": [],
      "NA-ET3": []
  };
    if (allYearRegionDetail[newYear]) {
      for (const key in allYearRegionDetail[newYear]) {
        newCurrYearDetail[key] = newCurrYearDetail[key].concat(allYearRegionDetail[newYear][key]);
      }
    }

    if (allYearRegionDetailB[newYear]) {
      for (const key in allYearRegionDetailB[newYear]) {
        newCurrYearDetail[key] = newCurrYearDetail[key].concat(allYearRegionDetailB[newYear][key]);
      }
    }

    setCurrYearDetail(newCurrYearDetail);

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

    if (allYearObisSiteData && newYear in allYearObisSiteData) {
      tempCurrYearSiteData["obisSites"] = allYearObisSiteData[newYear];
    }

    if (allYearObisSiteDataB && newYear in allYearObisSiteDataB) {
      tempCurrYearSiteDataB["obisSites"] = allYearObisSiteDataB[newYear];
    }

    setCurrYearSiteData(tempCurrYearSiteData);
    setCurrYearSiteDataB(tempCurrYearSiteDataB);

    if (newYear == "all years") {
      setAllYears(true);
      setCurrYearDetail(regionYearMap);
    } else setAllYears(false);

  }, [newYear]);


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
