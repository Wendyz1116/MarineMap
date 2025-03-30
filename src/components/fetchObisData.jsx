import axios from "axios";

/**
 * Fetches OBIS data for a given scientific name and formats it by year
 * @param {string} scientificName - The scientific name to search for
 * @param {Object} options - Optional parameters
 * @param {string} options.baseUrl - The API base URL (default: "http://localhost:5050/api/obis")
 * @param {Function} options.onProgress - Callback for loading progress updates
 * @returns {Promise<Object>} - Object with formatted data and raw response
 */
async function fetchObisData(scientificName, options = {}) {
  const {
    baseUrl = "http://localhost:5050/api/obis",
    onProgress = null
  } = options;
  
  try {
    // Update loading status if callback provided
    if (onProgress) onProgress({ loading: true, error: null });
    
    // Fetch data from the Express server
    const response = await axios.get(baseUrl, {
      params: {
        scientificname: scientificName,
      },
    });
    
    // Format the data
    const cleanData = {};
    
    response.data.results.forEach((record) => {
      const { date_year, decimalLatitude, decimalLongitude } = record;
      
      if (!cleanData[date_year]) {
        cleanData[date_year] = [];
      }
      
      cleanData[date_year].push({
        Latitude: "" + decimalLatitude,
        Longitude: "" + decimalLongitude
      });
    });
    
    // Update loading status if callback provided
    if (onProgress) onProgress({ loading: false, error: null });
    
    // Return both the formatted data and the raw response
    return {
      formattedData: cleanData,
      rawData: response.data
    };
  } catch (error) {
    // Update error status if callback provided
    if (onProgress) onProgress({ loading: false, error: error.message });
    
    // Throw the error to be handled by the caller
    throw error;
  }
}

export default fetchObisData;