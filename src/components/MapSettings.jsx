import { useState, useEffect } from "react";
import { FaGear } from "react-icons/fa6";

function MapSettings({ setDatasetToShow, datasetsToShow }) {
  // Initialize the datasets state based on the passed `datasetsToShow` prop
  const [datasets, setDatasets] = useState({
    nemesisBioregions: false,
    nemesisSpecificSites: false,
    rasSites: false,
  });

  // Set the initial state based on the incoming datasetsToShow array
  useEffect(() => {
    const initialDatasets = {
      nemesisBioregions: datasetsToShow["nemesisBioregions"],
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
    setDatasets(updatedDatasets);

    setDatasetToShow(updatedDatasets);
  };

  return (
    <div className="cursor-pointer">
      <p
        className="text-primary"
        onClick={() => document.getElementById("settings_modal").showModal()}
      >
        <FaGear />
      </p>
      <dialog id="settings_modal" className="modal items-center justify-center">
        <div className="modal-box text-primary-content w-full">
          <form method="dialog">
            {/* Close button */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-2 justify-center items-center">
            Settings:
          </h3>
          <div className="gap-y-2 flex flex-col">
            <p className="font-semibold">Show dataset:</p>

            <div className="form-control items-start">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasets.nemesisBioregions}
                  onChange={() => handleCheckboxChange("nemesisBioregions")}
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Nemesis Bioregions</span>
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
        </div>
      </dialog>
    </div>
  );
}

export default MapSettings;
