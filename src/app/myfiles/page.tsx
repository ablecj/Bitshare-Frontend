'use client'

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/myfiles.module.css";
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { logIn, logOut } from '@/redux/features/auth-slice';
import { usePathname, useRouter } from 'next/navigation';
// import { io } from "socket.io-client";
import { toast } from "react-toastify";

interface File {
  createdAt: string;
  filename: string;
  fileurl: string;
  fileType: string | null;
  recieveremail: string;
  senderemail: string;
  sharedAt: string;
  updatedAt: string;
  _id: string;
}

let socket: any = null;
let apiurl : string = `${process.env.NEXT_PUBLIC_API_URL}` 

const Page = () => {

  const dispatch = useDispatch<AppDispatch>();
  const auth = useAppSelector((state)=> state.authReducer)
  const router = useRouter();

  // state for handke all files 
  const [allFiles, setAllFiles] = useState<File[]>([]);
  // console.log(allFiles, 'allfuiles')
  
  // from backend
  const getAllFiles = async()=> {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/getfiles', {
      method: 'GET',
      credentials: 'include'
    })

    let resjson = await res.json();
    if(resjson.ok){
      // console.log(resjson.data, "resjson data!");
      setAllFiles(resjson.data)
    }
  }

  // function for getting the file type from the file url
  // const getFileType = (fileurl: any) =>{
  //   const extension = fileurl.split('.').pop().toLowerCase();

  //  switch (extension) {
  //   case 'mp4':
  //   case 'avi':
  //   case 'mov': 
  //     return 'video';

  //   case 'jpg':
  //   case 'jpeg': 
  //   case 'png':
  //   case 'gif':
  //     return 'image';
    

  //   case 'pdf':
  //   case 'doc':
  //   case 'docx':
  //   case 'txt':
  //     return 'document';
   
  //   default:
  //     return 'unknown';    
  //  }
  // }

  useEffect(()=> {
    getAllFiles();
  },[])

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

    // useEffect(()=>{
      
    //   socket.on('connect', ()=> {
    //     console.log('FT connected myfiles', socket.id);
    //     setSocketId(socket.id);
    //   })
    
    //   if(auth.user){
    //     socket.emit('joinself', auth.user.email)
    //   }else{
    //     getUserData().then(user => {
    //       socket.emit('joinself', user.email)
    //     }).catch((err)=> {
    //       router.push('/login');
    //     })
    //   }

    //   // notify call 
    //   console.log('Socket connected:', socket.connected);
    //   socket.on('notify', (data:any) => {
    //     console.log(data, "myfiledata");
    //     console.log('New file shared with you', data.from);
    //     toast.info('New file shared with you' + data.from);
    //     getAllFiles();
    //   });
    //   console.log('notify event is emmited')
      
    
    // },[])

  // function for getting the s3Url from the backend
  const getImageUrls3 = async(key: string)=> {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/gets3urlbykey/' + key, {
      method: 'GET',
      credentials: 'include'
    })

    let data = await res.json();

    if(data.ok){
      console.log(data.ok,'data.ok');
      return data.data.signedUrl
    }
    else{
      return null;
    }
  }

  return (
    <div className={styles.allfiles}>
      <table>
        <thead>
          <tr>
            <th>File name</th>
            <th>File Type</th>
            <th>Sender email</th>
            <th>Reciever email</th>
            <th>Shared At</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {allFiles
          .sort((a,b)=> {
            return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
          })
          .map((file, index)=>{
            return (
              <tr key={index}>
                <td>{file.filename}</td>
                <td>
                 
                  {file.fileType }
                </td>
                <td>{file.senderemail}</td>
                <td>{file.recieveremail}</td>
                <td>{new Date(file.sharedAt).toLocaleString()}</td>
                <td> 
                  <svg
                    onClick={async()=> {
                      let s3Url: string|null = await getImageUrls3(file.fileurl);
                      console.log(s3Url)
                      if(s3Url){
                        window.open(s3Url, '_blank')
                      }
                    }}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
