import { useState, useEffect } from "react";
import Papa from "papaparse";

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
  console.log("in filterBySpeciesName", speciesName, data);
  return data
    ? data.filter((record) => record.scientificName === speciesName)
    : [];
};

// const { date_year, decimalLatitude, decimalLongitude } = record;

//     if (!cleanData[date_year]) {
//       cleanData[date_year] = [];
//     }

//     cleanData[date_year].push({
//       Latitude: "" + decimalLatitude,
//       Longitude: "" + decimalLongitude
//     });
//   }
//   return {
//       formattedData: cleanData,
//       rawData: response.data
//     };

/**
 * Custom hook to fetch OBIS data for a given scientific name
 * @param {string} scientificName - The scientific name to search for
 * @returns {Object} - Contains data, loading, and error states
 */
export default function useFetchObisData(speciesDetail) {
  const scientificName = speciesDetail
    ? `${speciesDetail["RAS Genus Name"]} ${speciesDetail["RAS Species Name"]}`
    : null;

  console.log("in useFetchObisData", scientificName);
 
  const [combinedOBISData, setcombinedOBISData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't do anything if no scientificName is provided
    if (!scientificName) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all datasets in parallel
        const [NAET1Data, NAET2Data, NAET3Data] = await Promise.all([
          extractFromRegionsCSV("../OBIS data/NAET1OBISData.csv")
            .then(data => filterBySpeciesName(data, scientificName)),
          extractFromRegionsCSV("../OBIS data/NAET2OBISData.csv")
            .then(data => filterBySpeciesName(data, scientificName)),
          extractFromRegionsCSV("../OBIS data/NAET3OBISData.csv")
            .then(data => filterBySpeciesName(data, scientificName))
        ]);

        console.log("FIN extraction", NAET1Data, NAET2Data, NAET3Data);
        // Process each dataset
        const yearRegionMap = processDatasets({
          NAET1: NAET1Data,
          NAET2: NAET2Data,
          NAET3: NAET3Data
        });
        
        setcombinedOBISData(yearRegionMap);
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
  }, [scientificName]);

  // Process datasets and create a combined map
  const processDatasets = (datasets) => {
    const combinedYearRegionMap = {};
    
    // Process each dataset
    Object.entries(datasets).forEach(([datasetName, records]) => {
      records.forEach((record) => {
        const { date, decimalLatitude, decimalLongitude, dataset_id } = record;
        const currYear = date || "Unknown Date";

        // Add source information to distinguish between datasets
        const dataPoint = {
          Latitude: "" + decimalLatitude,
          Longitude: "" + decimalLongitude,
          DatasetID: dataset_id,
          Source: datasetName // Track which dataset this came from
        };

        // Add to year-specific collection
        if (!combinedYearRegionMap[currYear]) {
          combinedYearRegionMap[currYear] = [];
        }
        
        let alreadyExists = combinedYearRegionMap[currYear].some(
          entry => 
            entry.Latitude === dataPoint.Latitude &&
            entry.Longitude === dataPoint.Longitude &&
            entry.DatasetID === dataPoint.DatasetID
        );
        
        if (!alreadyExists) {
          combinedYearRegionMap[currYear].push(dataPoint);
        }

        // Add to "all years" collection
        if (!combinedYearRegionMap["all years"]) {
          combinedYearRegionMap["all years"] = [];
        }
        
        alreadyExists = combinedYearRegionMap["all years"].some(
          entry => 
            entry.Latitude === dataPoint.Latitude &&
            entry.Longitude === dataPoint.Longitude &&
            entry.DatasetID === dataPoint.DatasetID
        );
        
        if (!alreadyExists) {
          combinedYearRegionMap["all years"].push(dataPoint);
        }
      });
    });

    console.log("RETURNINGcombinedYearRegionMap", combinedYearRegionMap);
    return combinedYearRegionMap;
  };

  console.log("DONE! combinedOBISData", combinedOBISData);
  // const combinedOBISData = combinedOBISData;
  console.log("FINAL return", { combinedOBISData, loading, error });
  return { combinedOBISData, loading, error };
}
