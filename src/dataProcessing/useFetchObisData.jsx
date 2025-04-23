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
  const [NAET3Data, setNAET3Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [OBISNAET3Data, setOBISNAET3Data] = useState({});

  useEffect(() => {
    // Don't do anything if no scientificName is provided
    if (!scientificName) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedData = await extractFromRegionsCSV(
          "../public/OBIS data/NAET3Data.csv"
        );
        console.log("fetched data", fetchedData);
        const filteredData = filterBySpeciesName(fetchedData, scientificName);
        setNAET3Data(filteredData);
        console.log("filtered data", filteredData);
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

    fetchData();

    return () => abortController.abort(); // Cleanup on unmount
  }, [scientificName]);

  useEffect(() => {
    if (NAET3Data.length > 0) {
      const yearRegionMap = {};

      NAET3Data.forEach((record) => {
        const { date, decimalLatitude, decimalLongitude } = record;
        const currYear = date || "Unknown Date";

        if (!yearRegionMap[currYear]) {
          yearRegionMap[currYear] = [];
        }
        let alreadyExists = (yearRegionMap[currYear]).some(
          (entry) =>
            entry.Latitude === "" + decimalLatitude &&
            entry.Longitude === "" + decimalLongitude
        );

        if (!alreadyExists) {
          yearRegionMap[currYear].push({
            Latitude: "" + decimalLatitude,
            Longitude: "" + decimalLongitude,
          });
        }

        // Add record to "all years"
        if (!yearRegionMap["all years"]) {
          yearRegionMap["all years"] = [];
        }
        alreadyExists = (yearRegionMap["all years"]).some(
          (entry) =>
            entry.Latitude === "" + decimalLatitude &&
            entry.Longitude === "" + decimalLongitude
        );

        if (!alreadyExists) {
          yearRegionMap["all years"].push({
            Latitude: "" + decimalLatitude,
            Longitude: "" + decimalLongitude,
          });
        }
      });

      setOBISNAET3Data(yearRegionMap);
      console.log(yearRegionMap);
    }
  }, [NAET3Data]);
  return { OBISNAET3Data, loading, error };
}
