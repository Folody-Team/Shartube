import React, {useState, useEffect, ChangeEvent} from 'react';

export default function upload() {
  const [img, setImg] = useState([] as any);

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg(e.target.files);
    }
  };

  return (
    <>
      <input type="file" onChange={onImageChange}/>
      <button onClick={() => {
        // convert to base64 string
        
        const reader = new FileReader();
        reader.readAsDataURL(img[0]);
        reader.onload = () => {
          const base64 = reader.result as string;

          const urlencoded = new URLSearchParams({
            "message": base64,
          });
          fetch(`http://localhost:1688/save`, {
            method: 'POST',
            body: urlencoded,
          });
        };
      }}>Upload</button>
    </>
  );
}