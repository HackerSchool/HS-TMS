import React from 'react';

function ImageRenderer({ imageData, className, altText = "Some image" }) {
    const dataUrl = `data:image/png;base64,${imageData}`;
    
    return <img src={dataUrl} alt={altText} className={className} />;
}

export default ImageRenderer;