import React, { useState, useEffect } from 'react';
import { Trash2, Ban, CheckCircle, Eye, AlertTriangle } from 'lucide-react';
// --- CHANGE: Arahkan ke folder components ---
import { CARD_SHADOW } from '../components/Shadows';
import { API_URL } from '../config/api';

const AdminReportView = ({ currentUser, onGoToPost, onGoToUser, onRefresh }) => {
  const [reports, setReports] = useState([]);
  
  const [confirmModal, setConfirmModal] = useState({ 
      isOpen: false, 
      action: null,
      report: null
  });

  useEffect(() => {
      fetchReports();
  }, []);

  const fetchReports = async () => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/admin/reports`, { headers: { 'Authorization': token } });
          if (res.ok) setReports(await res.json());
      } catch (err) { console.error(err); }
  };

  const handleViewContent = (report) => {
      if (report.target_type === 'post') {
          onGoToPost(report.target_id); 
      } else if (report.target_type === 'user') {
          onGoToUser(report.target_id); 
      }
  };

  const triggerAction = (report, action) => {
      setConfirmModal({
          isOpen: true,
          action: action,
          report: report
      });
  };

  const executeAction = async () => {
      const { action, report } = confirmModal;
      if (!report) return;

      const token = localStorage.getItem('token');
      let url = '';
      let method = 'POST';

      if (action === 'ban') url = `${API_URL}/admin/ban-user/${report.target_id}`;
      if (action === 'delete') {
          url = `${API_URL}/admin/delete-content/${report.target_type}/${report.target_id}`;
          method = 'DELETE';
      }
      if (action === 'dismiss') url = `${API_URL}/admin/dismiss-report/${report.id}`;

      try {
          const res = await fetch(url, { method, headers: { 'Authorization': token } });
          if (res.ok) {
              setReports(prev => prev.filter(r => r.id !== report.id)); 
              setConfirmModal({ isOpen: false, action: null, report: null }); 
              
              if (onRefresh) onRefresh();
          }
      } catch (err) { console.error(err); }
  };

  const getModalContent = () => {
      const { action } = confirmModal;
      if (action === 'ban') return { title: 'Ban User?', desc: 'This will restrict the user and delete all their content permanently.', btnColor: 'bg-red-600', btnText: 'Yes, Ban User' };
      if (action === 'delete') return { title: 'Delete Content?', desc: 'This content will be permanently removed.', btnColor: 'bg-red-600', btnText: 'Yes, Delete' };
      if (action === 'dismiss') return { title: 'Dismiss Report?', desc: 'This report will be marked as resolved without action.', btnColor: 'bg-gray-800', btnText: 'Yes, Dismiss' };
      return { title: '', desc: '', btnColor: '', btnText: '' };
  };

  const modalContent = getModalContent();

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 pt-20 md:pt-7 px-4 font-sans animate-in fade-in duration-300">
        <div className="mb-6">
            <h1 className="text-2xl font-black text-black">Admin Reports</h1>
            <p className="text-gray-400 text-sm">Review violations reported by users.</p>
        </div>

        <div className="space-y-4">
            {reports.length === 0 && (
                <div className="bg-white p-12 rounded-[2rem] text-center text-gray-400 border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle size={32} />
                    </div>
                    <p>No pending reports. Great job!</p>
                </div>
            )}

            {reports.map((report) => (
                <div key={report.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:shadow-md transition-shadow">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${report.target_type === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {report.target_type}
                            </span>
                            <span className="text-xs text-gray-400">Reported by <b>@{report.reporter_name}</b></span>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100">
                             <p className="text-sm font-medium text-gray-800 italic">"{report.reason}"</p>
                        </div>

                        <p className="text-[10px] text-gray-400 font-mono">
                            Target ID: {report.target_id} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => handleViewContent(report)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center"><Eye size={16} /> View</button>
                        <div className="w-[1px] h-8 bg-gray-200 mx-1 hidden md:block"></div>
                        <button onClick={() => triggerAction(report, 'dismiss')} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><CheckCircle size={20} /></button>
                        {report.target_type !== 'user' && (<button onClick={() => triggerAction(report, 'delete')} className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>)}
                        {report.target_type === 'user' && (<button onClick={() => triggerAction(report, 'ban')} className="p-2 rounded-xl text-black hover:bg-gray-100 transition-colors"><Ban size={20} /></button>)}
                    </div>
                </div>
            ))}
        </div>
        
        {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({...confirmModal, isOpen: false})}></div>
                <div className={`relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in duration-200 ${CARD_SHADOW}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${confirmModal.action === 'dismiss' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {confirmModal.action === 'dismiss' ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                    </div>
                    <h3 className="text-xl font-black text-black mb-2">{modalContent.title}</h3>
                    <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">{modalContent.desc}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="flex-1 py-3 rounded-xl border border-gray-200 text-black font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={executeAction} className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-colors active:scale-95 ${modalContent.btnColor}`}>{modalContent.btnText}</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminReportView;