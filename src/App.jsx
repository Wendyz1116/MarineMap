import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./index.css";
import Timeline from "./components/Timeline";
import SpeciesSection from "./pages/SpeciesSection";

// Colors
// primary
// rgb(102,129,174)
// secondary:
// rgb(135,161,194)
// accent:
// rgb(147,192,209)
// base:
// rgb(237,239,244)
// black:
// rgb(6,9,14)


// Soft Coral: rgb(243,163,158)
// Golden Yellow: rgb(245,200,92)



const App = () => {
  return (
    <div className="w-screen h-screen flex flex-col bg-base-100">
      {/* <Navbar /> */}
      {/* <Outlet /> */}
      <div>
        <Topbar />
      </div>
      <SpeciesSection />
    </div>
  );
};
export default App;
