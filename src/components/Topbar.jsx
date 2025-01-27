import { BsFillInfoCircleFill } from "react-icons/bs";
import { FiMail } from "react-icons/fi";

function Topbar() {
  return (
    <div className="flex flex-row justify-between items-center align-middle w-full border-b-2 h-14 border-primary bg-secondary">
      <img
        src="https://seagrant.mit.edu/wp-content/uploads/2023/05/MITSG_logo_website.png"
        alt="MIT Sea Grant Logo"
        className="h-full p-2 pl-2 cursor-pointer"
      />
      {/* <a
        href="https://seagrant.mit.edu/"
        target="_blank"
        className="h-full p-2 pl-2"
      >
        <img
          src="https://seagrant.mit.edu/wp-content/uploads/2023/05/MITSG_logo_website.png"
          alt="MIT Sea Grant Logo"
          className="h-full p-2 pl-2 cursor-pointer"
        />
      </a> */}
      <div className="flex flex-row text-base-100 gap-x-8 m-4 scroll-m-4 bg-scroll">
        <p className="flex flex-row align-middle gap-1 cursor-pointer">
          <div className=" pt-1">
            <BsFillInfoCircleFill />
          </div>
          {/* You can open the modal using document.getElementById('ID').showModal() method */}
          <p onClick={() => document.getElementById("my_modal_3").showModal()}>
            Info
          </p>
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box text-primary-content">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg mb-2">
                Interactive Database for Marine Invasive Species
              </h3>
              <div className="gap-y-2 flex flex-col">
                <p className="font-semibold">About This Platform</p>
                <p className="">
                  Welcome to our interactive marine invasive species data
                  explorer! This platform is designed to make the spatial
                  distribution of invasive species more accessible and visually
                  engaging for researchers, conservationists, and the public.
                </p>

                <p className="font-semibold">How to Use:</p>
                <p className=""></p>

                <p className="font-semibold">Credit:</p>
                <p className="">
                  This platform is made possible by the valuable datasets
                  provided by: Nemesis, RAS Datasets, and GBIF.
                </p>
              </div>
            </div>
          </dialog>
        </p>
        <p className="flex flex-row align-middle gap-1 cursor-pointer">
          <div className=" pt-1">
            <FiMail />
          </div>
          <p onClick={() => document.getElementById("my_modal_2").showModal()}>
            Contact Us
          </p>
          <dialog id="my_modal_2" className="modal">
            <div className="modal-box text-primary-content">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg mb-2">Get in touch!</h3>
              <div className="gap-y-2 flex flex-col">
                <p className="font-semibold">How to Get Involved</p>
                <p>
                  If you're interested in contributing data, sharing research,
                  or learning more about marine invasive species, feel free to
                  reach out to us. We welcome collaboration and would love to
                  hear from researchers, conservationists, and environmental
                  advocates.
                </p>

                <p className="font-semibold">Contact Information</p>
                <p>
                  You can contact us via email at{" "}
                  <a
                    href="mailto:seagrantinfo@mit.edu"
                    className="text-primary"
                  >
                    seagrantinfo@mit.edu
                  </a>
                  .
                </p>
              </div>
            </div>
          </dialog>
        </p>
      </div>
    </div>
  );
}

export default Topbar;
