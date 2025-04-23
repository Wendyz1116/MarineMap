import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import "../styles/mapStyle.css";
import MapSettings from "./MapSettings";

function Map({
  allYears = false,
  currRegions = [],
  pastRegions = [],
  regionsDetail,
  nemesisRegionNames,
  currSites = {},
}) {
  //TODO4 fix the popup for the first year region

  // make sure currRegions in a flat array
  currRegions = Array.isArray(currRegions[0]) ? currRegions[0] : currRegions;
  const MapElem = useRef(null);
  const viewRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const graphicsLayerRef = useRef(null);
  const [renderer, setRenderer] = useState(null);
  const lastUpdated = "02/19/2025";

  const [datasetsToShow, setDatasetToShow] = useState({
    nemesisBioregions: true,
    currentRegions: true,
    pastRegions: true,
    nemesisSpecificSites: true,
    rasSites: true,
    obisSites: true,
  });

  //------------------------------//
  // Createing popups for the map //
  //------------------------------//
  // Add styles for the popup
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .esri-popup {
        position: absolute !important;
        z-index: 1000 !important;
        max-width: 300px;
        con
      }
  
      .esri-popup__feature-menu {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
      }

      .esri-popup__content {
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .esri-popup__content-container {
        max-height: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Create the popup template base on unique region details
  const createPopupTemplate = (PopupTemplate, regionsDetail) => {
    return new PopupTemplate({
      // title: "",
      content: [
        {
          type: "text",
          text: `
            <div class="custom-popup">
              <p><strong>{expression/regionName}</strong> ({REG_NEWREG})</p>
              <p><strong>{expression/descriptiveText}</strong></p>{expression/popupContent}
              
            </div>
          `,
        },
      ],
      expressionInfos: [
        {
          name: "regionName",
          title: "name",
          expression: `
            var region = $feature.REG_NEWREG;
            var names = {
              ${Object.entries(nemesisRegionNames)
                .map(([key, value]) => `'${key}': '${value}'`)
                .join(",")}
            };
            return names[region]
          `,
        },
        {
          name: "descriptiveText",
          title: "description",
          expression: `
            var region = $feature.REG_NEWREG;
            var currentRegions = ['${currRegions.join("','")}'];
            var allYears = ${allYears ? "true" : "false"};

            When(
              allYears, 'Years with Records:',
              Includes(currentRegions, region), 'Sources:',
              'Past Region:'
            )
          `,
        },
        {
          name: "popupContent",
          title: "Content",
          expression: `
            var region = $feature.REG_NEWREG;
            var currentRegions = ['${currRegions.join("','")}'];
            var allYears = ${allYears ? "true" : "false"};
            
            var details = {
                ${Object.entries(regionsDetail)
                  .map(
                    ([key, value]) =>
                      `'${key}': '${
                        allYears
                          ? value
                          : value
                              .map(
                                ({ RegionName, ...rest }) =>
                                  `${RegionName} (${rest["Source(s)"].substring(
                                    1
                                  )})`
                              )
                              .join(", ")
                      }'`
                  )
                  .join(", ")}
            };
            
            if (allYears) {
              var detailsInfo = Split(details[region], ","); // Split into an array

              return detailsInfo
            }
            return IIF(
                Includes(currentRegions, region),
                IIF(hasKey(details, region), details[region], 'Source undefined'),
                'Species have been spotted here in the past'
            );
            `,
        },
      ],
    });
  };

  // Add the popups for each year
  useEffect(() => {
    loadModules(["esri/PopupTemplate"], { url: "https://js.arcgis.com/4.25/" })
      .then(([PopupTemplate]) => {
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.popupTemplate = createPopupTemplate(
            PopupTemplate,
            regionsDetail
          );
        }
      })
      .catch((err) => console.error("Error updating popup:", err));
  }, [regionsDetail, geoJsonLayerRef.current, allYears, currRegions]);

  //---------------------------------------------------//
  // Creating the main section of the map with regions //
  //---------------------------------------------------//
  const [basemap, setBasemap] = useState("satellite");

  // Main section to create the whole map
  useEffect(() => {
    loadModules(
      [
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/GeoJSONLayer",
        "esri/PopupTemplate",
        "esri/renderers/UniqueValueRenderer",
        "esri/widgets/Popup",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/geometry/SpatialReference",
      ],
      { url: "https://js.arcgis.com/4.25/" }
    )
      .then(
        ([
          MapView,
          WebMap,
          GeoJSONLayer,
          PopupTemplate,
          UniqueValueRenderer,
          Popup,
          Graphic,
          GraphicsLayer,
          SpatialReference,          
        ]) => {
          // Adding styles for the popup
          // const style = document.createElement("style");
          // style.textContent = `

          // `;
          // document.head.appendChild(style);

          const webmap = new WebMap({ basemap });
          
          // TODO5: Tried defining the Lambert Conformal Conic projection
          // const lambertConformalConic = new SpatialReference({
          //   wkid: 102004, // WKID for North America Lambert Conformal Conic
          // });

          const view = new MapView({
            map: webmap,
            zoom: 3,
            center: [-65, 45],
            container: MapElem.current,
            // spatialReference: lambertConformalConic,
            constraints: {
              minZoom: 2,
            },
            popup: {
              dockEnabled: false,
              collapseEnabled: false,
              // highlightEnabled: true,
              // defaultPopupTemplateEnabled: true,
              // autoReposition: true,
              visibleElements: {
                featureNavigation: true,
                closeButton: true,
              },
              viewModel: {
                actions: {
                  zoom: false,
                },
                actionsMenuEnabled: false,
                includeDefaultActions: false,
              },
            },
          });

          view.popup.dockOptions = {
            buttonEnabled: false, // Hides the dock button
            breakpoint: false, // Disables responsive behavior
            position: "top-right", // Positions the popup where you want
          };

          // view.on("click", (event) => {
          //   console.log("Clicked on map");
          //   view.hitTest(event).then((response) => {
          //     const feature = response.results[0]?.graphic;
          //     if (feature) {
          //       console.log("Feature clicked:", feature.attributes);

          //       console.log("view", view.popup.actions);

          //     }
          //   });
          // });

          const geoJsonLayer = new GeoJSONLayer({
            url: "/data/nemesisBioregions.geojson",
            outFields: ["*"],
            popupEnabled: true, // Explicitly enable popups
            popupTemplate: createPopupTemplate(PopupTemplate, regionsDetail),
          });

          geoJsonLayer.renderer = new UniqueValueRenderer({
            field: "REG_NEWREG",
            uniqueValueInfos: [],
          });

          webmap.add(geoJsonLayer);

          geoJsonLayerRef.current = geoJsonLayer;

          // Create a GraphicsLayer for currSites dots
          const graphicsLayer = new GraphicsLayer();
          webmap.add(graphicsLayer);
          graphicsLayerRef.current = graphicsLayer;

          viewRef.current = view;
        }
      )
      .catch((err) => console.error("Error loading ESRI modules:", err));

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [basemap]);

  // Update map with currRegions and pastRegions
  useEffect(() => {
    if (currRegions.length === 0 && pastRegions.length === 0) return;

    // if (datasetsToShow["nemesisBioregions"] === false) {
    //   if (geoJsonLayerRef.current) {
    //     geoJsonLayerRef.current.visible = false;
    //   }
    //   return;
    // } else {
    //   if (geoJsonLayerRef.current) {
    //     geoJsonLayerRef.current.visible = true;
    //   }
    // }

    let currRegionsToShow = [];
    if (datasetsToShow["currentRegions"] === true) {
      currRegionsToShow = currRegions;
    }

    let pastRegionsToShow = [];
    if (datasetsToShow["pastRegions"] === true) {
      pastRegionsToShow = pastRegions;
    }

    if (geoJsonLayerRef.current) {
      loadModules(["esri/renderers/UniqueValueRenderer"]).then(
        ([UniqueValueRenderer]) => {
          const newRenderer = new UniqueValueRenderer({
            field: "REG_NEWREG",
            uniqueValueInfos: [
              ...pastRegionsToShow.map((region) => ({
                value: region,
                symbol: {
                  type: "simple-fill",
                  color: [147, 192, 209, 0.3], // lighter accent color
                  outline: { color: [147, 192, 209], width: 1 },
                },
              })),
              ...currRegionsToShow.map((region) => ({
                value: region,
                symbol: {
                  type: "simple-fill",
                  color: [102, 129, 174, 0.5], // primary for current regions
                  outline: { color: [102, 129, 174], width: 1 },
                },
              })),
            ],
          });
          setRenderer(newRenderer);
        }
      );
    }
  }, [currRegions, pastRegions, datasetsToShow]);

  useEffect(() => {
    if (geoJsonLayerRef.current && renderer) {
      geoJsonLayerRef.current.renderer = renderer;
    }
  }, [renderer, geoJsonLayerRef.current]);

  //---------------------------------//
  // Adding specific sites to the map //
  //----------------------------------//

  // Update the map by ploting the currSites' locations
  useEffect(() => {
    if (graphicsLayerRef.current) {
      graphicsLayerRef.current.removeAll(); // Clear once at the beginning

      // Plot nemesisSpecificSites if enabled
      if (
        datasetsToShow["nemesisSpecificSites"] === true &&
        currSites["nemesisSpecificSites"]
      ) {
        plotSites(
          { fill: "rgba(147,192,209,1)", outline: "rgba(6,9,14,0.8)" },
          currSites["nemesisSpecificSites"]
        );
      }

      // Plot rasSites if enabled
      if (datasetsToShow["rasSites"] === true && currSites["rasSites"]) {
        plotSites(
          { fill: "rgba(245,200,92, 1)", outline: "rgba(6,9,14,0.8)" },
          currSites["rasSites"]
        );
      }

      if (datasetsToShow["obisSites"] === true && currSites["obisSites"]) {
        plotSites(
          { fill: "rgba(25,200,92, 1)", outline: "rgba(6,9,14,0.8)" },
          currSites["obisSites"]
        );
      }
    }
  }, [graphicsLayerRef.current, currSites, datasetsToShow]);

  /** Plot currSitesToShow sites onto the map in the colors color
   *
   * @param {fill: string, outline: string} colors
   * @param {Array<Object>} currSitesToShow: Array of region objects
   */
  const plotSites = (colors, currSitesToShow) => {
    if (graphicsLayerRef.current) {
      console.log("currSitesToShow:", currSitesToShow);
      if (currSitesToShow.length > 0) {
        loadModules(["esri/Graphic"]).then(([Graphic]) => {
          const siteGraphics = currSitesToShow.map(
            ({
              // "Site Code": id,
              // *TODO1* add location back in?
              // "Site Location": name,
              Longitude: lon,
              Latitude: lat,
            }) => {
              return new Graphic({
                geometry: {
                  type: "point",
                  longitude: parseFloat(lon),
                  latitude: parseFloat(lat),
                },
                symbol: {
                  type: "simple-marker",
                  color: colors["fill"],
                  size: "7px",
                  outline: { color: colors["outline"], width: 0.6 },
                },
                attributes: { name },
                popupTemplate: {
                  title: "<p><strong>{name}<p><strong>",
                  // content: `<p><strong>Site ID:</strong> {id}</p>`,
                },
              });
            }
          );
          graphicsLayerRef.current.addMany(siteGraphics); // Add new graphics
        });
      } else {
        graphicsLayerRef.current.removeAll(); // Clear all graphics if no sites
      }
    }
  };

  // Create a legend showing only datasetsToShow
  const Legend = ({ datasetsToShow }) => {
    const legendItems = [
      {
        key: "currentRegions",
        color: "rgba(102,129,174, 0.5)",
        border: "primary",
        label: "Current Year",
      },
      {
        key: "pastRegions",
        color: "rgba(147,192,209, 0.3)",
        border: "accent",
        label: "Past Years",
      },
      {
        key: "nemesisSpecificSites",
        color: "rgba(147,192,209,0.5)",
        border: "primary-content",
        label: "Nemesis Sites",
      },
      {
        key: "rasSites",
        color: "rgba(245,200,92, 0.5)",
        border: "primary-content",
        label: "RAS Sites",
      },
      {
        key: "obisSites",
        color: "rgba(245,200,92, 0.5)",
        border: "primary-content",
        label: "OBIS Sites",
      },
    ];

    const itemsToShow = legendItems.filter(({ key }) => datasetsToShow[key]);

    if (itemsToShow.length === 0) {
      return (
        <div className="absolute top-4 right-4 bg-base-100 p-2 rounded shadow outline outline-primary">
          <h4 className="text-sm font-semibold">
            Select a database to show in settings
          </h4>
        </div>
      );
    }

    return (
      <div className="absolute top-4 right-4 bg-base-100 p-2 rounded shadow outline outline-primary">
        <h4 className="text-sm font-bold mb-2">Legend:</h4>
        {itemsToShow // Only render items with true value in datasetsToShow
          .map(({ color, border, label }, index) => (
            <div className="flex items-center" key={index}>
              <span
                className={`inline-block w-4 h-4 mr-2 border-2 border-${border}`}
                style={{ backgroundColor: color }}
              ></span>
              <span>{label}</span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-base-100 relative">
      <div className="absolute top-0 left-0 z-10 bg-none p-2">
        <MapSettings
          setDatasetToShow={setDatasetToShow}
          datasetsToShow={datasetsToShow}
          setBasemap={setBasemap}
          basemap={basemap}
        />
      </div>
      <div className="absolute text-xs text-primary-content bottom-0 left-0 z-10 bg-none p-2">
        Data last modified: {lastUpdated}
      </div>

      {/* TODO5: can see the white bkg if zoom out small enough,
  lock the map if so that we can't zoom out too far */}
      <div ref={MapElem} className="h-full"></div>
      {/* Legend */}
      <Legend datasetsToShow={datasetsToShow} />
    </div>
  );
}

export default Map;
