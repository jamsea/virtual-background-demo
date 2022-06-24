import React, { useCallback } from "react";
import Daily from "@daily-co/daily-js";
import {
  useDaily,
  useDevices,
  useDailyEvent
} from "@daily-co/daily-react-hooks";

import "./styles.css";

console.log("Daily version: %s", Daily.version());

export default function App() {
  const callObject = useDaily();
  const {
    cameras,
    setCamera,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker
  } = useDevices();

  const currentCamera = cameras.find((c) => c.selected);
  const currentMicrophone = microphones.find((m) => m.selected);
  const currentSpeaker = speakers.find((s) => s.selected);

  function toggleBlur() {
    if (!callObject) {
      return;
    }

    callObject
      .updateInputSettings({
        video: {
          processor: {
            type: "background-blur",
            config: { strength: 0.5 }
          }
        }
      })
      .then((foo) => {
        console.log("-- background-blur", foo);
      })
      .catch((err) => {
        console.error("Background blur error:", err);
      });
  }

  // Join the room with the generated token
  const joinRoom = async () => {
    await callObject.join({
      url: "https://hush.daily.co/demo"
    });
    console.log("joined!");
  };

  // handle events
  function meetingJoined(evt) {
    console.log("You joined the meeting: ", evt);
  }
  function participantJoined(evt) {
    console.log("Participant joined meeting: ", evt);
  }
  function updateParticipant(evt) {
    console.log("Participant updated: ", evt);
  }

  // mount the tracks from the track-started events
  function startTrack(evt) {
    console.log("Track started: ", evt);
    if (evt.track.kind === "audio" && evt.participant.local === false) {
      let audiosDiv = document.getElementById("audios");
      let audioEl = document.createElement("audio");
      audiosDiv.appendChild(audioEl);
      audioEl.style.width = "100%";
      audioEl.srcObject = new MediaStream([evt.track]);
      audioEl.play();
      console.log("audioEl: ", audioEl);
    } else if (evt.track.kind === "video") {
      let videosDiv = document.getElementById("videos");
      let videoEl = document.createElement("video");
      videosDiv.appendChild(videoEl);
      videoEl.style.width = "100%";
      videoEl.srcObject = new MediaStream([evt.track]);
      videoEl.play();
      console.log("videoEl: ", videoEl);
    }
  }

  // Listen to track-stopped events and remove the video / audio elements
  function stopTrack(evt) {
    console.log("Track stopped: ", evt);
    if (evt.track.kind === "audio") {
      let audios = document.getElementsByTagName("audio");
      console.log("--- audios", audios);

      for (let audio of audios) {
        console.log(audio);
        audio.remove();
      }
    } else if (evt.track.kind === "video") {
      let vids = document.getElementsByTagName("video");
      // <MediaStream>t
      for (let vid of vids) {
        if (vid.srcObject && vid.srcObject.getVideoTracks()[0] === evt.track) {
          vid.remove();
        }
      }
    }
  }

  // Remove video elements and leave the room
  async function leaveRoom() {
    let vids = document.getElementsByTagName("video");
    for (let vid of vids) {
      vid.remove();
    }
    await callObject.leave();
  }

  // change video device
  async function handleChangeVideoDevice(ev) {
    console.log("!!! changing video device");
    setCamera(ev.target.value);
  }

  // change mic device
  async function handleChangeMicDevice(ev) {
    console.log("!!! changing mic device");
    setMicrophone(ev.target.value);
  }

  // change speaker device
  async function handleChangeSpeakerDevice(ev) {
    console.log("!!! changing speaker device");
    setSpeaker(ev.target.value);
  }

  async function getInputDevices() {
    let inputDevices = await callObject.getInputDevices();
    console.log("List of devices:", inputDevices);
  }

  useDailyEvent("joined-meeting", meetingJoined);

  useDailyEvent("track-started", startTrack);

  useDailyEvent("track-stopped", stopTrack);

  useDailyEvent("participant-joined", participantJoined);

  useDailyEvent("participant-updated", updateParticipant);

  // Error logging for background effects
  useDailyEvent(
    "input-settings-updated",
    useCallback((evt) => {
      console.log("input-settings-updated", evt);
    }, [])
  );

  useDailyEvent(
    "nonfatal-error",
    useCallback((evt) => {
      console.log("nonfatal-error", evt);
    }, [])
  );

  return (
    <>
      <div className="App">
        1. Select your device <br />
        <select
          id="video-devices"
          value={currentCamera?.device?.deviceId}
          onChange={handleChangeVideoDevice}
        >
          {cameras.map((cam) => (
            <option key={cam.device.deviceId} value={cam.device.deviceId}>
              {cam.device.label}
            </option>
          ))}
        </select>
        <br />
        <select
          id="mic-devices"
          value={currentMicrophone?.device?.deviceId}
          onChange={handleChangeMicDevice}
        >
          {microphones.map((microphone) => (
            <option
              key={microphone.device.deviceId}
              value={microphone.device.deviceId}
            >
              {microphone.device.label}
            </option>
          ))}
        </select>
        <br />
        <select
          id="speaker-devices"
          value={currentSpeaker?.device?.deviceId}
          onChange={handleChangeSpeakerDevice}
        >
          {speakers.map((speakers) => (
            <option
              key={speakers.device.deviceId}
              value={speakers.device.deviceId}
            >
              {speakers.device.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        2. Join the call
        <br />
        <button onClick={() => joinRoom()}>Join call</button> <br />
        <br />
        <hr />
        <button onClick={() => toggleBlur()}>Toggle Blur</button>
        <button onClick={() => leaveRoom()}>Leave call</button>
        <br />
        <br />
        <button onClick={() => getInputDevices()}>Input Devices</button> <br />
        <br />
      </div>
      <div id="videos"></div>
      <div id="audios"></div>
    </>
  );
}