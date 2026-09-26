import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, FileImage, FileVideo, Mic, Square, Send, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { saveSituationReport } from '../data/emergencyAssistance';

export default function SituationReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const assistanceId = location.state?.assistanceId ?? new URLSearchParams(location.search).get('assistanceId');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [video, setVideo] = useState(null);
  const [notice, setNotice] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => () => {
    mediaRecorderRef.current?.stream?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!cameraOpen || !cameraStreamRef.current || !videoRef.current) return undefined;
    const video = videoRef.current;
    const stream = cameraStreamRef.current;
    video.srcObject = stream;
    const markReady = () => {
      video.play().catch(() => {});
      setCameraReady(video.videoWidth > 0 && video.videoHeight > 0);
    };
    video.addEventListener('loadedmetadata', markReady);
    if (video.readyState >= 2) markReady();
    return () => video.removeEventListener('loadedmetadata', markReady);
  }, [cameraOpen]);

  function readFile(file, setter) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter({ name: file.name, type: file.type, data: reader.result });
    reader.readAsDataURL(file);
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice('Camera access is not supported by this browser. Use Choose photo instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      cameraStreamRef.current = stream;
      setCameraReady(false);
      setCameraOpen(true);
      setNotice('Camera ready. Position the situation in the frame and capture a photo.');
    } catch (error) {
      setNotice('Camera access was not granted. Use Choose photo instead or check browser permissions.');
    }
  }

  function closeCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraReady(false);
    setCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !cameraReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setNotice('The camera is still starting. Wait for the live preview, then try again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage({ name: 'Captured situation photo.jpg', type: 'image/jpeg', data: canvas.toDataURL('image/jpeg', 0.9) });
    closeCamera();
    setNotice('Photo captured and ready to preview.');
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setNotice('Audio recording is not supported by this browser. You can attach an audio file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => setAudio({ name: 'Recorded situation audio', type: blob.type, data: reader.result });
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setNotice('Recording in progress. Describe the situation clearly, then stop recording.');
    } catch (error) {
      setNotice('Microphone access was not granted. You can attach an audio file instead.');
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setNotice('Recording ready to preview.');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() && !image && !audio && !video) {
      setNotice('Add a written description, photo, audio, or video before sending.');
      return;
    }
    saveSituationReport({ assistanceId, text: text.trim(), image, audio, video });
    setNotice('Your situation report has been sent to officials.');
  }

  return (
    <main className="situation-report-page">
      <header className="situation-report-page__header">
        <Link className="hazard-demo-header__back" to="/hazard-demo"><ArrowLeft size={15} /> Back to hazard scenario</Link>
        <p className="eyebrow">EMERGENCY COMMUNICATION</p>
        <h1>Demonstrate your situation</h1>
        <p>Share details that can help officials understand what is happening around you.</p>
      </header>
      <form className="situation-report-form" onSubmit={handleSubmit}>
        <label><span>Describe what you can see</span><textarea onChange={(event) => setText(event.target.value)} placeholder="Describe blocked roads, injuries, people needing help, or your exact situation." value={text} /></label>
        <div className="situation-report-form__uploads">
          <div className="situation-report-photo-actions"><button className="situation-report-upload" onClick={openCamera} type="button"><Camera size={20} /><span>Take a photo<small>Open device camera</small></span></button><label className="situation-report-upload"><FileImage size={20} /><span>Choose a photo<small>{image?.name ?? 'Select from device'}</small></span><input accept="image/*" capture="environment" onChange={(event) => readFile(event.target.files?.[0], setImage)} type="file" /></label><label className="situation-report-upload"><FileVideo size={20} /><span>Choose a video<small>{video?.name ?? 'Select from device'}</small></span><input accept="video/*" capture="environment" onChange={(event) => readFile(event.target.files?.[0], setVideo)} type="file" /></label></div>
          <div className={`situation-report-audio${isRecording ? ' situation-report-audio--recording' : ''}`}><button aria-label={isRecording ? 'Stop audio recording' : 'Start audio recording'} className="situation-report-audio__record" onClick={isRecording ? stopRecording : startRecording} type="button">{isRecording ? <Square size={18} /> : <Mic size={20} />}</button><span><strong>{isRecording ? 'Recording audio...' : 'Record or choose audio'}</strong><small>{audio?.name ?? 'Tap the microphone to start'}</small></span>{!isRecording && <label className="situation-report-audio__choose">Choose file<input accept="audio/*" onChange={(event) => readFile(event.target.files?.[0], setAudio)} type="file" /></label>}</div>
        </div>
        {cameraOpen && <div className="situation-report-camera"><video autoPlay muted playsInline ref={videoRef} /><div><button className="dashboard-panel__button dashboard-panel__button--primary" disabled={!cameraReady} onClick={capturePhoto} type="button"><Camera size={16} /> {cameraReady ? 'Capture photo' : 'Starting camera...'}</button><button className="dashboard-panel__button" onClick={closeCamera} type="button">Close camera</button></div></div>}
        {image && <div className="situation-report-preview"><div><strong>Photo preview</strong><button aria-label="Remove photo" onClick={() => setImage(null)} type="button"><Trash2 size={14} /></button></div><img alt="Situation preview" onError={() => setNotice('The selected photo could not be previewed, but you can choose another image.')} src={image.data} /></div>}
        {audio && <div className="situation-report-preview situation-report-preview--audio"><div><strong>Audio preview</strong><button aria-label="Remove audio" onClick={() => setAudio(null)} type="button"><Trash2 size={14} /></button></div><audio controls src={audio.data}>Your browser cannot play this audio.</audio></div>}
        {video && <div className="situation-report-preview"><div><strong>Video preview</strong><button aria-label="Remove video" onClick={() => setVideo(null)} type="button"><Trash2 size={14} /></button></div><video controls src={video.data}>Your browser cannot play this video.</video></div>}
        {notice && <p className="situation-report-form__notice" role="status">{notice}</p>}
        <div className="situation-report-form__actions"><button className="dashboard-panel__button" onClick={() => navigate('/hazard-demo')} type="button">Cancel</button><button className="dashboard-panel__button dashboard-panel__button--primary" type="submit"><Send size={16} /> Send situation report</button></div>
      </form>
    </main>
  );
}
