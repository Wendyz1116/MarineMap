import { useEffect, useState } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Timeline from "../components/Timeline";
import Papa from "papaparse";
import MapSection from "../components/MapSection";

export default function SpeciesSection() {
  // States for sidebar
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [speciesRegions, setSpeciesRegions] = useState([]);
  const [pastSpeciesRegions, setPastSpeciesRegions] = useState(new Set());

  // Nemesis Data
  const [NAET1Data, setNAET1Data] = useState(null);
  const [NAET2Data, setNAET2Data] = useState(null);
  const [NAET3Data, setNAET3Data] = useState(null);

  // RAS Data
  // TODO3, change ras to all sentence case
  const [rasSiteLocData, setRasSiteLocData] = useState(null);
  const [ras2019SurveyData, setras2019SurveyData] = useState(null);
  const [allYearRasData, setAllYearRasData] = useState([]);
  const [speciesRasData, setSpeciesRasData] = useState([]);

  // States for map/timeline
  const [showingSpeciesDetail, setShowingSpeciesDetail] = useState(false);
  const [allYearRegionDetail, setAllYearRegionDetail] = useState({})
  const [currYearDetail, setCurrYearDetail] = useState([]);
  const [allYearRegionMap, setAllYearRegionMap] = useState({});
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

  // useEffect(() => {
  //   extractFromRegionsCSV("/data/nemesisNAET1.csv", setNAET1Data);
  //   extractFromRegionsCSV("/data/nemesisNAET2.csv", setNAET2Data);
  //   extractFromRegionsCSV("/data/nemesisNAET3.csv", setNAET3Data);
  //   // Fetch the CSV file
  // }, []);

  // extract data from the csv file for regions NA-ET1, Na-ET2, and Na-ET3
  useEffect(() => {
    extractFromRegionsCSV(
      "/data/nemesisSpeciesWithBaysNAET1.csv",
      setNAET1Data
    );
    extractFromRegionsCSV(
      "/data/nemesisSpeciesWithBaysNAET2.csv",
      setNAET2Data
    );
    extractFromRegionsCSV(
      "/data/nemesisSpeciesWithBaysNAET3.csv",
      setNAET3Data
    );

    extractFromRegionsCSV("/RAS data/ras2019Sites.csv", setRasSiteLocData);
    extractFromRegionsCSV("/RAS data/ras2019Survey.csv", setras2019SurveyData);
  }, []);

  // Use the species name, filter from the smaller region files
  useEffect(() => {
    console.log("selectedSpecies changed!!");
    console.log(selectedSpecies);

    if (selectedSpecies) {
      // Filter the data from NAET1Data, NAET2Data, NAET3Data based on selectedSpecies
      const filterBySpecies = (data) => {
        return data
          ? data.filter(
              (item) => item.SpeciesID === selectedSpecies["Species Nemesis ID"]
            )
          : [];
      };

      const filterRASBySpecies = (data, selectedGenus, selectedSpecies) => {
        return data.filter(
          (item) =>
            item.Species === selectedSpecies && item.Genus === selectedGenus
        );
      };

      const filterRASBySite = (data, siteCodes) => {
        return data.filter((item) => siteCodes.includes(item["Site Code"]));
      };

      const filteredNAET1 = filterBySpecies(NAET1Data);
      const filteredNAET2 = filterBySpecies(NAET2Data);
      const filteredNAET3 = filterBySpecies(NAET3Data);

      console.log(filteredNAET1);

      const yearRegionMap = {};
      yearRegionMap["all years"] = new Set();
      const yearRegionDetails = {};
      // {"NA-ET1": {}, "NA-ET2": {}, "NA-ET3": {}};
      yearRegionDetails["all years"] = {
        "NA-ET1": [],
        "NA-ET2": [],
        "NA-ET3": [],
      };

      // loop through the regions info and add year: region pairs
      const addYearRegion = (region, data) => {
        console.log(yearRegionDetails);
        console.log(region);
        console.log("yearRegionMap", yearRegionMap);
        data.forEach((record) => {
          const currYear =
            record.Date.length == 4 ? record.Date : "Unknown Date";
          if (currYear in yearRegionMap) {
            yearRegionMap[currYear].add(region);
            if (region in yearRegionDetails[currYear])
              yearRegionDetails[currYear][region].push(record);
            else yearRegionDetails[currYear][region] = [record];
          } else if (currYear != "Unknown Date") {
            yearRegionMap[currYear] = new Set([region]);
            yearRegionDetails[currYear] = { [region]: [record] };
          }
          // if (currYear in yearRegionDetails[region]) {
          //   yearRegionDetails[region][currYear].push(record);
          // } else if (currYear != "Unknown Date") {
          //   yearRegionDetails[region][currYear] = [record];
          // }
          yearRegionMap["all years"].add(region);
          yearRegionDetails["all years"][region].push[record];
        });
      };

      if (filteredNAET1[0]) {
        addYearRegion("NA-ET1", filteredNAET1);
      }
      if (filteredNAET2[0]) {
        addYearRegion("NA-ET2", filteredNAET2);
      }
      if (filteredNAET3[0]) {
        addYearRegion("NA-ET3", filteredNAET3);
      }

      console.log("detail", yearRegionDetails, "map", yearRegionMap);

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

      setAllYearRegionMap(yearRegionMap);
      setSpeciesRegions(yearRegionMap[years[0]]);

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

      console.log(filteredRAS, tempSpeciesRASData);
      console.log(rasSiteLocData);

      const filteredRASSite = filterRASBySite(
        rasSiteLocData,
        tempSpeciesRASData
      );

      let tempAllYearRasData = {};

      tempAllYearRasData["2019"] = filteredRASSite;
      tempAllYearRasData["all years"] = filteredRASSite;

      // setSpeciesRasData(filteredRASSite);
      setAllYearRasData(tempAllYearRasData);

      console.log(filteredRASSite, "all", tempAllYearRasData);
      // setRasSiteLocData(filteredRASSite);
    }
  }, [selectedSpecies]);

  // Depending on the selected year, update the pastSpeciesRegions and current speciesRegions
  useEffect(() => {
    console.log("detail", allYearRegionDetail);

    const pastSpeciesRegionsList = [];
    Object.keys(allYearRegionMap).forEach((key) => {
      key < newYear ? pastSpeciesRegionsList.push(allYearRegionMap[key]) : null;
    });
    setPastSpeciesRegions(new Set(pastSpeciesRegionsList.flat()));
    setSpeciesRegions([allYearRegionMap[newYear]]);

    if (allYearRegionDetail[newYear]) {
      setCurrYearDetail(allYearRegionDetail[newYear]);

      console.log("curr year detail", allYearRegionDetail[newYear]);
    }

    if (newYear == "2019" || newYear == "all years")
      setSpeciesRasData(allYearRasData[newYear]);
    else setSpeciesRasData([]);
  }, [newYear]);

  return (
    <div className="flex flex-row flex-grow overflow-hidden h-full w-full">
      <Sidebar
        onSpeciesSelect={setSelectedSpecies}
        showingSpeciesDetail={setShowingSpeciesDetail}
      />
      <MapSection
        currSpeciesRegions={speciesRegions}
        pastSpeciesRegions={pastSpeciesRegions}
        regionsDetail={currYearDetail}
        speciesYears={speciesYears}
        allYearRegionMap={allYearRegionMap}
        setNewYear={setNewYear}
        showTimeline={showingSpeciesDetail}
        currRasSites={speciesRasData}
      />
    </div>
  );
}
