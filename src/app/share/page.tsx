"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/auth.module.css";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/redux/store';
import {  logIn, logOut } from '@/redux/features/auth-slice';
import { usePathname} from 'next/navigation';
// import { io } from "socket.io-client";


function Page() {

  let socket: any = null;
  let apiurl : string = `${process.env.NEXT_PUBLIC_API_URL}` 
  
  const dispatch = useDispatch<AppDispatch>();
  const auth = useAppSelector((state)=> state.authReducer)
  const router = useRouter();

  // state for files and email
  const [file, setFile] = useState<any>(null); 
  // console.log(file, 'file')
  const [email, setEmail] = useState('');
  const [fileName, setFileName] = useState('');

  // dropzone functionalities
  
  const onDrop = useCallback((acceptedFiles: any) => {
    // console.log(acceptedFiles,"accepted");
    setFile(acceptedFiles[0]);

  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
   
  // function remove file from the useState
  const removeFile = () => {
    setFile(null);
  };
  // function for view file
  const viewFile = () => {

  };

  // state for the file uploading and percentage 
  const [uploading, setUploading] = useState(false);
  // const [percentage, setPercentage] = useState(0);

  // const handleUpload = () =>{
  //   console.log(email);
  //   console.log(fileName);
  //   console.log(file);
  //   // check for the fields
  //   if(!email){
  //     toast.error('please fill all the fields');
  //     return;
  //   }
  //   if(!file){
  //     toast.error('please select the file');
  //     return;
  //   }

  //   let formdata = new FormData();
  //   formdata.append('recieveremail', email);
  //   formdata.append('filename', fileName);

  //   if(file){
  //     formdata.append('clientfile', file);
  //   }

  //   setUploading(true);
  //   let req = new XMLHttpRequest();
  //   req.open('POST', process.env.NEXT_PUBLIC_API_URL + '/file/sharefile', true);
  //   req.withCredentials = true;

  //   // for calculating the percentage
  //   req.upload.addEventListener('progress', (event) => {
  //     if(event.lengthComputable){
  //       const percent  = (event.loaded / event.total) * 100;
  //       setPercentage(Math.round(percent))
  //       console.log(`Upload progress: ${Math.round(percent)} %`);
  //     }
  //   });

  //   req.upload.addEventListener('load', ()=> {
  //     console.log('Upload completed');

  //     toast.success('File Uploaded Successfuly');
  //   });

  //   req.upload.addEventListener('error', (error)=>{
  //     console.log('Upload Failed :', error);
  //     toast.error('File Upload fail');
  //     setUploading(false);
  //   })

  //   req.onreadystatechange = function (){
  //     if(req.readyState === 4){
  //       setUploading(false);
  //       if(req.status === 200){
  //         toast.success('File Shared Successfuly');
  //         socket.emit('uploaded', {
  //           from: auth.user.email,
  //           to: email,
  //         });
  //         console.log('uploaded event emitted');
  //         router.push('/myfiles');
  //       }else{
  //         toast.error('File Uploaded Failed');
  //       }
  //     }
  //   }

  //   req.send(formdata);
  // }

  // calling the generatepostobjecturl api from the backend to get the signedurl 
  const generatepostobjecturl = async () =>{
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/generatepostobjecturl', {
      method: 'GET',
      credentials: 'include',
    })

    let data = await res.json();
    // console.log(data, "data")
    if (data.ok) {
      // console.log(data.data.signedUrl, "signedurl");
      return data.data
    }
    else{
      toast.error('Failed to generate post object url !');
      return null
    }

  }

  // upload s3 url 
  const uploadtos3byurl = async (url: any) =>{
    setUploading(true);

    const options ={
      method: 'PUT',
      body: file
    };

    let res = await fetch(url, options);
    if(res.ok) {
      return true
    }
    else{
      return false
    }
  }

  // handle upload function for the s3
  const handleUpload = async() => {
    setUploading(true);

    let s3urlobject = await generatepostobjecturl();
    // console.log(s3urlobject, 's3urlobject')
    if(!s3urlobject){
      setUploading(false);
      return
    }
    let filekey = s3urlobject.filekey;
    let s3url  = s3urlobject.signedUrl;
    let uploaded = await uploadtos3byurl(s3url);

    if(!uploaded){
      setUploading(false);
      return;
    }
    // toast.success('File uploaded successfuly !')

    // the uploaded file to the s3 bucket then we are trying to save it in our db
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/sharefile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        recieveremail: email,
        filename: fileName,
        filekey: filekey,
        fileType: file.type

      })
    })

    let data = await res.json()
    // console.log(data, 'sharepage')
    setUploading(false);  
    if(data.ok){
      toast.success('File Shared Successfuly !');
      // socket.emit('uploaded', {
      //   from: auth.user.email,
      //   to: email,
      // })
      router.push('/myfiles')
    }
    else{
      toast.error('Failed To Share !');
    }

  }

  
  // const [socketId, setSocketId] = useState<string | null>(null);
  // socket = useMemo(()=> io(apiurl),[]);

 // function for getting  the user data
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
      return data.data
  }else{
    dispatch(logOut());
    router.push('/login');
  }
}

  // useEffect(()=> {
  //   socket.on('connect', ()=>{
  //     console.log('FT connected', socket.id);
  //     setSocketId(socket.id); 
  //   })
  //   if(auth.user){
  //     socket.emit('joinself', auth.user.email)
  //   }else{
  //     getUserData().then(user =>{
  //       socket.emit('joinself', user.email)
  //     }).catch((err)=> {
  //       console.log(err, 'sharepage error');
  //       router.push('/login');
  //     })
  //   }
  // },[])

  return (
    <div className={styles.authpage}>
      <div className={styles.inputcontainer}>
        <label htmlFor="email">Reciever&apos;s Email</label>
        <input
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.inputcontainer}>
        <label htmlFor="filename">File Name</label>
        <input type="text" name="filename" id="filename" value={fileName} onChange={e=> setFileName(e.target.value)} />
      </div>

      <div className={styles.inputcontainer}>
        {
        file ? 
          <div className={styles.filecard}>
            <div className={styles.left}>
              <p>{file.name}</p>
              <p>{(file.size / 1024).toFixed()} KB</p>
            </div>

            <div className={styles.right}>
              {/* svg for the close  */}
              <svg
                onClick={removeFile}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>

              {/* svg for the view  */}
              <svg
                onClick={viewFile}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
          </div>
         : 
         <div className={styles.dropzone}>
          <div {...getRootProps()} >
            <input {...getInputProps()} />
            {
            isDragActive ? 
              <p>Drop the files here ...</p>
             : 
              <div className={styles.droptext}>
                <p>Drag &apos;n&apos; drop some files here</p>
                <p>or</p>
                <p>click here to select the file</p>
              </div>
            }
          </div>
          </div>
        }
        
      </div>

      <button
        onClick={handleUpload}
        type="button"
        className={styles.button1}
      >Send</button>

        {
          uploading && 
          <div className={styles.uploadpopup}>
            {/* <div className={styles.uploadsectionrow}>
              <div className={styles.uploadbar}>
                <div
                  style={{width: `${percentage}%`, height:'100%', backgroundColor: 'lightgreen', borderRadius: '5px'}}
                ></div>
              </div>
              <p>{percentage}%</p>
            </div> */}
            <p>Uploading...</p>
          </div>
        }


    </div>
  );
}

export default Page;
