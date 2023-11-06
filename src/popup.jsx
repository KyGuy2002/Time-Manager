import { useEffect, useState } from "react";
import "./style.scss";
import logoSvg from "data-base64:~assets/logo.svg"

export default function IndexPopup() {
  const [ isActive, setActive ] = useState(false);
  const [ startTime, setStartTime ] = useState();
  const [ refresh, setRefresh ] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setRefresh(!refresh), 1000);
    return () => {
      clearInterval(i);
    }
  })

  useEffect(() => {
    async function handle() {
      const info = await chrome.runtime.sendMessage({ msg: "info" });
      setActive(info.active);
      setStartTime(info.startTime);
    }
    handle();
  }, [])

  async function toggleActive() {
    setActive(!isActive);
    chrome.action.setIcon({imageData: await getIcon(!isActive)})
    chrome.runtime.sendMessage({ msg: "toggle" });

    // Now active (inverse cuz hasn't updated state thing)
    if (!isActive) {
      setStartTime(Date.now());
    }
  }

  function getCurrentTime() {
    const timeDifferenceMs = Date.now() - startTime;

    // Calculate time
    const totalSeconds = Math.floor(timeDifferenceMs / 1000);
    const diffInSeconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const diffInMinutes = totalMinutes % 60;
    const diffInHours = Math.floor(totalMinutes / 60);

    return (
      <>
        <p className="t">{diffInHours.toString().padStart(2, '0')}</p>
        <p className="c">:</p>
        <p className="t">{diffInMinutes.toString().padStart(2, '0')}</p>
        <p className="c">:</p>
        <p className="t">{diffInSeconds.toString().padStart(2, '0')}</p>
      </>
    )
  }

  return (
    <div className="popup" active={isActive.toString()}>

      <div className="inner-box">

        <h1>Time Manager</h1>

        {refresh}

        <div className="timer-section">

          <div className="timer">

            {getCurrentTime()}
            <p className="l">hours</p>
            <p></p>
            <p className="l">minutes</p>
            <p></p>
            <p className="l">seconds</p>

          </div>

        </div>

        <a onClick={() => toggleActive()}>{(isActive ? "pause" : "play")}</a>

      </div>

    </div>
  )

}


async function getIcon(active) {
  const canvas = new OffscreenCanvas(16, 16);
  const context = canvas.getContext('2d');

  const response = await fetch(logoSvg);
  const svgContent = await response.text();

  // Modify the SVG content to change its fill color
  const modifiedSvgContent = svgContent.replace("COLOR-PLACEHOLDER", (active ? "#73e069" : "#e86161"));

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