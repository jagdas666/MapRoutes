import React from 'react'
import { useState } from 'react';
import './map.css'
const Stops = ({stopData,onRouteStopsDataChange}) => {


const {id,stopId,stopName,stopIdType,stopNametype,type,value}=stopData

 const onChangeStopName=(e)=>{
    e.stopPropagation();
    e.preventDefault()
    const value=e.target.value;
    onRouteStopsDataChange({...stopData,stopName:value})
 }

 const onChangeStopId=(e)=>{
    e.stopPropagation();
    e.preventDefault()
    const value=e.target.value;
    const id=Number(e.target.id);
  onRouteStopsDataChange({...stopData,stopId:value})
 }

 const onChangeStopCoordinates=(e)=>{
    e.stopPropagation();
    e.preventDefault()
    const value=e.target.value;
    const id=Number(e.target.id);
   onRouteStopsDataChange({...stopData,value,})
 }


  return (
    <div className='stopsContainer'>
        <input id={id} type={stopNametype} placeholder='Stop Name' value={stopName} onChange={onChangeStopName}/>
        <input id={id} type={stopIdType} placeholder='Stop Id' value={stopId} onChange={onChangeStopId}/>
        <input id={id} type={type} placeholder='Stop latitude,longitude' value={value} onChange={onChangeStopCoordinates}/>
    </div>
  )
}

export default Stops
