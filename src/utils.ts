import logoSvg from "data-base64:~assets/logo.svg"


// Gets the icon image data
export async function getIcon(isActive: boolean) {
    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
  
    const response = await fetch(logoSvg);
    const svgContent = await response.text();
  
    // Modify the SVG content to change its fill color
    const modifiedSvgContent = svgContent.replace("#ffffff", (isActive ? "#73e069" : "#e86161"));
  
    // Create a Blob from the modified SVG content
    const blob = new Blob([modifiedSvgContent], { type: 'image/svg+xml' });
  
    // Create a data URL from the Blob
    const dataUrl = URL.createObjectURL(blob);
  
    // Load the modified SVG image as an Image object
    const img = new Image();
    img.src = dataUrl;
  
    // Wait for the image to load
    await new Promise((resolve) => {
      img.onload = resolve;
    });
  
    context.drawImage(img, 0, 0, 16, 16);
  
    const imageData = context.getImageData(0, 0, 16, 16);
    return imageData;
  }