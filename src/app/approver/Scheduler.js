import React, { useState, useRef } from 'react';
import { IoIosRemoveCircleOutline, IoMdAddCircleOutline } from 'react-icons/io';
import { inter } from '../../../public/fonts';
import Image from 'next/image';

const USERS = [
  { id: 1, name: 'User 1', img: '/images/user1.png' },
  { id: 2, name: 'User 2', img: '/images/user2.png' },
  { id: 3, name: 'User 3', img: '/images/user3.png' },
  { id: 4, name: 'User 4', img: '/images/user4.png' },
  { id: 5, name: 'User 5', img: '/images/user5.png' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i * 2); // 0,2,...22
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function Scheduler() {
  const [zoom, setZoom] = useState(1); // 1 = normal, >1 = zoom out
  const [meetings, setMeetings] = useState([
    // Example meeting at day 5, 8am (pixel position)
    { id: 1, day: 5, hour: 8, users: [1] },
  ]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const gridRef = useRef();

  // Current month for header
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  // Remove scroll-based zoom. Only manual zoom via buttons.
  // Custom drag state
  const [draggedMeetingId, setDraggedMeetingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Helper to get grid size
  const BASE_CELL_WIDTH = 80;
  const BASE_CELL_HEIGHT = 40;
  const cellWidth = BASE_CELL_WIDTH * zoom;
  const cellHeight = BASE_CELL_HEIGHT * zoom;
  const gridLeft = 64; // width of time column

  // Zoom configuration
  const ZOOM_STEP = 0.2;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  // Mouse drag handlers
  const handleMeetingMouseDown = (e, id) => {
    e.preventDefault();
    const meeting = meetings.find(m => m.id === id);
    setDraggedMeetingId(id);
    setDragOffset({
      x: e.clientX - ((meeting.day - 1) * cellWidth + gridLeft),
      y: e.clientY - (meeting.hour / 2 * cellHeight),
    });
    setSelectedMeeting(id);
  };

  const handleMouseMove = (e) => {
    if (draggedMeetingId == null) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    // Snap to column start and row start
    const day = Math.min(DAYS.length, Math.max(1, Math.floor((x - gridLeft) / cellWidth) + 1));
    const hour = Math.min(22, Math.max(0, Math.floor(y / cellHeight) * 2));
    setMeetings(ms => ms.map(m => m.id === draggedMeetingId ? { ...m, day, hour } : m));
  };

  const handleMouseUp = (e) => {
    if (draggedMeetingId == null) return;
    setDraggedMeetingId(null);
  };

  // Attach global mouse events
  React.useEffect(() => {
    if (draggedMeetingId != null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  // Manual zoom controls: toggle cell size
  const handleZoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP)); // '+' enlarges cells (zoom in)
  const handleZoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP)); // '-' shrinks cells (zoom out)

  // Drag logic
  const handleDragStart = (e, id) => {
    setMeetings(ms => ms.map(m => m.id === id ? { ...m, dragging: true, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY } : m));
    setSelectedMeeting(id);
  };
  const handleDrag = (e, id) => {
    if (!meetings.find(m => m.id === id).dragging) return;
    const grid = gridRef.current.getBoundingClientRect();
    const x = e.clientX - grid.left - meetings.find(m => m.id === id).offsetX;
    const y = e.clientY - grid.top - meetings.find(m => m.id === id).offsetY;
    // Snap to column start and row start
    const day = Math.min(DAYS.length, Math.max(1, Math.floor(x / zoom / BASE_CELL_WIDTH) + 1));
    const hour = Math.min(22, Math.max(0, Math.floor(y / zoom / BASE_CELL_HEIGHT) * 2));
    setMeetings(ms => ms.map(m => m.id === id ? { ...m, day, hour } : m));
  };
  const handleDragEnd = (e, id) => {
    setMeetings(ms => ms.map(m => m.id === id ? { ...m, dragging: false } : m));
  };

  // Add user to meeting
  const handleAddUser = (userId) => {
    setMeetings(ms => ms.map(m => m.id === selectedMeeting && !m.users.includes(userId) ? { ...m, users: [...m.users, userId] } : m));
  };

  // Add new meeting
  const handleAddMeeting = () => {
    setMeetings(ms => [
      ...ms,
      { id: Date.now(), day: 1, hour: 8, users: [], color: '#3B82F6' }, // default day 1, hour 8
    ]);
  };


  return (
    <div className="flex flex-col relative h-full w-full">
      {/* Sticky heading - OUTSIDE scrollable area */}
      <div className="sticky top-0 z-20 bg-black backdrop-blur px-4 py-2 shadow flex items-center">
        <h1 className={`${inter.className} text-lg font-bold text-white bg-black/40 p-1 rounded-md`}>Schedule a meeting</h1>
      </div>
      {/* Scrollable grid area (days header + grid) */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-auto scroll-smooth">
        {/* Month label row */}
        <div className="flex bg-white border-b border-gray-200 items-center">
          <div className="w-16" />
          <div className={`${inter.className} flex-1 text-center text-blue-500 p-2 text-sm font-semibold`}>{`Month: ${monthName}`}</div>
        </div>
        {/* Days header */}
        <div className="flex flex-row bg-white" style={{ minWidth: DAYS.length * BASE_CELL_WIDTH * zoom }}>
          <div className={`${inter.className} mt-3 text-blue-500 text-center py-1 text-sm `}>Time</div>
          {DAYS.map(day => (
            <div key={day} className={`${inter.className} w-20 text-center border-b border-gray-200`} style={{ width: BASE_CELL_WIDTH * zoom }}>
              {day}
            </div>
          ))}
        </div>
        <div
          className="relative flex-1"
          ref={gridRef}
          style={{ minWidth: DAYS.length * BASE_CELL_WIDTH * zoom, minHeight: HOURS.length * BASE_CELL_HEIGHT * zoom }}
        >
        {/* Time slots + grid */}
        <div className="absolute left-0 top-0 flex flex-row" style={{ minWidth: DAYS.length * BASE_CELL_WIDTH * zoom }}>
          {/* Times */}
          <div className="flex flex-col">
            {HOURS.map(hour => (
              <div key={hour} className="h-10 flex items-center justify-end pr-2 text-xs border-r border-gray-200" style={{ height: cellHeight }}>
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="relative" style={{ minWidth: DAYS.length * BASE_CELL_WIDTH * zoom }}>
            {HOURS.map((hour, hi) => (
              <div key={hour} className="absolute left-0 w-full border-t border-gray-100" style={{ top: hi * BASE_CELL_HEIGHT * zoom, height: 1 }} />
            ))}
            {DAYS.map((day, di) => (
              <div key={day} className="absolute top-0 h-full border-l border-gray-100" style={{ left: di * BASE_CELL_WIDTH * zoom, width: 1 }} />
            ))}
            {/* Meetings */}
            {meetings.map(meeting => {
              return (
                <React.Fragment key={meeting.id}>
                  {/* Color palette above meeting, only for selected meeting */}
                  {selectedMeeting === meeting.id && (
                    <div
                      className="absolute flex flex-row gap-x-1 z-50"
                      style={{
                        left: ((meeting.day - 1) * cellWidth + gridLeft) + (cellWidth / 2),
                        top: (meeting.hour / 2 * cellHeight) - 32, // 32px above the card
                        transform: 'translateX(-50%)',
                      }}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      {["#3B82F6", "#10B981", "#F59E42", "#EF4444", "#A78BFA", "#F472B6"].map(color => (
                        <button
                          key={color}
                          className="w-5 h-5 rounded-full border-2 border-white focus:outline-none shadow"
                          style={{ background: color, borderColor: meeting.color === color ? '#000' : '#fff' }}
                          onClick={e => {
                            e.stopPropagation();
                            setMeetings(ms => ms.map(m => m.id === meeting.id ? { ...m, color } : m));
                          }}
                          title={`Set color ${color}`}
                        />
                      ))}
                    </div>
                  )}
                  <div
                    className={`absolute group rounded-lg shadow-md cursor-move flex items-center justify-center text-white text-xs transition-all duration-300 overflow-visible ${draggedMeetingId === meeting.id ? 'z-20 scale-105' : 'z-10'}`}
                    style={{
                      left: (meeting.day - 1) * cellWidth,
                      top: meeting.hour / 2 * cellHeight,
                      width: cellWidth,
                      height: cellHeight,
                      opacity: draggedMeetingId === meeting.id ? 0.7 : 1,
                      pointerEvents: draggedMeetingId && draggedMeetingId !== meeting.id ? 'none' : 'auto',
                      background: meeting.color || '#3B82F6',
                      padding: 0,
                    }}
                    onMouseDown={e => handleMeetingMouseDown(e, meeting.id)}
                    onClick={() => setSelectedMeeting(meeting.id)}
                  >
                    {/* Unhovered: just show 'Meeting' centered */}
                    <span className="block group-hover:hidden w-full text-center font-semibold select-none">
                      Meeting
                    </span>
                    {/* On hover: expand horizontally to fit content */}
                    <div
                      className="hidden group-hover:flex flex-row items-center whitespace-nowrap gap-3 h-full pl-8 pr-4 relative"
                      style={{
                        width: 'max-content',
                        background: meeting.color || '#3B82F6',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                        height: '100%',
                        alignItems: 'center',
                        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    >
                      {/* Remove meeting button, only visible on hover and inside the expanded card */}
                      <button
                        type="button"
                        className="absolute top-1 left-1 bg-black text-white rounded-full w-3 h-3 flex items-center justify-center text-xs z-50 shadow hover:bg-red-700 opacity-100 transition-opacity duration-200"
                        onClick={e => {
                          e.stopPropagation();
                          setMeetings(ms => ms.filter(m => m.id !== meeting.id));
                        }}
                        title="Remove meeting"
                      >
                        ×
                      </button>
                      <span className={`text-xs ${inter.className} font-bold mr-2`}>Meeting</span>
                      <div className="flex flex-col justify-center items-start mr-2">
                        <span className={`text-xs ${inter.className}`}>Day: {meeting.day}</span>
                        <span className={`text-xs ${inter.className}`}>Time: {(() => {
                          const hours = Math.floor(meeting.hour);
                          const mins = Math.round((meeting.hour - hours) * 60);
                          return `${hours}hrs ${mins} mins`;
                        })()}</span>
                      </div>
                      <div className="flex flex-row space-x-3 ml-2">
                        {meeting.users && meeting.users.map(uid => {

                          const user = USERS.find(u => u.id === uid);

                          if (!user) return null;

                          const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';

                          return (
                            <div key={uid} className="relative group flex items-center w-5">
                              <div className="relative flex flex-col items-center">
                                {user.img ? (
                                  <img src={user.img} alt={user.name} className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 object-cover" />
                                ) : (
                                  <span className="w-5 h-5 rounded-full border-2 border-white bg-blue-400 flex items-center justify-center text-white font-bold text-xs">
                                    {initials}
                                  </span>
                                )}
                                {/* Tooltip on avatar hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 ml-2">
                                  {user.name}
                                </div>
                                {/* Remove button, only visible on hover */}
                                <button
                                  type="button"
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setMeetings(ms => ms.map(m => m.id === meeting.id ? { ...m, users: m.users.filter(u => u !== uid) } : m));
                                  }}
                                  title={`Remove ${user.name}`}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                    </div>
                  </div>
              </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      {/* Controls - sticky bottom bar */}
      <div className="sticky bottom-0 left-0 w-full z-30 bg-white/80 backdrop-blur px-4 py-2 shadow flex flex-row justify-between items-center space-x-2">
        <button onClick={handleAddMeeting} className={`p-2 bg-black text-white text-xs rounded-md hover:bg-gray-300 hover:text-black ${inter.className}`}>Add Meeting</button>
        <div className="flex flex-row justify-between items-center space-x-1 w-[15%]">
          <button onClick={handleZoomIn} className="p-1 rounded-full hover:bg-gray-300"><IoMdAddCircleOutline/></button>
          <button onClick={handleZoomOut} className="p-1 rounded-full hover:bg-gray-300"><IoIosRemoveCircleOutline/></button>
          <span className={`text-xs font-bold ${inter.className}`}>Zoom: {zoom.toFixed(2)}x</span>
        </div>
        {selectedMeeting && (
          <div className="flex items-center space-x-1 w-[25%] h-full">
            <span className={`text-xs ${inter.className}`}>Select User:</span>
            {USERS.map(u => (
              <button key={u.id} onClick={() => handleAddUser(u.id)} className="focus:outline-none">
                <img src={u.img} alt={u.name} className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-blue-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default Scheduler;
