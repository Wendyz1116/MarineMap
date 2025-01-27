import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMap = () => {
  useEffect(() => {
    // Initialize the map centered on a location (adjust to your needs)
    const map = L.map('map').setView([51.505, -0.09], 13);  // Default coordinates: London

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Example SVG coordinates (x, y)
    const svgCoordinates = [
      [1501, 573],
      [1494, 584],
      [1495, 587],
      [1487, 597],
      [1484, 610],
    ];

    // Define the bounds of the SVG (you need to adjust this based on your SVG's size)
    const svgBounds = [[0, 0], [2000, 1000]];  // Example bounds, adjust as needed

    // Function to convert SVG coordinates to LatLng (map coordinates)
    function svgToLatLng(svgCoords, svgBounds, map) {
      const latLngs = svgCoords.map(function (coord) {
        const latLng = map.unproject([
          (coord[0] - svgBounds[0][0]) / (svgBounds[1][0] - svgBounds[0][0]) * map.getSize().x,
          (coord[1] - svgBounds[0][1]) / (svgBounds[1][1] - svgBounds[0][1]) * map.getSize().y,
        ]);
        return latLng;
      });
      return latLngs;
    }

    // Convert SVG path coordinates to LatLng
    const latLngArray = svgToLatLng(svgCoordinates, svgBounds, map);

    // Create a polyline using the converted LatLng points and add to the map
    L.polyline(latLngArray, { color: 'red' }).addTo(map);

    // Cleanup function to remove the map when the component is unmounted
    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: '600px', width: '100%' }}></div>;
};

export default LeafletMap;
