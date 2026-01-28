import React, { useEffect, useState } from "react";
import { doctorService } from "../../services/doctorService";
import type { Doctor } from "../../types";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import "./AdminDoctorManagement.css";

export const AdminDoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const data = await doctorService.getAdminDoctors(0, 50);
            setDoctors(data.content);
        } catch (error) {
            console.error("Failed to load doctors", error);
            toast.error("Failed to load doctors list");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        setVerifyingId(id.toString());
        try {
            await doctorService.verifyDoctor(id.toString());
            toast.success("Doctor verified successfully");
            loadDoctors(); // Refresh list
        } catch (error) {
            console.error("Verification failed", error);
            toast.error("Verification failed");
        } finally {
            setVerifyingId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-mgmt">
                <div className="flex justify-center pt-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-mgmt">
            <div className="mgmt-container">
                <div className="mgmt-header animate-fade-in">
                    <h1 className="mgmt-header__title">
                        Doctor <span>Management</span>
                    </h1>
                </div>

                <div className="mgmt-card animate-fade-in animate-delay-1">
                    <div className="table-responsive">
                        <table className="mgmt-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Specialization</th>
                                    <th>License</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400">
                                            No doctors found.
                                        </td>
                                    </tr>
                                ) : (
                                    doctors.map((doctor) => (
                                        <tr key={doctor.id}>
                                            <td>
                                                <div className="doctor-cell">
                                                    <div className="doctor-cell__avatar">
                                                        {doctor.fullName[0]}
                                                    </div>
                                                    <div className="doctor-cell__content">
                                                        <span className="doctor-cell__name">
                                                            Dr. {doctor.fullName}
                                                        </span>
                                                        <span className="doctor-cell__email">
                                                            {doctor.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-sm text-gray-600">
                                                    {doctor.specialization || "Not set"}
                                                </span>
                                            </td>
                                            <td>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {doctor.licenseNumber || "N/A"}
                                                </code>
                                            </td>
                                            <td>
                                                {doctor.isVerified ? (
                                                    <span className="badge badge--verified">
                                                        <CheckCircle size={12} />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="badge badge--pending">
                                                        <XCircle size={12} />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {!doctor.isVerified && (
                                                    <button
                                                        className="verify-btn"
                                                        onClick={() => handleVerify(doctor.id)}
                                                        disabled={verifyingId === doctor.id.toString()}
                                                    >
                                                        {verifyingId === doctor.id.toString() ? (
                                                            <RefreshCw className="animate-spin" size={14} />
                                                        ) : (
                                                            "Verify"
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
