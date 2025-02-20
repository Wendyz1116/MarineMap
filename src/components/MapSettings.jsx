import { FaGear } from "react-icons/fa6";

function MapSettings() {
  return (
    <div className="cursor-pointer ">
      <p className="text-primary" onClick={() => document.getElementById("settings_modal").showModal()}>
        <FaGear />
      </p>
      <dialog id="settings_modal" className="modal items-center justify-center">
        <div className="modal-box text-primary-content w-full">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-2 justify-center items-center">Settings:</h3>
          <div className="gap-y-2 flex flex-col">
            <p className="font-semibold">Show dataset:</p>

            <div className="form-control items-start">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Nemesis Bioregions</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="checkbox checkbox-xs mr-2"
                />
                <span className="label-text">Nemesis Specific Sites</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
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
