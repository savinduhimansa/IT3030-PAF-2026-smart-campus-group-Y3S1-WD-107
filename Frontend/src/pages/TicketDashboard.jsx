import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/tickets';

export default function TicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const url = filter ? `${API_URL}?status=${filter}` : API_URL;
      const response = await axios.get(url);
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1"><AlertCircle size={14}/> Open</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={14}/> In Progress</span>;
      case 'RESOLVED': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 size={14}/> Resolved</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={14}/> Rejected</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Incident Tickets</h1>
            <p className="text-gray-500 mt-1">Manage and track your IT service requests</p>
          </div>
          <Link to="/tickets/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            <PlusCircle size={20} />
            Create Ticket
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Filter by Status:</span>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Tickets</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-semibold uppercase tracking-wider text-left">
                  <th className="p-5">ID</th>
                  <th className="p-5">Category</th>
                  <th className="p-5 w-1/3">Description</th>
                  <th className="p-5">Priority</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading tickets...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No tickets found.</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-5 font-medium text-gray-900">#{ticket.id}</td>
                      <td className="p-5 text-gray-600">{ticket.category}</td>
                      <td className="p-5">
                        <p className="truncate w-64 text-gray-600">{ticket.description}</p>
                      </td>
                      <td className="p-5 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${ticket.priority === 'High' ? 'bg-red-500' : ticket.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                        {ticket.priority}
                      </td>
                      <td className="p-5">{getStatusBadge(ticket.status)}</td>
                      <td className="p-5 text-right">
                        <Link 
                          to={`/tickets/${ticket.id}`} 
                          className="text-indigo-600 font-medium hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors inline-block"
                        >
                          View Details
                        </Link>
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
}
