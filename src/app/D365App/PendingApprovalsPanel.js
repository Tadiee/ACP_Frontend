import React, { useEffect, useState } from 'react';
import { TiDocument } from 'react-icons/ti';
import { FaRegClock, FaCheckCircle } from 'react-icons/fa';
import { inter, lexend } from '../../../public/fonts';
import { getFilteredUploads } from './api';
import '../globals.css';
import { MdOutlinePending } from "react-icons/md";

/**
 * Props:
 *   system: string (system to filter by, e.g. 'VPN')
 */
export default function PendingApprovalsPanel({ system }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFilteredUploads(system)
      .then(data => {
        setPending(
          data.filter(doc => (doc.approval_status || '').toLowerCase() === 'pending')
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .slice(0, 3)
        );
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Could not load pending approvals');
        setLoading(false);
      });
  }, [system]);

  if (loading) return <div className="flex items-center justify-center py-6"><FaRegClock className="text-gray-400 animate-spin mr-2" /> <span className="text-gray-400 text-sm">Loading pending approvals...</span></div>;
  if (error) return <div className="flex items-center justify-center py-6 text-red-500 text-sm">{error}</div>;

  if (!pending.length) return (
    <div className="flex flex-col items-center justify-center py-6">
      <FaCheckCircle className="text-green-400 mb-2" size={32} />
      <span className="text-gray-500 text-sm">No documents pending approval.</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-y-auto scrollbar-hide space-y-2">
      {pending.map(doc => (
        <div key={doc.file_id} className={`flex flex-row items-center bg-white/30 backdrop-blur-sm rounded-lg p-3 shadow-sm w-full cursor-pointer scrollbar-hide border border-yellow-100 hover:bg-yellow-50 transition`}> 
          <span className="flex items-center justify-center bg-yellow-100 rounded-full h-12 w-12 mr-3 shadow-sm">
            <MdOutlinePending className="text-yellow-500 text-2xl" />
          </span>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs text-gray-500 font-semibold mb-0.5">Document Name</span>
            <span className={`${inter.className} font-medium truncate text-sm text-gray-900 mb-2`}>{doc.file_name}</span>
            <div className="flex flex-row items-center space-x-2">
              <span className="text-xs text-gray-400 font-semibold">Uploaded:</span>
              <span className="text-xs text-gray-700">{doc.created_date ? new Date(doc.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end ml-3">
            <span className="text-xs text-gray-400 font-semibold mb-1">Status</span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold flex items-center"><span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>Pending</span>
          </div>
        </div>
      ))}
    </div>
  );
}
