import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Edit2, MessageSquare, Image as ImageIcon } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/tickets';
const MOCK_USER_ID = 1; // Assuming logged in user ID is 1 for testing purposes

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      // In a real app we'd fetch a single ticket. Assuming our backend returns all for now and we filter, or we hit a /:id endpoint
      const response = await axios.get(API_URL);
      const found = response.data.find(t => t.id.toString() === id);
      if (found) {
        setTicket(found);
        setStatus(found.status);
        setResolutionNotes(found.resolutionNotes || '');
        setComments(found.comments || []);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, {
        status,
        resolutionNotes
      });
      setTicket(response.data);
      alert('Ticket updated successfully!');
    } catch (error) {
      console.error("Error updating ticket:", error);
      alert('Failed to update ticket. Check console.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${API_URL}/${id}/comments/${commentId}`, {
        headers: { 'X-User-Id': MOCK_USER_ID.toString() }
      });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete comment. You might not be the owner.");
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await axios.put(`${API_URL}/${id}/comments/${commentId}`, 
        { text: editCommentText },
        { headers: { 'X-User-Id': MOCK_USER_ID.toString() } }
      );
      setComments(comments.map(c => c.id === commentId ? { ...c, text: editCommentText } : c));
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error(error);
      alert("Failed to edit comment. You might not be the owner.");
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleAddComment = async () => {
    // This assumes a backend POST comment endpoint exists 
    // If it doesn't, this serves as UI placeholder per requirements
    alert("Add comment logic goes here. Mapped to your hypothetical POST /comments endpoint.");
    const newC = {
       id: Math.random(),
       text: newComment,
       authorId: MOCK_USER_ID,
       temp: true
    };
    setComments([...comments, newC]);
    setNewComment('');
  };

  if (loading) return <div className="min-h-screen pt-20 text-center font-medium text-gray-500 bg-gray-50">Loading ticket #{id}...</div>;
  if (!ticket) return <div className="min-h-screen pt-20 text-center font-medium text-gray-500 bg-gray-50">Ticket not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <button onClick={() => navigate('/tickets')} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Tickets
        </button>

        {/* Header Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket #{ticket.id}</h1>
             <p className="text-gray-500">{ticket.category} • Location: {ticket.resourceLocation} • Resource ID: <span className="font-semibold">{ticket.resourceId}</span></p>
           </div>
           
           <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                 ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                 ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                 ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {ticket.status}
              </span>
              <span className="text-sm font-medium text-gray-500 px-3 border border-gray-200 rounded-lg py-1">Priority: {ticket.priority}</span>
           </div>
        </div>

        {/* Content & Technician Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              
              {ticket.attachments?.length > 0 && (
                 <div className="mt-8">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider"><ImageIcon size={16}/> Attachments</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                       {ticket.attachments.map((att, idx) => (
                           <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-w-[120px] text-center">
                              <span className="text-xs font-semibold text-indigo-600 truncate block max-w-[100px]">{att.fileName}</span>
                           </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>
            
            {/* Resolution Area (if resolved) */}
            {ticket.resolutionNotes && (
               <div className="bg-green-50/50 p-8 rounded-2xl shadow-sm border border-green-100">
                 <h3 className="text-lg font-bold text-green-900 mb-3 border-b border-green-200/50 pb-3">Resolution Notes</h3>
                 <p className="text-green-800">{ticket.resolutionNotes}</p>
               </div>
            )}
          </div>

          {/* Tech Control Panel */}
          <div className="col-span-1">
             <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 sticky top-6">
                <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2"><Edit2 size={16}/> Technician Panel</h3>
                
                <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2">Update Status</label>
                     <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 bg-white shadow-sm font-medium text-gray-800"
                     >
                       <option value="OPEN">OPEN</option>
                       <option value="IN_PROGRESS">IN PROGRESS</option>
                       <option value="RESOLVED">RESOLVED</option>
                       <option value="REJECTED">REJECTED</option>
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2">Resolution Note (Optional)</label>
                     <textarea 
                        value={resolutionNotes} 
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 bg-white shadow-sm resize-none text-sm"
                        placeholder="Add internal tech notes..."
                        rows="4"
                     ></textarea>
                   </div>
                   
                   <button 
                      onClick={handleUpdateStatus}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
                   >
                     <Save size={18} />
                     Save Changes
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-600" />
            Discussion / Comments
          </h3>
          
          <div className="space-y-4 mb-8">
            {comments.length === 0 ? (
               <p className="text-gray-500 italic">No comments yet. Start the conversation.</p>
            ) : (
               comments.map(comment => (
                 <div key={comment.id} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex justify-between items-start group">
                    <div className="flex-1 mr-4">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            User #{comment.authorId}
                            {comment.authorId === MOCK_USER_ID && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">You</span>}
                          </span>
                       </div>
                       
                       {editingCommentId === comment.id ? (
                           <div className="mt-2">
                             <textarea 
                               value={editCommentText}
                               onChange={(e) => setEditCommentText(e.target.value)}
                               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                               rows="2"
                             />
                             <div className="flex gap-2 mt-2">
                               <button onClick={() => handleEditComment(comment.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors">Save Output</button>
                               <button onClick={() => setEditingCommentId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-medium transition-colors">Cancel</button>
                             </div>
                           </div>
                       ) : (
                         <p className="text-gray-700 mt-1">{comment.text}</p>
                       )}
                    </div>
                    {comment.authorId === MOCK_USER_ID && editingCommentId !== comment.id && (
                       <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => startEdit(comment)} className="text-blue-500 hover:text-blue-700 p-2 bg-white rounded-full shadow-sm transition-colors">
                           <Edit2 size={16} />
                         </button>
                         <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-600 p-2 bg-white rounded-full shadow-sm transition-colors">
                           <Trash2 size={16} />
                         </button>
                       </div>
                    )}
                 </div>
               ))
            )}
          </div>

          <div className="flex gap-4">
             <img src={`https://ui-avatars.com/api/?name=User+${MOCK_USER_ID}&background=4f46e5&color=fff&rounded=true`} alt="User avatar" className="w-10 h-10 rounded-full bg-indigo-100" />
             <div className="flex-1">
               <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment to this ticket..." 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 resize-none text-sm transition-all"
                  rows="3"
               ></textarea>
               <div className="flex justify-end mt-2">
                 <button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm">
                   Post Comment
                 </button>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
