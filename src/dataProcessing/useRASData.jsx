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

    }, [speciesDetail]);
}