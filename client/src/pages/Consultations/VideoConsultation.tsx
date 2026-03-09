import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Video,
    PhoneOff,
    Calendar,
    Clock,
    User,
    RotateCcw,
    MessageSquare,
    FileText,
    Save,
    CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { appointmentService } from "../../services/appointmentService";
import { videoCallService } from "../../services/videoCallService";
import { websocketService } from "../../services/websocketService";
import {
    consultationService,
    type ConsultationRequest,
} from "../../services/consultationService";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useChat } from "../../hooks/useChat";
import { VideoCall } from "../../components/VideoCall/VideoCall";
import { ChatPanel } from "../../components/ChatPanel/ChatPanel";
import type { Appointment, Consultation } from "../../types";
import "./VideoConsultation.css";

type CallState = "loading" | "waiting" | "active" | "ended";
type SidebarTab = "chat" | "notes";

export const VideoConsultation: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [callState, setCallState] = useState<CallState>("loading");
    const [wsConnected, setWsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
    const appointmentRef = useRef<Appointment | null>(null);

    // Notes state (doctor only)
    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [symptoms, setSymptoms] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [vitals, setVitals] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    const isDoctor = user?.role === "DOCTOR";
    const currentUserId = user?.id || "";

    const webrtc = useWebRTC({
        appointmentId: appointmentId || "",
        currentUserId,
        isInitiator: isDoctor,
    });

    const chat = useChat({ appointmentId: appointmentId || "" });

    // Load appointment + existing consultation
    useEffect(() => {
        if (!appointmentId) return;
        const load = async () => {
            try {
                const appt = await appointmentService.getAppointmentById(appointmentId);
                setAppointment(appt);
                appointmentRef.current = appt;

                if (appt.status === "IN_PROGRESS" || appt.status === "CONFIRMED") {
                    setCallState("waiting");
                } else {
                    setCallState("ended");
                }

                // Load existing consultation notes (doctor)
                if (isDoctor) {
                    const consult = await consultationService.getConsultationByAppointmentId(appointmentId);
                    if (consult) {
                        setConsultation(consult);
                        setSymptoms(consult.symptoms || "");
                        setDiagnosis(consult.diagnosis || "");
                        setNotes(consult.notes || "");
                        setVitals(consult.vitals || "");
                    }
                }
            } catch {
                toast.error("Failed to load appointment");
                setCallState("ended");
            }
        };
        load();
    }, [appointmentId, isDoctor]);

    // Connect WebSocket
    useEffect(() => {
        websocketService.connect(() => {
            setWsConnected(true);
        });
        return () => {
            websocketService.disconnect();
        };
    }, []);

    // Subscribe to chat once WS connected
    useEffect(() => {
        if (wsConnected) {
            chat.subscribeToChat();
        }
    }, [wsConnected, chat.subscribeToChat]);

    // Listen for call-status changes
    useEffect(() => {
        if (!wsConnected || !appointmentId) return;

        websocketService.subscribe(
            `/topic/call-status/${appointmentId}`,
            (message) => {
                const data = JSON.parse(message.body);
                if (data.status === "IN_PROGRESS") {
                    if (appointmentRef.current) {
                        appointmentRef.current = { ...appointmentRef.current, status: "IN_PROGRESS" };
                        setAppointment(appointmentRef.current);
                    }
                    if (!isDoctor) {
                        setCallState("waiting");
                        toast.info("Doctor has started the call. Click Join to connect!");
                    }
                } else if (data.status === "ENDED") {
                    webrtc.endCall();
                    setCallState("ended");
                    // Patient: auto-navigate to appointments
                    if (!isDoctor) {
                        toast.info("The consultation has ended.");
                        setTimeout(() => navigate("/patient/appointments"), 1500);
                    }
                }
            }
        );

        return () => {
            websocketService.unsubscribe(`/topic/call-status/${appointmentId}`);
        };
    }, [wsConnected, appointmentId, isDoctor, webrtc.endCall, navigate]);

    const handleStartCall = useCallback(async () => {
        if (!appointmentId) return;
        try {
            await videoCallService.startCall(appointmentId);
            await webrtc.startCall();
            setCallState("active");
            toast.success("Call started!");
        } catch (err) {
            console.error("Failed to start call:", err);
            toast.error("Failed to start video call. Please check camera/mic permissions.");
        }
    }, [appointmentId, webrtc]);

    const handleJoinCall = useCallback(async () => {
        try {
            await webrtc.startCall();
            setCallState("active");
            toast.success("Joined the call!");
        } catch (err) {
            console.error("Failed to join call:", err);
            toast.error("Failed to join. Please check camera/mic permissions.");
        }
    }, [webrtc]);

    const handleEndCall = useCallback(async () => {
        webrtc.endCall();
        setCallState("ended");

        if (isDoctor && appointmentId) {
            try {
                await videoCallService.endCall(appointmentId);
            } catch {
                // Ignore — call already ended
            }
        }

        if (!isDoctor) {
            toast.info("The consultation has ended.");
            setTimeout(() => navigate("/patient/appointments"), 1500);
        }
    }, [webrtc, isDoctor, appointmentId, navigate]);

    const handleRestartCall = useCallback(() => {
        setCallState("waiting");
    }, []);

    // Save notes (doctor)
    const handleSaveNotes = useCallback(async () => {
        if (!appointmentId || !isDoctor) return;
        setSavingNotes(true);
        setNotesSaved(false);
        try {
            const data: ConsultationRequest = {
                appointmentId,
                symptoms,
                diagnosis,
                notes: notes || undefined,
                vitals: vitals || undefined,
            };

            if (consultation) {
                const updated = await consultationService.updateConsultation(consultation.id, data);
                setConsultation(updated);
            } else {
                const created = await consultationService.createConsultation(data);
                setConsultation(created);
            }
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 3000);
        } catch {
            toast.error("Failed to save notes");
        } finally {
            setSavingNotes(false);
        }
    }, [appointmentId, isDoctor, consultation, symptoms, diagnosis, notes, vitals]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    const connectionStatus = webrtc.connectionState === "connected"
        ? "connected"
        : webrtc.connectionState === "connecting"
        ? "connecting"
        : "waiting";

    if (callState === "loading") {
        return (
            <div className="video-consultation">
                <div className="vc-loading">
                    <div className="vc-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="video-consultation">
            {/* Top Bar */}
            <div className="vc-topbar">
                <div className="vc-topbar__left">
                    <Link
                        to={isDoctor ? "/doctor/appointments" : "/patient/appointments"}
                        className="vc-topbar__logo"
                    >
                        Elite<span>Docs</span>
                    </Link>
                    {appointment && (
                        <>
                            <div className="vc-topbar__divider" />
                            <div className="vc-topbar__info">
                                <span className="vc-topbar__participant">
                                    <User size={13} />
                                    {isDoctor
                                        ? appointment.patient.fullName
                                        : `Dr. ${appointment.doctor.fullName}`}
                                </span>
                                <span className="vc-topbar__meta">
                                    <Calendar size={12} />
                                    {formatDate(appointment.appointmentDate)}
                                </span>
                                <span className="vc-topbar__meta">
                                    <Clock size={12} />
                                    {appointment.slotTime}
                                </span>
                            </div>
                        </>
                    )}
                </div>
                <div className="vc-topbar__right">
                    {callState === "active" && (
                        <div className={`vc-topbar__status vc-topbar__status--${connectionStatus}`}>
                            <div className="vc-topbar__status-dot" />
                            {connectionStatus === "connected"
                                ? "Connected"
                                : connectionStatus === "connecting"
                                ? "Connecting..."
                                : "Waiting..."}
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="vc-body">
                {/* Video / Waiting / Ended */}
                <div className="vc-video-section">
                    {callState === "waiting" && (
                        <div className="vc-waiting">
                            <div className="vc-waiting__icon">
                                <Video size={44} />
                            </div>
                            <h2>
                                {isDoctor
                                    ? "Ready to Start Consultation"
                                    : appointment?.status === "IN_PROGRESS"
                                    ? "Doctor is Waiting"
                                    : "Waiting for Doctor"}
                            </h2>
                            <p>
                                {isDoctor
                                    ? "Start the video call when you're ready. Your patient will be notified to join."
                                    : appointment?.status === "IN_PROGRESS"
                                    ? "The doctor has started the call. Click Join to connect."
                                    : "The doctor will start the call soon. Please wait."}
                            </p>
                            {isDoctor ? (
                                <button
                                    className="vc-waiting__btn vc-waiting__btn--start"
                                    onClick={handleStartCall}
                                    disabled={!wsConnected}
                                >
                                    <Video size={20} />
                                    Start Video Call
                                </button>
                            ) : appointment?.status === "IN_PROGRESS" ? (
                                <button
                                    className="vc-waiting__btn vc-waiting__btn--join"
                                    onClick={handleJoinCall}
                                    disabled={!wsConnected}
                                >
                                    <Video size={20} />
                                    Join Call
                                </button>
                            ) : null}
                        </div>
                    )}

                    {callState === "active" && (
                        <VideoCall
                            localStream={webrtc.localStream}
                            remoteStream={webrtc.remoteStream}
                            isAudioEnabled={webrtc.isAudioEnabled}
                            isVideoEnabled={webrtc.isVideoEnabled}
                            onToggleAudio={webrtc.toggleAudio}
                            onToggleVideo={webrtc.toggleVideo}
                            onEndCall={handleEndCall}
                            connectionState={webrtc.connectionState}
                        />
                    )}

                    {callState === "ended" && (
                        <div className="vc-ended">
                            <div className="vc-ended__icon">
                                <PhoneOff size={32} />
                            </div>
                            <h2>Consultation Ended</h2>
                            <p>The video consultation has ended.</p>
                            <div className="vc-ended__actions">
                                {isDoctor && (
                                    <>
                                        <button
                                            className="vc-ended__btn vc-ended__btn--outline"
                                            onClick={handleRestartCall}
                                        >
                                            <RotateCcw size={16} />
                                            Restart Call
                                        </button>
                                        <Link
                                            to={`/doctor/consultations/${appointmentId}`}
                                            className="vc-ended__btn vc-ended__btn--primary"
                                        >
                                            <FileText size={16} />
                                            Write Prescription
                                        </Link>
                                    </>
                                )}
                                {!isDoctor && (
                                    <Link
                                        to="/patient/appointments"
                                        className="vc-ended__btn vc-ended__btn--primary"
                                    >
                                        Back to Appointments
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Chat + Notes */}
                <div className="vc-sidebar">
                    <div className="vc-sidebar__tabs">
                        <button
                            className={`vc-sidebar__tab ${activeTab === "chat" ? "vc-sidebar__tab--active" : ""}`}
                            onClick={() => setActiveTab("chat")}
                        >
                            <MessageSquare size={15} />
                            Chat
                        </button>
                        {isDoctor && (
                            <button
                                className={`vc-sidebar__tab ${activeTab === "notes" ? "vc-sidebar__tab--active" : ""}`}
                                onClick={() => setActiveTab("notes")}
                            >
                                <FileText size={15} />
                                Notes
                            </button>
                        )}
                    </div>

                    <div className="vc-sidebar__content">
                        {activeTab === "chat" && (
                            callState === "active" ? (
                                <ChatPanel
                                    messages={chat.messages}
                                    onSendMessage={chat.sendMessage}
                                    currentUserId={currentUserId}
                                />
                            ) : (
                                <div className="vc-chat-disabled">
                                    <MessageSquare size={32} />
                                    <p>Chat will be available once the call starts</p>
                                </div>
                            )
                        )}

                        {activeTab === "notes" && isDoctor && (
                            <div className="vc-notes">
                                <div className="vc-notes__body">
                                    <div className="vc-notes__group">
                                        <label className="vc-notes__label">Symptoms</label>
                                        <textarea
                                            className="vc-notes__textarea"
                                            value={symptoms}
                                            onChange={(e) => setSymptoms(e.target.value)}
                                            placeholder="Patient symptoms..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="vc-notes__group">
                                        <label className="vc-notes__label">Diagnosis</label>
                                        <textarea
                                            className="vc-notes__textarea"
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            placeholder="Your diagnosis..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="vc-notes__group">
                                        <label className="vc-notes__label">Vitals</label>
                                        <input
                                            className="vc-notes__input"
                                            type="text"
                                            value={vitals}
                                            onChange={(e) => setVitals(e.target.value)}
                                            placeholder="BP, Temp, HR..."
                                        />
                                    </div>
                                    <div className="vc-notes__group">
                                        <label className="vc-notes__label">Notes</label>
                                        <textarea
                                            className="vc-notes__textarea"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Additional notes..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="vc-notes__footer">
                                    <button
                                        className="vc-notes__save-btn"
                                        onClick={handleSaveNotes}
                                        disabled={savingNotes || !diagnosis.trim()}
                                    >
                                        {savingNotes ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Save size={14} />
                                                {consultation ? "Update Notes" : "Save Notes"}
                                            </>
                                        )}
                                    </button>
                                    {notesSaved && (
                                        <div className="vc-notes__saved">
                                            <CheckCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                                            Notes saved successfully
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
