// src/hooks/useCamera.js
import { useState, useEffect, useRef } from 'react';

const useCamera = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async (constraints = { 
    video: { 
      facingMode: 'environment',
      width: { ideal: window.innerWidth },
      height: { ideal: window.innerHeight }
    }, 
    audio: false 
  }) => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        stopCamera();
      }
      
      // Request camera permissions
      console.log("Requesting camera access with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Log what tracks we got
      console.log("Camera stream obtained:", stream.getTracks().map(track => ({
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState
      })));
      
      // Save the stream reference
      streamRef.current = stream;
      
      // If we have a video element, attach the stream
      if (videoRef.current) {
        console.log("Attaching stream to video element");
        videoRef.current.srcObject = stream;
        
        // For iOS, we need to play the video as soon as possible and in response to user interaction
        try {
          await videoRef.current.play();
          console.log("Video playback started");
        } catch (playError) {
          console.error("Error starting video playback:", playError);
          // On iOS, we might need user interaction, so we'll handle this gracefully
          if (playError.name === "NotAllowedError") {
            console.log("Playback requires user interaction - will try again when user interacts");
          }
        }
      } else {
        console.warn("No video element reference available");
      }
      
      setHasPermission(true);
      setIsActive(true);
      setError(null);
      return stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Error accessing camera');
      setHasPermission(false);
      setIsActive(false);
      return null;
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera");
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      
      tracks.forEach(track => {
        console.log(`Stopping track: ${track.kind} / ${track.label}`);
        track.stop();
      });
      
      streamRef.current = null;
      
      if (videoRef.current) {
        console.log("Clearing video source");
        videoRef.current.srcObject = null;
      }
      
      setIsActive(false);
    }
  };

  // This will ensure the video plays when added to the DOM (useful for iOS)
  const ensureVideoIsPlaying = async () => {
    if (videoRef.current && videoRef.current.paused && streamRef.current) {
      try {
        console.log("Ensuring video is playing");
        await videoRef.current.play();
      } catch (error) {
        console.warn("Could not auto-play video:", error);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Add a handler for when the video element is ready
  const handleVideoRef = (element) => {
    if (element && element !== videoRef.current) {
      videoRef.current = element;
      
      // If we already have a stream, attach it
      if (streamRef.current) {
        console.log("Video ref changed, reattaching stream");
        element.srcObject = streamRef.current;
        ensureVideoIsPlaying();
      }
    }
  };

  return {
    videoRef,
    handleVideoRef,
    hasPermission,
    error,
    isActive,
    startCamera,
    stopCamera,
    ensureVideoIsPlaying
  };
};

export default useCamera;