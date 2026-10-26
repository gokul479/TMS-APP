import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintService, departmentService, programmeService, blockService, roomService } from '../services/api';
import './MasterScreen.css';

const complaintTypes = [
  'PC Hardware',
  'PC Software',
  'Application Issues',
  'Network',
  'Electronics',
  'Plumbing',
  'Other',
];

const ComplaintFormPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cascading dropdown states: Department -> Programme -> Block -> Room
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  const [programmeId, setProgrammeId] = useState('');
  const [programmes, setProgrammes] = useState([]);

  const [blockId, setBlockId] = useState('');
  const [blocks, setBlocks] = useState([]);

  const [roomId, setRoomId] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [customRoomNumber, setCustomRoomNumber] = useState('');

  // Complaint details
  const [type, setType] = useState(complaintTypes[0]);
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const resp = await departmentService.getAll();
        const data = resp.data;
        const list = Array.isArray(data) ? data : (data?.data || []);
        setDepartments(list);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load departments');
      } finally {
        setLoadingData(false);
      }
    };
    fetchDepartments();
  }, []);

  // 2. Fetch programmes when department changes
  useEffect(() => {
    if (!departmentId) {
      setProgrammes([]);
      setProgrammeId('');
      setBlocks([]);
      setBlockId('');
      setFilteredRooms([]);
      setRoomId('');
      setCustomRoomNumber('');
      return;
    }

    const fetchProgrammes = async () => {
      setLoadingData(true);
      try {
        const resp = await programmeService.getAll({ departmentId });
        const data = resp.data;
        const list = Array.isArray(data) ? data : (data?.data || []);
        setProgrammes(list);
      } catch (err) {
        console.error('Failed to fetch programmes:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load programmes');
      } finally {
        setLoadingData(false);
      }
    };

    fetchProgrammes();
    setProgrammeId('');
    setBlocks([]);
    setBlockId('');
    setFilteredRooms([]);
    setRoomId('');
    setCustomRoomNumber('');
  }, [departmentId]);

  // 3. Fetch blocks when programme changes
  useEffect(() => {
    if (!programmeId) {
      setBlocks([]);
      setBlockId('');
      setFilteredRooms([]);
      setRoomId('');
      setCustomRoomNumber('');
      return;
    }

    const fetchBlocks = async () => {
      setLoadingData(true);
      try {
        const resp = await blockService.getAll({ departmentId, programmeId });
        const data = resp.data;
        const list = Array.isArray(data) ? data : (data?.data || []);
        setBlocks(list);
      } catch (err) {
        console.error('Failed to fetch blocks:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load blocks');
      } finally {
        setLoadingData(false);
      }
    };

    fetchBlocks();
    setBlockId('');
    setFilteredRooms([]);
    setRoomId('');
    setCustomRoomNumber('');
  }, [departmentId, programmeId]);

  // 4. Fetch rooms when block changes
  useEffect(() => {
    if (!blockId) {
      setFilteredRooms([]);
      setRoomId('');
      setCustomRoomNumber('');
      return;
    }

    const fetchRooms = async () => {
      setLoadingData(true);
      try {
        const resp = await roomService.getAll({ blockId, departmentId, programmeId });
        const data = resp.data;
        const list = Array.isArray(data) ? data : (data?.data || []);
        setFilteredRooms(list);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load rooms');
      } finally {
        setLoadingData(false);
      }
    };

    fetchRooms();
    setRoomId('');
    setCustomRoomNumber('');
  }, [blockId, departmentId, programmeId]);

  // SuperAdmin and staff cannot create complaints; only regular Users can
  if (user && user.role === 'SuperAdmin') {
    return (
      <div className="master-screen">
        <div className="card">
          <h2>Raise Complaint</h2>
          <div className="error-message">Super Admin cannot raise complaints.</div>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'User') {
    return (
      <div className="master-screen">
        <div className="card">
          <h2>Raise Complaint</h2>
          <div className="error-message">You do not have permission to raise complaints.</div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const selectedDepartment = departments.find((d) => d._id === departmentId);
    const selectedProgramme = programmes.find((p) => p._id === programmeId);
    const selectedBlock = blocks.find((b) => b._id === blockId);
    const selectedRoom = filteredRooms.find((r) => r._id === roomId);

    const finalRoomNumber = roomId === '__manual__' ? customRoomNumber.trim() : (selectedRoom?.roomNumber || customRoomNumber.trim());

    if (!departmentId) {
      setError('Please select a Department.');
      return;
    }
    if (!programmeId) {
      setError('Please select a Programme.');
      return;
    }
    if (!blockId) {
      setError('Please select a Block.');
      return;
    }
    if (!finalRoomNumber) {
      setError('Please select a Room or enter a Room Number.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('departmentName', selectedDepartment?.name || '');
      formData.append('programmeName', selectedProgramme?.name || '');
      formData.append('blockName', selectedBlock?.name || '');
      formData.append('roomNumber', finalRoomNumber);
      formData.append('complaintType', type);
      formData.append('remarks', remarks);
      if (attachment) formData.append('attachment', attachment);
      if (user?.id) formData.append('userId', user.id);

      await complaintService.create(formData);
      setSuccess('Complaint raised successfully! Redirecting...');
      setTimeout(() => navigate('/complaints'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="master-screen">
      <div className="card">
        <h2>Raise Complaint</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{ color: '#22c55e', marginBottom: 15, fontWeight: '600' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* 1. Department */}
          <label>Department *</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
            disabled={loadingData}
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* 2. Programme */}
          <label>Programme *</label>
          <select
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            required
            disabled={!departmentId || loadingData}
          >
            <option value="">
              {!departmentId ? '-- First select Department --' : programmes.length === 0 ? '-- No Programmes Found --' : '-- Select Programme --'}
            </option>
            {programmes.map((prog) => (
              <option key={prog._id} value={prog._id}>
                {prog.name} ({prog.shortName})
              </option>
            ))}
          </select>

          {/* 3. Block */}
          <label>Block *</label>
          <select
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
            required
            disabled={!programmeId || loadingData}
          >
            <option value="">
              {!programmeId ? '-- First select Programme --' : blocks.length === 0 ? '-- No Blocks Found --' : '-- Select Block --'}
            </option>
            {blocks.map((block) => (
              <option key={block._id} value={block._id}>
                {block.name}
              </option>
            ))}
          </select>

          {/* 4. Room */}
          <label>Room *</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={!blockId || loadingData}
          >
            <option value="">
              {!blockId ? '-- First select Block --' : filteredRooms.length === 0 ? '-- No Rooms Found (Enter Manually) --' : '-- Select Room --'}
            </option>
            {filteredRooms.map((room) => {
              const blockLabel = room.block?.name || (blocks.find((b) => String(b._id) === String(room.block))?.name) || '';
              const label = blockLabel ? `${blockLabel} - Room ${room.roomNumber}` : `Room ${room.roomNumber}`;
              return (
                <option key={room._id} value={room._id}>
                  {label}
                </option>
              );
            })}
            <option value="__manual__">Other (enter manually)</option>
          </select>

          {(roomId === '__manual__' || (blockId && filteredRooms.length === 0)) && (
            <>
              <label>Enter Room Number *</label>
              <input
                value={customRoomNumber}
                onChange={(e) => setCustomRoomNumber(e.target.value)}
                placeholder="e.g. Lab 204 or R-101"
                required
              />
            </>
          )}

          {/* 5. Issue Category */}
          <label>Issue Category *</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            {complaintTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* 6. Description */}
          <label>Description</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Describe the problem in detail..."
            rows={4}
          />

          {/* 7. Attachment */}
          <label>Attachment</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />

          <div />
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintFormPage;
