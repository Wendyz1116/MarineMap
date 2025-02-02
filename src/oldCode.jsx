// From pages/speciesSection.jsx

// extract smaller regional data form csv files
  function extractFromSmallerRegionsCSV(csvPath, setRegionsData) {
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

  // On species change, update the regions to show on the map
    // and the years to show on the timeline
  
    // Use the species name, filter from the bigger region files
    // useEffect(() => {
    //   console.log("selectedSpecies changed!!");
    //   console.log(selectedSpecies);
  
    //   if (selectedSpecies) {
    //     // Filter the data from NAET1Data, NAET2Data, NAET3Data based on selectedSpecies
    //     const filterBySpecies = (data) => {
    //       return data ? data.filter((item) => item.Name === selectedSpecies) : [];
    //     };
  
    //     const filteredNAET1 = filterBySpecies(NAET1Data);
    //     const filteredNAET2 = filterBySpecies(NAET2Data);
    //     const filteredNAET3 = filterBySpecies(NAET3Data);
  
    //     const yearRegionMap = {};
  
    //     // Assign regions for available years
    //     if (filteredNAET1[0]) {
    //       yearRegionMap[filteredNAET1[0].Year] = "NA-ET1";
    //     }
    //     if (filteredNAET2[0]) {
    //       yearRegionMap[filteredNAET2[0].Year] = "NA-ET2";
    //     }
    //     if (filteredNAET3[0]) {
    //       yearRegionMap[filteredNAET3[0].Year] = "NA-ET3";
    //     }
  
    //     // Extract years from the filtered data
    //     const years = Object.keys(yearRegionMap);
    //     setSpeciesYears(years);
  
    //     // Add "all years" key
    //     yearRegionMap["all years"] = [
    //       filteredNAET1[0] ? "NA-ET1" : null,
    //       filteredNAET2[0] ? "NA-ET2" : null,
    //       filteredNAET3[0] ? "NA-ET3" : null,
    //     ].filter(Boolean); // Remove null values
  
    //     setAllYearRegionMap(yearRegionMap);
    //     setSpeciesRegions(yearRegionMap["all years"]);
  
    //     console.log(
    //       "allYearRegionMap",
    //       allYearRegionMap,
    //       yearRegionMap,
    //       speciesRegions
    //     );
    //   }
    // }, [selectedSpecies]);
  

    // // Assign year:region for regions
      // if (filteredNAET1[0]) {
      //   yearRegionMap[filteredNAET1[0].Year] = "NA-ET1";
      // }
      // if (filteredNAET2[0]) {
      //   yearRegionMap[filteredNAET2[0].Year] = "NA-ET2";
      // }
      // if (filteredNAET3[0]) {
      //   yearRegionMap[filteredNAET3[0].Year] = "NA-ET3";
      // }

      
      // // Add "all years" key
      // yearRegionMap["all years"] = [
      //   filteredNAET1[0] ? "NA-ET1" : null,
      //   filteredNAET2[0] ? "NA-ET2" : null,
      //   filteredNAET3[0] ? "NA-ET3" : null,
      // ].filter(Boolean); // Remove null values


// Map.jsx popup
////             return (IndexOf(['${currRegions.join("', '")}'], $feature.REG_NEWREG));
  //              return $feature.REG_NEWREG + ', ' + '${currRegions}';

  //var regions = ${JSON.stringify(currRegions)};
  // return IIF($feature.REG_NEWREG in regions, regions, "false");


  // expression: `
  // // Create a dictionary of region details
  // var details = {
  //   ${Object.entries(regionsDetail)
  //     .map(
  //       ([key, value]) =>
  //         `'${key}': '${value
  //           .map(
  //             ({ specificRegionName, ...rest}) =>
  //               `${specificRegionName} (${rest["Source(s)"]})`
  //           )
  //           .join(", ")}'`
  //     )
  //     .join(",")}
  // };

  // Split(details[region], ',')