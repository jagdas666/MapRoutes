import React, { useEffect } from 'react'
import { useState } from 'react'
import './map.css'
import Stops from './Stops'
import { ROUTE_STATUS } from '../constant'


const Routes = ({onSubmit,routeData}) => {

const [routeName,setRouteName]=useState();
const [routeDirection,setRouteDirection]=useState('UP')
const [routeStatus,setRouteStatus]=useState(ROUTE_STATUS.ACTIVE)
const [routeId,setRouteId]=useState();

const initialStopData =
    {
      type: "text",
      id: 0,
      value: "",
      stopId:'',
      stopIdType:"text",
      stopName:'',
      stopNametype:'text'
    }

const [stopsData,setStopsData]=useState([initialStopData]);
  
useEffect(()=>{
  if(routeData){
    const {routeDirection,routeId,routeName,routeStatus,stops}=routeData;
    setRouteName(routeName);
    setRouteDirection(routeDirection);
    setRouteId(routeId);
    setRouteStatus(routeStatus)
    setStopsData(stops)
  }
},[routeData])

const onRouteNameChange=(e)=>setRouteName(e.target.value);
const onRouteIdChange=(e)=>setRouteId(e.target.value);
const onRouteStatusChange=(e)=>setRouteStatus(e.target.value);
const onRouteDirectionChange=(e)=>setRouteDirection(e.target.value)

const onRouteStopsDataChange=(id,data)=>{
    const newStopVal=stopsData.map((item)=>{
        if(item.id===id) return {...item,...data};
        return item;
    })
    setStopsData(newStopVal)
}

const removeStops=(id)=>{
    const newval=stopsData.filter(item=>item.id!=id)
    setStopsData(newval);
}

const onSubmitForm=async (event)=>{
    event.preventDefault();
    event.stopPropagation();
    const RouteData={routeName,routeDirection,routeId,routeStatus,stops: routeDirection==='DOWN'? reverseStopsData(stopsData) : stopsData}
    onSubmit(RouteData);
    setRouteName('');
    setRouteDirection('UP');
    setRouteId('');
    setRouteStatus(ROUTE_STATUS.ACTIVE)
    setStopsData([initialStopData])
}

const reverseStopsData=(stops)=>{
   const reverseStops=stops.reverse();
    let index=0;
      return reverseStops.map((item)=>{
          let id=index;
          index++;
          return {...item,id}
      })
  
}

const onClickAddStops=(event)=>{
    event.preventDefault();
    event.stopPropagation()
    setStopsData([...stopsData,{...initialStopData,id:stopsData.length}])
}

  return (
        <form className='RouteForm' onSubmit={onSubmitForm}>
        <label>
          Route Name:
          <input type="text" value={routeName} onChange={onRouteNameChange} />
        </label>
        <label>
          Route Direction:
         <select id="direction"  value={routeDirection} onChange={onRouteDirectionChange}>
         <option value="UP">UP</option>
         <option value="DOWN">DOWN</option>
        </select>
        </label>
         <label>
          Route Id:
          <input type="text" value={routeId} onChange={onRouteIdChange} />
        </label>
         <label>
          Route Status:
         <select value={routeStatus} id="status" onChange={onRouteStatusChange}>
         <option value="Active">Active</option>
         <option value="InActive">InActive</option>
        </select>
        </label>
        <div className='stopsData'>
         <label style={{width:"100%",padding:"5px"}}>
          <button className='button mb-5'  onClick={onClickAddStops}>Add Stops <i class="fas fa-add"></i></button>
          {stopsData.map((item)=> {
          return(
            <div className='flex items-center'>
           <Stops stopData={item} onRouteStopsDataChange={(data)=>onRouteStopsDataChange(item.id,data)}/>
           <div onClick={(e)=>{
            e.preventDefault();
            e.stopPropagation();
            removeStops(item.id)
           }}>
           <i class="fa fa-minus-circle"></i>
           </div>
            </div>
          )
        })}
         </label>
        </div>
        <input className='submitButton'  disabled={stopsData.length<2} type="submit" value="Submit" />
        </form>
  )
}

export default Routes
