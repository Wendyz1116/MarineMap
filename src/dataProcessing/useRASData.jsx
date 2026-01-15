import { useState, useEffect } from "react";
import Papa from "papaparse";

/**
 * Cache for species set data to avoid re-reading the CSV file
 */
let speciesSetCache = null;


// Filter the RAS data based on selectedSpecies name
const filterRASBySpecies = (data, selectedGenus, selectedSpecies) => {
    if ("Species" in data && "Genus" in data) {
        return data.filter(
        (item) =>
        item.Species.trim() === selectedSpecies &&
        item.Genus.trim() === selectedGenus
        );
    }
    
};

const filterRASBySite = (data, siteCodes) => {
    return data.filter((item) => siteCodes.includes(item["Site Code"]));
};

async function extractFromRegionsCSV(csvPath) {
  const response = await fetch(csvPath);
  const csvData = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

const melt = (data, idVars, valueVars) => {
  return data.flatMap(row => 
    valueVars.map(variable => ({
      ...Object.fromEntries(idVars.map(id => [id, row[id]])),
      variable,
      value: row[variable]
    }))
  );
};

const getLngLat = (siteData, siteAbbr) => {
  const targetSite = siteData.find(record => record.Abbreviation === siteAbbr);
  try {
    return [targetSite.Longitude, targetSite.Latitude] 
  } catch {
    return [null, null]
  }
  
}

async function extractFromFileNames(fileNames) {
  const [rasSiteLocData, speciesRASData] = await Promise.all(
  [extractFromRegionsCSV(fileNames[1]), extractFromRegionsCSV(fileNames[0])]);
  console.log("GURT EXTRACTED", speciesRASData);
  const meltSpeciesRASData = melt(speciesRASData, ["SpeciesName"], rasSiteLocData.map(site => site.Abbreviation))
  console.log("GURT MELT", meltSpeciesRASData)
  const filteredSpeciesRASData = meltSpeciesRASData.filter(
    (record) => record.value.includes('x')
  )
  console.log("GURT FILTERED", filteredSpeciesRASData)

  const speciesRASDataLngLat = filteredSpeciesRASData.map(record => ({
    ...record,
    Longitude: getLngLat(rasSiteLocData, record.variable)[0],
    Latitude: getLngLat(rasSiteLocData, record.variable)[1]
  }))
  console.log("GURT latlonged", speciesRASDataLngLat)
  return filteredSpeciesRASData
}

export default function useRASData(speciesDetail) {

  const [RASRegionData, setRASRegionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("HELLO")
    // Don't do anything if no scientificName is provided
    if (!speciesDetail) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const getRASData = () => {
      return new Promise((resolve, reject) => {
        Papa.parse("/public/RAS data/rasSourceInfo.csv", {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      });
    };

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      const RASdata = await getRASData();
      console.log("GURT", RASdata);

      const years = RASdata
        .map(row => parseInt(row.Year))
        .filter(year => !isNaN(year));

      console.log("GURT YEARS", years);
      const surveyFiles = Array.from(years, year => 
        [`public/RAS data/ras${year}Survey.csv`, `public/RAS data/ras${year}Sites.csv`]);
      console.log("GURT FILES", surveyFiles);
      
      const regionData = {}
      
      await Promise.all(
        surveyFiles.map(async (fileNames) => {
          console.log("GURT LOOP")

          const filteredRASSite = await extractFromFileNames(fileNames)

          console.log("GURT filtered", filteredRASSite)
        })
      );

      setRASRegionData(regionData);
    }
    fetchAllData();

    return () => abortController.abort(); // Cleanup on unmount
  }, [speciesDetail]);
  return { RASRegionData, loading, error };
}