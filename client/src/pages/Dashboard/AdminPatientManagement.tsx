import React, { useEffect, useState } from "react";
import { patientService } from "../../services/patientService";
import type { Patient } from "../../types";
import { Users, Search, RefreshCw, Calendar, Droplets, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import "./AdminPatientManagement.css";

export const AdminPatientManagement: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async (query = "") => {
        setLoading(true);
        try {
            let data;
            if (query) {
                data = await patientService.searchPatients(query);
            } else {
                data = await patientService.getAllPatients(0, 50);
            }
            setPatients(data.content);
        } catch (error) {
            console.error("Failed to load patients", error);
            toast.error("Failed to load patients list");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadPatients(searchQuery);
    };

    if (loading && patients.length === 0) {
        return (
            <div className="admin-mgmt">
                <div className="mgmt-container">
                    {/* Skeleton Header */}
                    <div className="mgmt-header">
                        <div>
                            <div className="skeleton-line" style={{ width: '250px', height: '2rem', marginBottom: '0.5rem' }} />
                            <div className="skeleton-line" style={{ width: '380px', height: '1rem' }} />
                        </div>
                    </div>

                    {/* Skeleton Controls */}
                    <div className="mgmt-controls" style={{ marginBottom: '1.5rem' }}>
                        <div className="skeleton" style={{ flex: 1, maxWidth: '400px', height: '44px', borderRadius: '0.75rem' }} />
                        <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '0.75rem' }} />
                    </div>

                    {/* Skeleton Table */}
                    <div className="skeleton-form-card">
                        {/* Skeleton Table Header */}
                        <div className="skeleton-table-row" style={{ borderBottom: '2px solid var(--color-border-subtle)', paddingBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="skeleton-cell" style={{ height: '1rem' }} />
                            ))}
                        </div>
                        {/* Skeleton Table Rows */}
                        {[1, 2, 3, 4, 5, 6].map((row) => (
                            <div key={row} className="skeleton-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                    <div className="skeleton-circle" style={{ width: '36px', height: '36px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton-cell" style={{ width: '60%', marginBottom: '0.25rem' }} />
                                        <div className="skeleton-cell" style={{ width: '80%', height: '0.75rem' }} />
                                    </div>
                                </div>
                                <div className="skeleton-cell" style={{ flex: 0.5 }} />
                                <div className="skeleton-cell" style={{ flex: 0.5 }} />
                                <div className="skeleton-cell" style={{ flex: 0.7 }} />
                                <div className="skeleton-cell" style={{ flex: 1 }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-mgmt">
            <div className="mgmt-container">
                <div className="mgmt-header animate-fade-in">
                    <div>
                        <h1 className="mgmt-header__title">
                            Patient <span>Management</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Manage and view all registered patients on the platform.</p>
                    </div>
                </div>

                <div className="mgmt-controls animate-fade-in animate-delay-1">
                    <form onSubmit={handleSearch} className="search-bar">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-btn">Search</button>
                    </form>
                    <button onClick={() => { setSearchQuery(""); loadPatients(); }} className="refresh-btn">
                        <RefreshCw size={18} />
                    </button>
                </div>

                <div className="mgmt-card animate-fade-in animate-delay-2">
                    <div className="table-responsive">
                        <table className="mgmt-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Blood Group</th>
                                    <th>Gender</th>
                                    <th>DOB</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Users size={48} strokeWidth={1} />
                                                <p>No patients found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    patients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>
                                                <div className="patient-cell">
                                                    <div className="patient-cell__avatar">
                                                        {patient.firstName[0]}
                                                    </div>
                                                    <div className="patient-cell__content">
                                                        <span className="patient-cell__name">
                                                            {patient.firstName} {patient.lastName}
                                                        </span>
                                                        <span className="patient-cell__email">
                                                            {patient.email || "No email"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Droplets size={14} className="text-red-500" />
                                                    <span className="font-semibold">{patient.bloodGroup || "Not set"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 capitalize`}>
                                                    {patient.gender?.toLowerCase() || "Not set"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar size={14} />
                                                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not set"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-start gap-2 text-sm text-gray-600 max-w-xs">
                                                    <MapPin size={14} className="mt-1 flex-shrink-0" />
                                                    <span className="truncate-2-lines">{patient.address || "No address set"}</span>
                                                </div>
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
