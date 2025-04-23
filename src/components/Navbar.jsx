import { NavLink } from "react-router-dom";


export default function Navbar() {
  return (
    <div>
      <nav className="flex justify-start gap-8 items-center mb-6">
        <NavLink to="/home">Home</NavLink>

        <NavLink to="/gallery">Gallery</NavLink>

        <NavLink to="/map">Map</NavLink>

        <NavLink to="/contribute">Contribute</NavLink>
      </nav>
    </div>
  );
}
