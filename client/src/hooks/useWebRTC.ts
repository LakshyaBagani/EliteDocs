import { useRef, useState, useCallback, useEffect } from "react";
import { websocketService } from "../services/websocketService";
import type { SignalMessage } from "../types";

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
    ],
};

interface UseWebRTCOptions {
    appointmentId: string;
    currentUserId: string;
    isInitiator: boolean; // doctor is initiator
}

export function useWebRTC({ appointmentId, currentUserId, isInitiator }: UseWebRTCOptions) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [connectionState, setConnectionState] = useState<string>("new");

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
    const hasRemoteDescription = useRef(false);

    const handleSignalMessage = useCallback(
        async (signal: SignalMessage) => {
            // Ignore our own messages
            if (signal.senderUserId === currentUserId) return;

            const pc = pcRef.current;
            if (!pc) return;

            try {
                if (signal.type === "offer") {
                    const offer = JSON.parse(signal.payload);
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    hasRemoteDescription.current = true;

                    // Process pending ICE candidates
                    for (const candidate of pendingCandidates.current) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    pendingCandidates.current = [];

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    websocketService.send(`/app/signal/${appointmentId}`, {
                        type: "answer",
                        appointmentId,
                        payload: JSON.stringify(answer),
                        senderUserId: currentUserId,
                    });
                } else if (signal.type === "answer") {
                    const answer = JSON.parse(signal.payload);
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    hasRemoteDescription.current = true;

                    // Process pending ICE candidates
                    for (const candidate of pendingCandidates.current) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    pendingCandidates.current = [];
                } else if (signal.type === "ice-candidate") {
                    const candidate = JSON.parse(signal.payload);
                    if (hasRemoteDescription.current) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } else {
                        pendingCandidates.current.push(candidate);
                    }
                }
            } catch (err) {
                console.error("Error handling signal:", err);
            }
        },
        [appointmentId, currentUserId]
    );

    const setupPeerConnection = useCallback(
        (stream: MediaStream) => {
            const pc = new RTCPeerConnection(ICE_SERVERS);
            pcRef.current = pc;
            hasRemoteDescription.current = false;
            pendingCandidates.current = [];

            // Add local tracks
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Handle remote tracks
            const remote = new MediaStream();
            setRemoteStream(remote);

            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remote.addTrack(track);
                });
                setRemoteStream(new MediaStream(remote.getTracks()));
            };

            // ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    websocketService.send(`/app/signal/${appointmentId}`, {
                        type: "ice-candidate",
                        appointmentId,
                        payload: JSON.stringify(event.candidate.toJSON()),
                        senderUserId: currentUserId,
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                setConnectionState(pc.connectionState);
            };

            return pc;
        },
        [appointmentId, currentUserId]
    );

    const startCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            setIsCallActive(true);

            const pc = setupPeerConnection(stream);

            // Subscribe to signaling
            websocketService.subscribe(
                `/topic/signal/${appointmentId}`,
                (message) => {
                    const signal: SignalMessage = JSON.parse(message.body);
                    handleSignalMessage(signal);
                }
            );

            // If initiator (doctor), create and send offer
            if (isInitiator) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                websocketService.send(`/app/signal/${appointmentId}`, {
                    type: "offer",
                    appointmentId,
                    payload: JSON.stringify(offer),
                    senderUserId: currentUserId,
                });
            }
        } catch (err) {
            console.error("Failed to start call:", err);
            throw err;
        }
    }, [appointmentId, currentUserId, isInitiator, setupPeerConnection, handleSignalMessage]);

    const endCall = useCallback(() => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        pcRef.current?.close();
        pcRef.current = null;
        localStreamRef.current = null;
        hasRemoteDescription.current = false;
        pendingCandidates.current = [];

        setLocalStream(null);
        setRemoteStream(null);
        setIsCallActive(false);
        setConnectionState("closed");

        websocketService.unsubscribe(`/topic/signal/${appointmentId}`);
    }, [appointmentId]);

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled((prev) => !prev);
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled((prev) => !prev);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            pcRef.current?.close();
        };
    }, []);

    return {
        localStream,
        remoteStream,
        isCallActive,
        isAudioEnabled,
        isVideoEnabled,
        connectionState,
        startCall,
        endCall,
        toggleAudio,
        toggleVideo,
        handleSignalMessage,
    };
}
