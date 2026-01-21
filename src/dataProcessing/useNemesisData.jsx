import { useState, useEffect } from "react";
import Papa from "papaparse";

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
      throw new Error(
        `Failed to fetch ${csvPath}: ${response.status} ${response.statusText}`
      );
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
        toString(row["Species Nemesis ID"]) ===
        toString(speciesDetail["Species Nemesis ID"])
      ) {
        return {
          speciesSet: row["Species Set Number"],
          genus: row["Genus"],
          species: row["Species"],
        };
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
// extract data from the csv file for regions NA-ET1, Na-ET2, and Na-ET3
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
export default function useNemesisData(speciesDetail) {
  const [nemesisRegionData, setNemesisRegionData] = useState({});
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

      // // Fetch the CSV file for species

      try {
        // Determine which species set this species belongs to
        const speciesData = await getOBISSpeciesDesc(speciesDetail);

        if (!speciesData) {
          throw new Error(
            `Species "${speciesDetail}" not found in species set data`
          );
        }

        console.log(`Species Nemesis info: ${JSON.stringify(speciesData)}`);

        const { speciesSet, genus, species } = speciesData;
        const scientificName = `${genus} ${species}`;

        const numSets = 4;
        const regionData = { "NA-ET1": [], "NA-ET2": [], "NA-ET3": [] };
        const filesByFolder = {
          "NA-ET1": Array.from(
            { length: numSets },  (_, i) =>
            `NemesisFilteredData/NAET1/NemesisNAET1Set${i + 1}Data.csv`
          ),
          "NA-ET2": Array.from(
            { length: numSets },  (_, i) =>
            `NemesisFilteredData/NAET2/NemesisNAET2Set${i + 1}Data.csv`
          ),
          "NA-ET3": Array.from(
            { length: numSets },  (_, i) =>
            `NemesisFilteredData/NAET3/NemesisNAET3Set${i + 1}Data.csv`
          )
        };

        await Promise.all(
          Object.entries(filesByFolder).map(async ([key, paths]) => {
            const parsedArrays = await Promise.all(
              paths.map((p) => extractFromRegionsCSV(p))
            );
            regionData[key] = parsedArrays.flat();
          })
        );

        setNemesisRegionData(regionData);
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



  console.log("returning nemesisRegionData", nemesisRegionData);
  return { nemesisRegionData, loading, error };
}
