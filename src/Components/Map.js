 import './map.css';
 import { useState,useRef,useEffect } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import tt from '@tomtom-international/web-sdk-maps';
import Routes from './Routes';
import axios from 'axios';
function Map() {



const [mapLongitude, setMapLongitude] = useState("80");
const [mapLatitude, setMapLatitude] = useState("12");
const [mapZoom, setMapZoom] = useState(8);
const [map, setMap] = useState({});

useEffect(() => {
  let map = tt.map({
    key: "ne5wf5oUG05BT7XCBtgwXHr6XiKiOgEb",
    container: mapElement.current,
    center: [mapLongitude, mapLatitude],
    zoom: mapZoom
  });
  setMap(map);
 return () => map.remove();
}, []);



const addPointerToLocation=(coords)=>{
    console.log("cor",coords)
      const [lng, lat] = coords.split(',').map(Number);
      new tt.Marker({
        element: createMarkerElement()
      })
      .setLngLat([lng, lat])
      .addTo(map);
  }


function createMarkerElement() {
  const passengerMarkerElement = document.createElement("div")
     passengerMarkerElement.className = 'marker-icon';
  passengerMarkerElement.innerHTML =
    '<i class="fas fa-map-pin"></i>';
    return passengerMarkerElement
}



  return (
    <div className='container'>
    <Routes markLocation={addPointerToLocation} map={map} />
    <div ref={mapElement} className="mapDiv"></div>
    </div>
  );
}

export default Map;
