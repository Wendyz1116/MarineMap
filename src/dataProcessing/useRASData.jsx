import { useState, useEffect } from "react";
import Papa from "papaparse";

/**
 * Cache for species set data to avoid re-reading the CSV file
 */
let speciesSetCache = null;

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

// from wide to long format
const melt = (data, idVars, valueVars) => {
  return data.flatMap(row => 
    valueVars.map(variable => ({
      ...Object.fromEntries(idVars.map(id => [id, row[id]])),
      variable,
      value: row[variable]
    }))
  );
};

// get long and lat from ras site info
const getLngLat = (siteData, siteAbbr) => {
  const targetSite = siteData.find(record => record.Abbreviation === siteAbbr);
  try {
    return [targetSite.Longitude, targetSite.Latitude, targetSite["Site Name"], targetSite.Region] 
  } catch {
    return [null, null, null, null]
  }
  
}

async function extractFromFileNames(fileNames) {
  // get data from CSV files
  const [rasSiteLocData, speciesRASData] = await Promise.all(
    [extractFromRegionsCSV(fileNames[1]), 
    extractFromRegionsCSV(fileNames[0])]
  );

  // convert species data to long format
  const meltSpeciesRASData = melt(
    speciesRASData, 
    ["SpeciesName"], 
    rasSiteLocData.map(site => site.Abbreviation)
  )
  const filteredSpeciesRASData = meltSpeciesRASData.filter(
    (record) => record.value.includes('x')
  )

  // add coords and location to record based on site location data
  const speciesRASDataLngLat = filteredSpeciesRASData.map(record => {
    const [Longitude, Latitude, SiteLocation, Region] = getLngLat(rasSiteLocData, record.variable);
    
    return {
      ...record,
      Longitude,
      Latitude,
      SiteLocation,
      Region
    };
  });
  return speciesRASDataLngLat
}

export default function useRASData(speciesDetail) {

  const [RASRegionData, setRASRegionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't do anything if no scientificName is provided
    if (!speciesDetail) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const getRASData = () => {
      return new Promise((resolve, reject) => {
        Papa.parse("/RAS data/rasSourceInfo.csv", {
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
      const regionData = { "NA-ET1": [], "NA-ET2": [], "NA-ET3": [] };

      await Promise.all(
        RASdata.map(async (record) => {
          const author = record.Source.split(" ")[0];
          const fileNames = [
            `/RAS data/${author}${record.Year}Survey.csv`, 
            `/RAS data/${author}${record.Year}Sites.csv`
          ];

          const filteredRASSite = await extractFromFileNames(fileNames);
          
          // add info columns
          const RASSiteInfo = filteredRASSite.map((data) => ({
              ...data,
              Date: record.Year.trim(),
              "Source(s)": record.Source.trim()
            })
          );
          
          // add region column
          RASSiteInfo.forEach(row => {
            const region = row.Region.trim();
            if (region) {
              regionData[region].push(row);
            }
          });
          // regionData[record.Location.trim()].push(...RASSiteInfo);
        })
      );
      setRASRegionData(regionData);
    }
    fetchAllData();

    return () => abortController.abort(); // Cleanup on unmount
  }, [speciesDetail]);
  return { RASRegionData, loading, error };
}