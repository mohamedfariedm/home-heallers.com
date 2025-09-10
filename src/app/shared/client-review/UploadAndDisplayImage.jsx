
import React, { useState } from "react";

const UploadAndDisplayImage = () => {

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div>
      {selectedImage && (
        <div>
          <img
            alt="not found"
            width={"250px"}
            src={URL.createObjectURL(selectedImage)}
          />
          <br />
        </div>
      )}      
      <input
        type="file"
        name="myImage"
        onChange={(event) => {
          const reader=new FileReader()
          const file=event.target.files[0]
          setSelectedImage(file)
          reader.addEventListener("load",()=>{
            console.log(reader.result);
          })
          reader.readAsDataURL(file);
        }}
      />
            <br />

    </div>
  );
};

export default UploadAndDisplayImage;