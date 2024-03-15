'use client'

import React, { useState } from 'react'
import styles from '@/styles/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';



interface FormData {
    name: string,
    email: string,
    password: string
}

const Page = () => {

  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  })  
  const [otp, setOtp] = useState('');

  // functionality for handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value})
  }

 

  // state for the otp handling
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  // function for otp
  const handleOtp  = async()=>{
    setSendingOtp(true);
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/sendotp', {
      method: 'POST',
      body: JSON.stringify({email: formData.email}),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    let data = await res.json();
    if(data.ok){
      toast.success(data.message);
      setSendingOtp(false);
    }else{
      toast.error(data.message);
    }
  }

   // login functionality
   const handleSignup = async()=> {
      if(formData.name == '' || formData.email == '' || formData.password == '' || otp == ''){
        toast.error("Please fill the fields")
        return 
      }

      let formdata = new FormData();

      formdata.append('name', formData.name);
      formdata.append('email', formData.email);
      formdata.append('password', formData.password);
      formdata.append('otp', otp);

      if(imageFile){
        formdata.append('clientfile', imageFile);
      }

      let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/register', {
        method: 'POST',
        body: formdata,
        credentials: 'include'
      })

      let data = await res.json();
      if(data.ok){
        toast.success('signup successful');
        router.push('/login')
      }
      else{
        toast.error(data.message)
      }
    }


  return (
    <div className={styles.authpage}>
      <h1>Signup</h1>


      <div className={styles.inputcontainer}>
        <label htmlFor="name">Name</label>
        <input type="name" name='name' id='name' value={formData.name} onChange={handleInputChange} />
      </div>

      <div className={styles.inputcontainer}>
        <label htmlFor="name">Profile pic</label>
        <input type="file" name='image' id='image'  onChange={e => setImageFile(e.target.files![0])} />
      </div>
      <div className={styles.inputcontainer1}>
        <label htmlFor="email">Email</label>
        <div className={styles.inputrow}>
          <input type="email" name='email' id='email' value={formData.email} onChange={handleInputChange} />
          {
            !sendingOtp ? <button 
            onClick={handleOtp}
            >Send OTP</button> 
            : <button
              style={{
                backgroundColor: 'gray',
                cursor: 'not-allowed'
              }}
            >sending OTP</button>
          }
        </div>
      </div>


      <div className={styles.inputcontainer}>
        <label htmlFor="otp">OTP</label>
        <input type="password" name='otp' id='otp' value={otp} onChange={(e)=>{setOtp(e.target.value)}} />
      </div>

      <div className={styles.inputcontainer}>
        <label htmlFor="password">Password</label>
        <input type="password" name='password' id='password' value={formData.password} onChange={handleInputChange} />
      </div>

      <button
        className={styles.button1}
        type='button'
        onClick={handleSignup}
      >
        Signup
      </button>

      <Link href='/login'>
        Already have an account ?
      </Link>
    </div>
  )
}

export default Page
