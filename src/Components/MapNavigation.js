import React from 'react'
import { useState,useRef,useEffect } from 'react'
import '../App.css'
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import tt from '@tomtom-international/web-sdk-maps';
import Routes from './Routes';
import Stops from './Stops';
const MapNavigation = () => {
  const mapElement = useRef();

const [mapZoom, setMapZoom] = useState(8);
const [routesData,setRoutesData]=useState([])
const [map, setMap] = useState({});
const [editRouteData,setEditRouteData]=useState(null)
useEffect(() => {
  let map = tt.map({
    key: "ne5wf5oUG05BT7XCBtgwXHr6XiKiOgEb",
    container: mapElement.current,
    center: [' ',' '],
    zoom: mapZoom
  });
  setMap(map);
 return () => map.remove();
}, []);

async function getRoute(stops) {

const intermediateStops = stops.map(item=>item.value).join(':');

  const response = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${intermediateStops}/json?key=ne5wf5oUG05BT7XCBtgwXHr6XiKiOgEb`);
  const data = await response.json();
  if (data.detailedError) {
    console.error('Error details:', data.detailedError);
  } else {
    return data;
  }
}


function addRouteToMap(route,stops) {
      const routeLine = route.map(point => [point.longitude, point.latitude]);
    console.log("route",route,routeLine)
      const geojson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeLine
              },
              properties: {}
            }]
          };

          if (map.getLayer('route')) {
          map.removeLayer('route');
        }
        if (map.getSource('route')) {
          map.removeSource('route');
        }
          
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: geojson
            },
            layout: {},
            paint: {
              'line-color': '#888',
              'line-width': 8
            }
          });


    addIconToStops(stops)
      // Fit the map to the route
      const bounds = new tt.LngLatBounds();
      routeLine.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 20 });
}

const addIconToStops=(stops)=>{
  console.log("thsis",stops)
   for(let i=0;i<stops.length;i++){
   if(i===0) addPointerToLocation(stops[i].value,'fas fa-map-marker');
   else if(i===stops.length-1) addPointerToLocation(stops[i].value,'fas fa-home-user');
   else addPointerToLocation(stops[i].value,'fas fa-circle');
}

}

const addPointerToLocation=(coords,icon)=>{
      const [lat, lng] = coords.split(',').map(Number);
      console.log("poiter",lat,lng)
      new tt.Marker({
        element: createMarkerElement(icon)
      })
      .setLngLat([lng, lat])
      .addTo(map);
  }


function createMarkerElement(icon) {
  const passengerMarkerElement = document.createElement("div")
     passengerMarkerElement.className = 'marker-icon';
  passengerMarkerElement.innerHTML =
    `<i class="${icon}"></i>`
    return passengerMarkerElement
}

const onSubmit=async (data)=>{

 if(editRouteData){
       const newRouteData=routesData.map(item=>{
        if(item.id===data.id) return data;
        return item
       })
       setRoutesData(newRouteData);
 }
 else setRoutesData([...routesData,{...data,id:routesData.length}])
console.log("submit",data)
 setEditRouteData(null)
const {stops}=data;

 getRoute(stops).then(data => {

  let route =[];
    
      for(let i=0;i<data.routes[0].legs.length;i++){
        route=[...route,...data.routes[0].legs[i].points]
      }
      addRouteToMap(route,stops);
  }).catch(error => {
    console.error('Error fetching route:', error);
  });

}


const onDeleteRoute=(id)=>{
   const newRouteData=routesData.filter(item=>item.id!==id)
   setRoutesData(newRouteData)
}


const onViewRoute=(id)=>{
  console.log("view Route",id)

}

const onEditRoute=(id)=>{
    const route=routesData.find(item=>item.id===id);
    console.log('edit',route)
    setEditRouteData(route);
}

  return (
    <div className='mapNavigation'>
    <div className='flex flex-col px-10 gap-10 items-start'>
       <Routes  routeData={editRouteData} onSubmit={onSubmit}/>
       <div className='w-full px-5'>
         <h1>Routes Added:</h1>
           {routesData.map((item)=>{
             return(
              <div className='routeData flex flex-row p-2 items-center'> 
                  <h1 className='disabled'>{item.routeName} ({item.routeStatus==='InActive'? 'InActive' : ('Active')})</h1>
                  <div className='flex gap-4 ml-auto'>
                    <button className='button px-2' onClick={()=>onViewRoute(item.id)}>view</button>
                    <button className='button' onClick={()=>onEditRoute(item.id)}>edit</button>
                    <button className='button' onClick={()=>onDeleteRoute(item.id)}>delete</button>
                  </div>
              </div>
             )
           })}
       </div>
    </div>
        <div ref={mapElement} className="mapDiv"></div>
    </div>
  )
}

export default MapNavigation
