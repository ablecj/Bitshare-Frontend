'use client'

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/navbar.module.css';
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { logIn, logOut } from '@/redux/features/auth-slice';



const Navbar = () => {

    const dispatch = useDispatch<AppDispatch>();
    const auth = useAppSelector((state)=> state.authReducer);

    const router = useRouter();
    const pathName = usePathname();
    // const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkLogin = async()=> {
      let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/checklogin', {
        method: 'GET',
        credentials: 'include'
      })

      let data = await res.json();
      if(!data.ok){
        dispatch(logOut());
      }
      else{
        getUserData();
      } 
    }

    useEffect(()=> {
      checkLogin();
    },[]);

    const getUserData = async() =>{
      let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      let data = await res.json();
      if(data.ok){
          dispatch(logIn(data.data))
      }else{
        dispatch(logOut());
      }
    }

    const handleLogout = async()=> {
      let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      let data = await res.json();
      if(data.ok){
        dispatch(logOut());
        router.push('/login')
      }
    };


  return (
    <div className={styles.navbar}>
      <h1>BITS</h1>

    {
        auth.isAuth ? (
            <div className={styles.right}>
                <p 
                  onClick={()=>{
                    router.push('/myfiles')
                  }}
                  className={pathName === '/myfiles' ?  styles.active : ''}
                >
                  My Files
                </p>
                <p 
                  onClick={()=>{
                    router.push('/share')
                  }}
                  className={pathName === '/share' ? styles.active : ''}
                >
                Share
                </p>
                <p 
                  onClick={()=>{
                    handleLogout();
                  }}
                >
                Logout
                </p>
            </div>
        ): 
        (
            <div className={styles.right}>
                <p 
                  onClick={()=> {
                    router.push('/login');
                  }}
                  className={pathName === '/login' ? styles.active : ''}
                >
                Login
                </p>
                <p 
                  onClick={()=> {
                    router.push('/signup');
                  }}
                  className={pathName === '/signup' ? styles.active : ""}
                >
                Signup
                </p>
            </div>
        )
    }

    </div>
  )
}

export default Navbar

