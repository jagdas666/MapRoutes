import React from 'react'
import { useState,useRef,useEffect } from 'react'
import '../App.css'
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import tt from '@tomtom-international/web-sdk-maps';
import Routes from './Routes';
import { TABS,ROUTE_STATUS,TABS_VALUE } from '../constant';


const MapNavigation = () => {

const mapElement = useRef();
const [routesData,setRoutesData]=useState([])
const [map, setMap] = useState({});
const [activeTab,setActiveTab]=useState(TABS_VALUE.ADD_ROUTES)
const [editRouteData,setEditRouteData]=useState(null);
const [routesMapsLine,setRoutesMapsLine]=useState([]);
const [markerIcons, setMarkerIcons] = useState([]);


useEffect(() => {
  let map = tt.map({
    key: "ne5wf5oUG05BT7XCBtgwXHr6XiKiOgEb",
    container: mapElement.current,
    center: ['77.7011','12.9569'],
    zoom: 8,
  });
  setMap(map);
 return () => map.remove();
}, []);


const getRoute = async (stops) => {
  const intermediateStops = stops.map(item=>item.value).join(':');
  const response = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${intermediateStops}/json?key=ne5wf5oUG05BT7XCBtgwXHr6XiKiOgEb`);
  const data = await response.json();
  if (data.detailedError) {
    console.error('Error:', data.detailedError);
  } else {
    return data;
 }
}


const addRouteToMap = (route,stops,routeId,routeName,routeStatus) => {
      const routeLine = route.map(point => [point.longitude, point.latitude]);
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
          
        const newLayer = {
            id: routeId,
            type: 'line',
            source: {
              type: 'geojson',
              data: geojson
            },
            layout: {},
            paint: {
              'line-color': routeStatus===ROUTE_STATUS.INACTIVE?'#000000':'#fbae1f',
              'line-width': 5
            }
        }
       map.addLayer(newLayer);

      setRoutesMapsLine([...routesMapsLine, newLayer]);
        
      addIconToStops(stops,routeStatus)
      const bounds = new tt.LngLatBounds();
      routeLine.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 20 });
}

const addIconToStops = (stops, routeStatus) => {
   for(let i=0;i<stops.length;i++){
      if(i===0) addPointerToLocation(stops[i].value,stops[i].stopName,routeStatus,'fas fa-map-marker');
      else if(i===stops.length-1) addPointerToLocation(stops[i].value,stops[i].stopName,routeStatus,'fas fa-home-user');
      else addPointerToLocation(stops[i].value,stops[i].stopName,routeStatus,'fas fa-circle');
  }
}

const addPointerToLocation = (coords, stopName, routeStatus, icon) => {
      const [lat, lng] = coords.split(',').map(Number);
      const iconmarker=new tt.Marker({
        element: createMarkerIcon(icon,stopName,routeStatus)
      })
      .setLngLat([lng, lat])
      .addTo(map);
     setMarkerIcons(prevMarkers => [...prevMarkers, iconmarker]);
}


const createMarkerIcon = (icon, stopName,routeStatus)=> {
    const passengerMarkerElement = document.createElement("div");
    passengerMarkerElement.className = routeStatus===ROUTE_STATUS.ACTIVE? 'marker-icon':'marker-disabled-icon';
    const tooltip = document.createElement("div");
    tooltip.className = 'marker-tooltip';
    tooltip.innerText = stopName;
    passengerMarkerElement.innerHTML = `<i class="${icon}"></i>`;
    passengerMarkerElement.appendChild(tooltip);
    return passengerMarkerElement;
}

const onSubmit = async(data) => {
   if(editRouteData){
       const newRouteData=routesData.map(item=>{
        if(item.routeId===data.routeId) return data;
        return item
       })
      setRoutesData(newRouteData);
       alert('updated route');
   }
   else{
     const doesRouteAlreadyExist=routesData.find((item)=>item.routeId===data.routeId);
     if(doesRouteAlreadyExist) {
      const newRouteData=routesData.map(item=>{
        if(item.routeId===data.routeId) return data;
        return item
       })
      setRoutesData(newRouteData);
      alert('updated route');
     }
    else setRoutesData([...routesData,{...data,id:routesData.length}])
   }

   setEditRouteData(null);


    routesMapsLine.forEach(routeLayer => {
        if (map.getLayer(routeLayer.id)) map.removeLayer(routeLayer.id);
        if (map.getSource(routeLayer.id)) map.removeSource(routeLayer.id);
    });
   removeAllMarkersIcons();


   getRouteData(data);
}

  const removeAllMarkersIcons = () => {
    markerIcons.forEach(marker => marker.remove());
    setMarkerIcons([]);
};

const getRouteData = (data) => {
  const {stops, routeId, routeName, routeStatus} = data;
   getRoute(stops).then(data => {
   let route =[];
      for(let i=0;i<data.routes[0].legs.length;i++){
        route=[...route,...data.routes[0].legs[i].points]
      }
      addRouteToMap(route,stops,routeId,routeName,routeStatus);
  }).catch(error => {
  });
}


const onDeleteRoute = (item) => {
   const newRouteData=routesData.filter(item=>item.id!==item.id)
   setRoutesData(newRouteData);
   if (map.getLayer(item.routeId)) {
           map.removeLayer(item.routeId);
      }
       if (map.getSource(item.routeId)) {
          map.removeSource(item.routeId);
     }
}


const onViewRoute=(route)=>getRouteData(route)

const onEditRoute=(id)=>{
    const route=routesData.find(item=>item.id===id);
    setEditRouteData(route);
    setActiveTab(TABS_VALUE.ADD_ROUTES)
}

const onTabChange=(id)=>setActiveTab(id)

  return (
    <div className='mapNavigation'>
    <div className='flex flex-col px-10 gap-10 items-start w-6/12'>
      <div class="tab">
      {TABS.map((item)=><button style={{
              backgroundColor: activeTab === item.value ? '#fbae1f' : '#fff',
            }} onClick={()=>onTabChange(item.value)}>{item.label}</button>)}
      </div>
       {activeTab===TABS_VALUE.ADD_ROUTES &&  <Routes routeData={editRouteData} onSubmit={onSubmit}/>}
       {activeTab===TABS_VALUE.EDIT_ROUTES && <div className='w-full px-5'>
         <h1>Routes Added:</h1>
           {routesData.map((item)=>{
             return(
              <div className='routeData flex flex-row p-2 items-center'> 
                  <h1 className='disabled'>{item.routeName} ({item.routeStatus==='InActive'? 'InActive' : ('Active')})</h1>
                  <div className='flex gap-4 ml-auto'>
                    <button className='button px-2' onClick={()=>onViewRoute(item)}>view</button>
                    <button className='button' onClick={()=>onEditRoute(item.id)}>edit</button>
                    <button className='button' onClick={()=>onDeleteRoute(item)}>delete</button>
                  </div>
              </div>
             )
           })}
       </div>}
    </div>
        <div ref={mapElement} className="mapDiv"></div>
    </div>
  )
}

export default MapNavigation
