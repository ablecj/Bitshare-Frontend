'use client'

import React, { useState } from 'react'
import styles from '@/styles/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppDispatch, useAppSelector } from '@/redux/store';
import {  useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {logIn, logOut} from '@/redux/features/auth-slice';
// import axios from 'axios';
import dotenv from 'dotenv';


interface FormData {
  email: string;
  password: string;
}

dotenv.config();


const Page = () => {

  const router = useRouter();
  const auth = useAppSelector((state)=> state.authReducer)
  const dispatch = useDispatch<AppDispatch>()

 const [formData, setFormData] = useState<FormData>({
  email: '',
  password: ''
 })


 const handleInputChange =(e: React.ChangeEvent<HTMLInputElement>)=> {
    const {name, value} = e.target;
    console.log(value, 'name')
    setFormData({
      ...formData,
      [name]: value
    });
    console.log('Email:', formData.email);
    console.log('Password:', formData.password)
 }


  // login functionality
  const handleLogin = async()=> {
    if(formData.email == '' || formData.password == ''){
      toast.error('please fill all fields !')
      return
    }
   
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    console.log(res, "response");

    let data = await res.json();
    console.log(data,"data")
    if(data.ok) {
      toast.success(data.message);
      getUserData();
    }
    else{
      toast.error('login failed!')
    }
  }

 const getUserData = async()=> {
  let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
    method: 'GET',
    credentials: 'include'
  });
  let data = await res.json();
  if(data.ok) {
    dispatch(logIn(data.data));
    router.push('/myfiles');
  }
  else{
    dispatch(logOut());
  }
 }


  return (
    <div className={styles.authpage}>
      <h1>Login</h1>

      <div className={styles.inputcontainer}>
        <label htmlFor="email">Email</label>
        <input type="email" name='email' id='email' value={formData.email} onChange={handleInputChange} />
      </div>
      <div className={styles.inputcontainer}>
        <label htmlFor="password">Password</label>
        <input type="password" name='password' id='password' value={formData.password} onChange={handleInputChange} />
      </div>

      <button
        className={styles.button1}
        type='button'
        onClick={handleLogin}
      >
        Login
      </button>

      <Link href='/forgotpassword'>
        forgotpassword ?
      </Link>
    </div>
  )
}

export default Page
