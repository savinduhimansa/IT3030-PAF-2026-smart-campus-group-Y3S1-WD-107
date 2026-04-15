import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, X, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api/tickets';

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'Low',
    contactDetails: '',
    resourceLocation: '',
    resourceId: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Filter only images
    const images = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (images.length !== selectedFiles.length) {
      setError('Only image files are allowed.');
      return;
    }

    if (files.length + images.length > 3) {
      setError('You can only attach a maximum of 3 images.');
      return;
    }
    
    setError('');
    setFiles(prev => [...prev, ...images].slice(0, 3));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    submitData.append('ticket', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    
    files.forEach(file => {
      submitData.append('files', file);
    });

    try {
      await axios.post(API_URL, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white">
          <button onClick={() => navigate('/tickets')} className="flex items-center text-indigo-100 hover:text-white mb-6 transition-colors font-medium">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight">Submit New Incident</h2>
          <p className="mt-2 text-indigo-100">Describe the issue and our technicians will assist you shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 transition-colors">
                <option value="">Select a category</option>
                <option value="Hardware">Hardware Issue</option>
                <option value="Software">Software Bug</option>
                <option value="Network">Network Connectivity</option>
                <option value="Access">Access/Authentication</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 transition-colors">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resource ID</label>
              <input required type="text" name="resourceId" placeholder="e.g. SRV-001" value={formData.resourceId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 transition-colors" />
            </div>
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Location</label>
              <input required type="text" name="resourceLocation" placeholder="e.g. Server Room A" value={formData.resourceLocation} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Details</label>
              <input required type="text" name="contactDetails" placeholder="Email or Phone" value={formData.contactDetails} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea required name="description" rows="4" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 transition-colors resize-none" placeholder="Provide detailed information about the issue..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments (Max 3 Images)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm justify-center text-gray-600 mt-2">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} disabled={files.length >= 3} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {files.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm bg-indigo-50 text-indigo-700 rounded-lg max-w-[200px]">
                    <span className="truncate w-full font-medium">{file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors bg-white rounded-full p-1 shadow-sm">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group">
              {loading ? 'Submitting...' : (
                <>Submit Ticket <Send size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
