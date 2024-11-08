import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../../contexts/authContext'
import { Navigate, useNavigate } from 'react-router-dom'
import './ProfileC.css';

const ProfileC = () => {
    const {currentUser}=useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments]= useState([]);
    const [newAppointmentDate, setNewAppointmentDate] = useState('');
    const [newAppointmentTime, setNewAppointmentRime] = useState('');
    useEffect(()=>{
        
    })
  return (
    <h1>HOla</h1>
  )
}

export default ProfileC