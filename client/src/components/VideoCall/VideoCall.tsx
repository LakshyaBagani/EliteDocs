import React, { useRef, useEffect } from "react";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    User,
} from "lucide-react";
import "./VideoCall.css";

interface VideoCallProps {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
    connectionState: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    onToggleAudio,
    onToggleVideo,
    onEndCall,
    connectionState,
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().length > 0;

    return (
        <div className="video-call">
            {/* Connection Status */}
            <div className="video-call__status">
                <div className="video-call__status-dot" />
                {connectionState === "connected"
                    ? "Connected"
                    : connectionState === "connecting"
                    ? "Connecting..."
                    : "Waiting..."}
            </div>

            {/* Remote Video */}
            {hasRemoteVideo ? (
                <video
                    ref={remoteVideoRef}
                    className="video-call__remote"
                    autoPlay
                    playsInline
                />
            ) : (
                <div className="video-call__remote-placeholder">
                    <div className="video-call__remote-placeholder-icon">
                        <User size={40} />
                    </div>
                    <p>Waiting for the other participant...</p>
                </div>
            )}

            {/* Local Video (PiP) */}
            {localStream && (
                <div className="video-call__local">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                    />
                </div>
            )}

            {/* Controls */}
            <div className="video-call__controls">
                <button
                    className={`video-call__control-btn ${
                        isAudioEnabled
                            ? "video-call__control-btn--default"
                            : "video-call__control-btn--muted"
                    }`}
                    onClick={onToggleAudio}
                    title={isAudioEnabled ? "Mute" : "Unmute"}
                >
                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button
                    className={`video-call__control-btn ${
                        isVideoEnabled
                            ? "video-call__control-btn--default"
                            : "video-call__control-btn--muted"
                    }`}
                    onClick={onToggleVideo}
                    title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                    className="video-call__control-btn video-call__control-btn--end"
                    onClick={onEndCall}
                    title="End call"
                >
                    <PhoneOff size={22} />
                </button>
            </div>
        </div>
    );
};
