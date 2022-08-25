import {AiOutlineSearch} from 'react-icons/ai';

type props = {
  styles: any,
  height: string | number;
}

import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sharinput: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
export const MenuBar = ({
  styles,
  height
}: props) => {
  return (
    <div className={`w-[100%] h-[${height}px] bg-[#18191D] flex`} style={{
      width: "100%",
      height: `${height}px`,
      backgroundColor: "#18191D",
      borderBottom: "1px solid #2E2E2E",
      justifyContent: 'space-between',
      minHeight: '53px',
    }}>
      <div style={{
        padding: "8.5px 8px",
      }}>
        <div style={{
          display: "flex",
          height: "100%",
          alignItems: "center",

        }} className={styles.inputSearchContainer}>
          <input placeholder="Search" className={styles.inputSearch}/>
          <span style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0px 9px",
            borderRadius: "0px 8px 8px 0px",
            borderLeft: "1px solid #3D3D3D",
          }} className={styles.inputSearchIconContainer}><AiOutlineSearch className={styles.inputSearchIcon}/></span>
        </div>
        
      </div>
      <div style={{
        padding: '8px',
      }}>
        <div style={{
          height: '100%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: '#25272E'
        }}></div>
      </div>
      
    </div>
  )
}