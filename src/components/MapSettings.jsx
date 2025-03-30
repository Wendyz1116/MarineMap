import { useState, useEffect } from "react";
import { FaGear } from "react-icons/fa6";

function MapSettings({
  setDatasetToShow,
  datasetsToShow,
  setBasemap,
  basemap,
}) {
  // Initialize the datasets state based on the passed `datasetsToShow` prop
  const [datasets, setDatasets] = useState({
    nemesisBioregions: false,
    currentRegions: false,
    pastRegions: false,
    nemesisSpecificSites: false,
    rasSites: false,
  });

  // Set the initial state based on the incoming datasetsToShow array
  useEffect(() => {
    const initialDatasets = {
      nemesisBioregions: datasetsToShow["nemesisBioregions"],
      currentRegions: datasetsToShow["currentRegions"],
      pastRegions: datasetsToShow["pastRegions"],
      nemesisSpecificSites: datasetsToShow["nemesisSpecificSites"],
      rasSites: datasetsToShow["rasSites"],
    };
    setDatasets(initialDatasets);
  }, [datasetsToShow]);

  const handleCheckboxChange = (dataset) => {
    const updatedDatasets = {
      ...datasets,
      [dataset]: !datasets[dataset],
    };

    // If either currentRegions or pastRegions are unchecked, uncheck nemesisBioregions
    // If either currentRegions or pastRegions are checked, check nemesisBioregions
    if (dataset === "currentRegions" || dataset === "pastRegions") {
      if (!updatedDatasets.currentRegions && !updatedDatasets.pastRegions) {
        updatedDatasets.nemesisBioregions = false;
      } else if (!updatedDatasets.nemesisBioregions) {
        updatedDatasets.nemesisBioregions = true;
      }
    }

    setDatasets(updatedDatasets);
  };

  const handleBasemapChange = (event) => {
    setBasemap(event.target.value);
  };

  // Save and Cancel logic
  const handleSave = () => {
    setDatasetToShow(datasets);
    document.getElementById("settings_modal").close();
  };

  const handleCancel = () => {
    const initialDatasets = {
      nemesisBioregions: datasetsToShow["nemesisBioregions"],
      currentRegions: datasetsToShow["currentRegions"],
      pastRegions: datasetsToShow["pastRegions"],
      nemesisSpecificSites: datasetsToShow["nemesisSpecificSites"],
      rasSites: datasetsToShow["rasSites"],
    };
    setDatasets(initialDatasets);
    document.getElementById("settings_modal").close();
  };

  return (
    <div className="cursor-pointer">
      <p
        className="text-base-200"
        onClick={() => document.getElementById("settings_modal").showModal()}
      >
        <FaGear />
      </p>
      <dialog id="settings_modal" className="modal items-center justify-center">
        <div className="modal-box text-primary-content w-full">
          <h3 className="font-bold text-lg text-center mb-2 justify-center items-center">
            Settings:
          </h3>
          <div className="flex flex-col">
            <p className="font-semibold">Use dataset:</p>

            <div className="form-control items-start">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasets.nemesisBioregions}
                  onChange={() => {
                    const updatedDatasets = {
                      ...datasets,
                      nemesisBioregions: !datasets.nemesisBioregions,
                      currentRegions: !datasets.nemesisBioregions, // Automatically check current and past when Bioregions is clicked
                      pastRegions: !datasets.nemesisBioregions,
                    };
                    setDatasets(updatedDatasets);
                  }}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Nemesis Bioregions</span>
              </label>
              <label className="label cursor-pointer ml-8">
                <input
                  type="checkbox"
                  checked={datasets.currentRegions}
                  onChange={() => handleCheckboxChange("currentRegions")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Current Regions</span>
              </label>
              <label className="label cursor-pointer ml-8">
                <input
                  type="checkbox"
                  checked={datasets.pastRegions}
                  onChange={() => handleCheckboxChange("pastRegions")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Past Regions</span>
              </label>

              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasets.nemesisSpecificSites}
                  onChange={() => handleCheckboxChange("nemesisSpecificSites")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Nemesis Specific Sites</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasets.rasSites}
                  onChange={() => handleCheckboxChange("rasSites")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">RAS Sites</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold">Basemap:</p>
            <div className="form-control items-start">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={basemap === "satellite"}
                  onChange={() => setBasemap("satellite")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Satellite</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={basemap === "topo-vector"}
                  onChange={() => setBasemap("topo-vector")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Topographic</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={basemap === "oceans"}
                  onChange={() => setBasemap("oceans")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Ocean</span>
              </label>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <button className="btn btn-sm btn-base-200" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default MapSettings;
