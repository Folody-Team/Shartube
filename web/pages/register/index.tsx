import React, {useState, useEffect} from 'react'
import {useMutation} from "@apollo/client";
import client from "../../graphql";
import { registerMutation } from '../../graphql/gql/register';
/**
 * 
 * @returns {JSX.Element}
 * Afk time
 */

export default function register() {
  let username: HTMLInputElement | null;
  let email: HTMLInputElement | null;
  let password: HTMLInputElement | null
  
  /**
   * 
   * 
   * 
   */
  
  const [register] = useMutation(registerMutation);

  
  const [inputContainWidth, setInputContainWidth] = useState(0)

  function widthCaculator(e: Window) {
    const width = Math.floor((e.innerWidth < 768 ? ((93.0989583*e.innerWidth)/100) : ((39.114583333*e.innerWidth)/100)));
    const widthBlock = 1.61803399*width;
    const widthNew = widthBlock/2;

    if (Math.floor(widthNew) !== Math.floor((e.innerWidth-width)/2)) {
      setInputContainWidth(Math.floor((width/e.innerWidth)*100))
    }
  }
  useEffect(() => {
    window.addEventListener('resize', () => {
      widthCaculator(window)
    })
    widthCaculator(window)
  }, [])
  return (
    <div className="
      bg-[#141518] 
      h-[100vh] 
      text-[#B7B7B7]
      flex
      flex-col
      justify-center
      items-center
    ">
      <div className={`
        flex
        flex-col
        justify-center
        items-center
      `} style={{
        width: inputContainWidth+'%'
      }}>
        <h1 className={`
          text-[#e4e4e4]
          text-[2em]
          mb-[20px]
        `}>Register</h1>
        <div className="
          w-[100%] 
          mt-[5px]
          flex
          flex-col
        ">
          <label>Username</label>
          <input id="username" ref={e => {
            username = e
          }} className="bg-[#212328] w-[100] p-[6px] px-[10px] rounded-[6px] outline-none hover:bg-[#2a2d33] mt-[8px]" placeholder='Enter username'/>
        </div>
        <div className="
          w-[100%] 
          mt-[5px]
          flex
          flex-col
        ">
          <label>Email</label>
          <input id="email" ref={e => {
            email = e
          }} className="bg-[#212328] w-[100] p-[6px] px-[10px] rounded-[6px] outline-none hover:bg-[#2a2d33] mt-[8px]" placeholder='Enter email'/>
        </div>
        <div className="
          w-[100%] 
          mt-[5px]      
          flex
          flex-col
        ">
          <label>Password</label>
          <input id="password" ref={e => {
            password = e
          }} className="bg-[#212328] w-[100] p-[6px] px-[10px] rounded-[6px] outline-none hover:bg-[#2a2d33] mt-[8px]" placeholder='Enter password' type='password'/>
        </div>
        
        <button className="bg-[#2F4DEE] w-[100%] py-[8px] mt-[20px] rounded-[6px] hover:bg-[#3b58fa]" onClick={() => {
          if (username && email && password) {
            register({
              variables: {
                email: email.value,
                password: password.value,
                username: username.value
              }
            }).then(res => {
              console.log(res)
            }).catch(err => {
              console.log(err)
            })
          }

          
        }}>Register</button>
      </div>
      
    </div>
  )
}
