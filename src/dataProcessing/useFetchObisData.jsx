import { useState, useEffect } from "react";
import Papa from "papaparse";
import fs from "fs";
import path from "path";

/**
 * Cache for species set data to avoid re-reading the CSV file
 */
let speciesSetCache = null;


/**
 * Load and cache species set data from CSV
 * @returns {Promise<Array>} - Promise resolving to species set data
 */
async function loadSpeciesSetData() {
  if (speciesSetCache) {
    return speciesSetCache;
  }

  try {
    const csvPath = "/descriptions/speciesSet.csv";
    const response = await fetch(csvPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${csvPath}: ${response.status} ${response.statusText}`);
    }
    const csvData = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          speciesSetCache = results.data;
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  } catch (error) {
    console.error("Error loading species set data:", error);
    throw error;
  }
}

/**
 * Get the species set number for a given species detail
 * @param {Object} speciesDetail - Object containing RAS Genus Name and RAS Species Name
 * @returns {Promise<number|null>} - The set number or null if not found
 */
const getOBISSpeciesDesc = async (speciesDetail) => {
  try {
    const speciesSetData = await loadSpeciesSetData();

    // console.log("speciesSetData", speciesSetData, "matching", speciesDetail);
    // Find the matching species in the data
    for (const row of speciesSetData) {
      if (
        toString(row["Species Nemesis ID"]) === toString(speciesDetail["Species Nemesis ID"])
      ) {
        return { speciesSet: row["Species Set Number"], genus: row["Genus"], species: row["Species"] };
      }
    }

    return null; // Species not found
  } catch (error) {
    console.error("Error getting species set:", error);
    throw error;
  }
};

/**
 * Utility function to extract data from a CSV file
 * @param {string} csvPath - Path to the CSV file
 * @returns {Promise<Array>} - Promise resolving to parsed data
 */
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

const filterBySpeciesName = (data, speciesName) => {
  return data
    ? data.filter((record) => record.scientificName === speciesName)
    : [];
};



/**
 * Custom hook to fetch OBIS data for a given scientific name
 * @param {string} scientificName - The scientific name to search for
 * @returns {Object} - Contains data, loading, and error states
 */
export default function useFetchObisData(speciesDetail) {
  const [combinedOBISData, setCombinedOBISData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't do anything if no scientificName is provided
    if (!speciesDetail) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine which species set this species belongs to
        const speciesData = await getOBISSpeciesDesc(speciesDetail);


        if (!speciesData) {
          throw new Error(`Species "${speciesDetail}" not found in species set data`);
        }

        const { speciesSet, genus, species } = speciesData;
        const scientificName = `${genus} ${species}`;

        // Fetch all datasets in parallel
        const [NAET1Data, NAET2Data, NAET3Data] = await Promise.all([
          extractFromRegionsCSV(`/OBISFilteredData/NAET1/OBISNAET1Set${speciesSet}Data.csv`).then((data) =>
            filterBySpeciesName(data, scientificName)
          ),
          extractFromRegionsCSV(`/OBISFilteredData/NAET2/OBISNAET2Set${speciesSet}Data.csv`).then((data) =>
            filterBySpeciesName(data, scientificName)
          ),
          extractFromRegionsCSV(`/OBISFilteredData/NAET3/OBISNAET3Set${speciesSet}Data.csv`).then((data) =>
            filterBySpeciesName(data, scientificName)
          ),
        ]);

        console.log("NAET1Data", NAET1Data, "NAET2Data", NAET2Data, "NAET3Data", NAET3Data);

        // Process each dataset
        const yearRegionMap = processDatasets({
          "NA-ET1": NAET1Data,
          "NA-ET2": NAET2Data,
          "NA-ET3": NAET3Data,
        });

        setCombinedOBISData(yearRegionMap);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    return () => abortController.abort(); // Cleanup on unmount
  }, [speciesDetail]);

  // Process datasets and create a combined map
  const processDatasets = (datasets) => {
    const combinedYearSiteMap = {};
    const combinedYearRegionMap = {};

    // Process each dataset
    Object.entries(datasets).forEach(([datasetName, records]) => {
      records.forEach((record) => {
        const { date, decimalLatitude, decimalLongitude, dataset_id } = record;
        const currYear = date || "Unknown Date";

        // Add source information to distinguish between datasets
        const dataPoint = {
          Date: currYear,
          Latitude: "" + decimalLatitude,
          Longitude: "" + decimalLongitude,
          DatasetID: dataset_id,
          Source: datasetName, // Track which dataset this came from
        };

        // Add to year-specific collection
        if (!combinedYearSiteMap[currYear]) {
          combinedYearSiteMap[currYear] = [];
          combinedYearRegionMap[currYear] = new Set();
        }

        let alreadyExists = combinedYearSiteMap[currYear].some(
          (entry) =>
            entry.Latitude === dataPoint.Latitude &&
            entry.Longitude === dataPoint.Longitude &&
            entry.DatasetID === dataPoint.DatasetID
        );

        if (!alreadyExists) {
          combinedYearSiteMap[currYear].push(dataPoint);
          combinedYearRegionMap[currYear].add(datasetName);
        }

        // Add to "all years" collection
        if (!combinedYearSiteMap["all years"]) {
          combinedYearSiteMap["all years"] = [];
          combinedYearRegionMap["all years"] = new Set();
        }

        alreadyExists = combinedYearSiteMap["all years"].some(
          (entry) =>
            entry.Latitude === dataPoint.Latitude &&
            entry.Longitude === dataPoint.Longitude &&
            entry.DatasetID === dataPoint.DatasetID
        );

        if (!alreadyExists) {
          combinedYearSiteMap["all years"].push(dataPoint);
          combinedYearRegionMap["all years"].add(datasetName);
        }
      });
    });

    for (const year in combinedYearRegionMap) {
      combinedYearRegionMap[year] = Array.from(combinedYearRegionMap[year]);
    }

    return { combinedYearRegionMap, combinedYearSiteMap };
  };

  console.log("DONE! combinedOBISData", combinedOBISData);
  // const combinedOBISData = combinedOBISData;
  return { combinedOBISData, loading, error };
}
