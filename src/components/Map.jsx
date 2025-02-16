import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import "../styles/mapStyle.css";

function Map({
  allYears = false,
  currRegions = [],
  pastRegions = [],
  regionsDetail,
  nemesisRegionNames,
  currSites = [],
}) {
  //TODO4 fix the popup for the first year region

  // make sure currRegions in a flat array
  currRegions = Array.isArray(currRegions[0]) ? currRegions[0] : currRegions;
  const MapElem = useRef(null);
  const viewRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const graphicsLayerRef = useRef(null);
  const [renderer, setRenderer] = useState(null);

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
                                ({ specificRegionName, ...rest }) =>
                                  `${specificRegionName} (${rest[
                                    "Source(s)"
                                  ].substring(1)})`
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
        ]) => {
          // Adding styles for the popup
          // const style = document.createElement("style");
          // style.textContent = `

          // `;
          // document.head.appendChild(style);

          const webmap = new WebMap({ basemap: "topo-vector" });

          const view = new MapView({
            map: webmap,
            zoom: 3,
            center: [-65, 45],
            container: MapElem.current,
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
  }, []);

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

  // Update map with currRegions and pastRegions
  useEffect(() => {
    if (currRegions.length === 0 && pastRegions.length === 0) return;

    if (geoJsonLayerRef.current) {
      loadModules(["esri/renderers/UniqueValueRenderer"]).then(
        ([UniqueValueRenderer]) => {
          const newRenderer = new UniqueValueRenderer({
            field: "REG_NEWREG",
            uniqueValueInfos: [
              ...pastRegions.map((region) => ({
                value: region,
                symbol: {
                  type: "simple-fill",
                  color: [147, 192, 209, 0.5], // lighter accent color
                  outline: { color: [147, 192, 209], width: 1 },
                },
              })),
              ...currRegions.map((region) => ({
                value: region,
                symbol: {
                  type: "simple-fill",
                  color: [102, 129, 174, 0.7], // primary for current regions
                  outline: { color: [102, 129, 174], width: 1 },
                },
              })),
            ],
          });
          setRenderer(newRenderer);
        }
      );
    }
  }, [currRegions, pastRegions]);

  useEffect(() => {
    if (geoJsonLayerRef.current && renderer) {
      geoJsonLayerRef.current.renderer = renderer;
    }
  }, [renderer, geoJsonLayerRef.current]);

  useEffect(() => {
    console.log("CREATING POPUP!! with, ", regionsDetail)
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

  // Update the map by ploting the currSites' locations
  useEffect(() => {
    if (graphicsLayerRef.current) {
      if (currSites.length > 0) {
        loadModules(["esri/Graphic"]).then(([Graphic]) => {
          const siteGraphics = currSites.map(
            ({
              "Site Code": id,
              Location: name,
              Longitude: lon,
              Latitude: lat,
            }) => {
              return new Graphic({
                geometry: {
                  type: "point",
                  longitude: parseFloat(lon), // Ensure lon is a number
                  latitude: parseFloat(lat), // Ensure lat is a number
                },
                symbol: {
                  type: "simple-marker",
                  color: "rgba(245,200,92,1)",
                  size: "8px",
                  outline: { color: "rgba(6,9,14,0.8)", width: 0.5 },
                },
                attributes: { id, name },
                popupTemplate: {
                  title: "{name}",
                  content: `<p><strong>Site ID:</strong> {id}</p>`,
                },
              });
            }
          );

          graphicsLayerRef.current.removeAll(); // Clear previous graphics
          graphicsLayerRef.current.addMany(siteGraphics); // Add new graphics
        });
      } else {
        graphicsLayerRef.current.removeAll(); // Clear all graphics if no sites
      }
    }
  }, [graphicsLayerRef.current, currSites]);

  return (
    <div className="h-full w-full bg-base-100 relative">
      {/* TODO5: can see the white bkg if zoom out small enough,
  lock the map if so that we can't zoom out too far */}
      <div ref={MapElem} className="h-full"></div>
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-base-100 p-2 rounded shadow outline outline-primary">
        <h4 className="text-sm font-bold mb-2">Legend</h4>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 mr-2 border-2 border-primary"
            style={{ backgroundColor: "rgba(102,129,174, 0.7)" }}
          ></span>
          <span>Current Year</span>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 mr-2 border-2 border-accent"
            style={{ backgroundColor: "rgba(147,192,209, 0.5)" }}
          ></span>
          <span>Past Years</span>
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-4 h-4 mr-2 border-2 border-primary-content"
            style={{ backgroundColor: "rgba(245,200,92, 0.5)" }}
          ></span>
          <span>RAS Sites</span>
        </div>
      </div>
    </div>
  );
}

export default Map;
