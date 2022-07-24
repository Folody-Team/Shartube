import React, {useState, useEffect} from 'react'
/**
 * 
 * @returns {JSX.Element}
 * Afk time
 */

export default function login() {
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
        <div className="
          w-[100%] 
          mt-[5px]
          flex
          flex-col
        ">
          <label>Email</label>
          <input className="bg-[#212328] w-[100] p-[6px] rounded-[6px] outline-none hover:bg-[#2a2d33]"/>
        </div>
        <div className="
          w-[100%] 
          mt-[5px]      
          flex
          flex-col
        ">
          <label>Password</label>
          <input className="bg-[#212328] w-[100] p-[6px] rounded-[6px] outline-none hover:bg-[#2a2d33]"/>
        </div>
        
        <button className="bg-[#2F4DEE] w-[100%] py-[8px] mt-[20px] rounded-[6px] hover:bg-[#3b58fa]">Login</button>
      </div>
      
    </div>
  )
}
