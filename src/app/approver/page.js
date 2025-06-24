"use client"
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Image from "next/image";
import Chart from 'chart.js/auto';
import { inter, lexend, poppins } from '../../../public/fonts';
import { 
  FaDatabase,
  FaLayerGroup,
  FaUserShield,
  FaServer,
  FaCodeBranch,
  FaHdd,
  FaUserCheck,
  FaNetworkWired,
  FaShieldAlt,
  FaUserCog,
  FaRegUser,
  FaCaretUp,
  FaCaretDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaTimes,
  FaPaperPlane,
  FaComment,
  FaCheck,
  FaSignature,
  FaFont,
  FaUndo,
  FaRedo,
  FaClock,
  FaExpand,
  FaSearch,
} from 'react-icons/fa';
import { FaArrowLeftLong, FaArrowRightLong, FaSquareArrowUpRight, FaDownload } from 'react-icons/fa6';
import "@/app/globals.css";
import { useRouter } from 'next/navigation';
import { BiCog } from "react-icons/bi";
import { HiOutlineBell } from 'react-icons/hi2';
import { CgDanger, CgInsights, CgRemove } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';
import { 
  MdViewList, 
  MdGridView, 
  MdOutlineBarChart, 
  MdOutlineInsights, 
  MdOutlineSchedule,
} from 'react-icons/md';
import { 
  TbSignature,
} from 'react-icons/tb';
import { 
  RiExchangeLine,
} from 'react-icons/ri';
import { 
  IoIosLink, 
  IoMdMenu,
} from 'react-icons/io';
import { 
  IoBarcode, 
  IoFilterCircleOutline,
} from 'react-icons/io5';
import Scheduler from './Scheduler';
import { handleCharts } from '../../../lib/global-api';
import { 
  handleRecentUploads, 
  updateDocumentStatus, 
  addComment, 
  handleLastUpload, 
  handleNumInsights, 
  handleComments 
} from './api';


  
const systemIcons = [
    FaLayerGroup,    // D365 App Layer
    FaDatabase,      // D365 DB Layer
    FaUserShield,    // Active Directory
    FaServer,        // Data Centre
    FaCodeBranch,    // Program Changes
    FaHdd,           // Backups
    FaUserCheck,     // User Monitoring
    FaNetworkWired,  // VPN
    FaShieldAlt,     // Firewall
    FaUserCog,       // Admins
  ];

const systems = [
  'D365',
  'D365 Db',
  'Active Directory',
  'Data Centre',
  'Program Changes',
  'Backups',
  'User Monitoring',
  'VPN',
  'Firewall',
  'Admins',
];

const menuSystems = [
  'D365 Application',
  'D365 Database',
  'Active Directory',
  'Data Centre',
  'Program Changes',
  'Backups',
  'User Monitoring',
  'VPN',
  'Firewall',
  'Admins',
];

const dummyProfiles = [
  {
    name: 'Tinotenda',
    pic: '/images/user1.png',
    role: 'Requester'
  },
  {
    name: 'Zvidzai',
    pic: '/images/user2.png',
    role: 'Requester'
  },
  {
    name: 'Tadiwa',
    pic: '/images/user3.png',
    role: 'Requester'
  },
  {
    name: 'Adrian',
    pic: '/images/user4.png',
    role: 'Requester'
  },
  {
    name: 'Tawana',
    pic: '/images/user5.png',
    role: 'Approver'
  }
];



const getStatusIndicator = (status) => {
  return status === 'Approved' ? (
    <span className="flex items-center">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
      {status}
    </span>
  ) : (
    <span className="flex items-center">
      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
      {status}
    </span>
  );
};

const getCommentIndicator = (status) => {
  return status === 'New' ? (
    <span className='px-2 py-1 text-xs rounded-full bg-green-100 text-green-700'>New</span>
  ) : (
    <span className='px-2 py-1 text-xs rounded-full bg-red-100 text-red-700'>Old</span>
  );
};

const getFirstTwoWords = (text) => {
  return text.split(' ').slice(0, 2).join(' ');
};

const formatCommentTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const commentDate = new Date(timestamp);
  const timeStr = commentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Check if the comment is from a different day
  const isSameDay = now.toDateString() === commentDate.toDateString();
  
  if (isSameDay) {
    return { time: timeStr, showDate: false };
  } else {
    const dateStr = commentDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
    return { time: timeStr, date: dateStr, showDate: true };
  }
};

const Approver = () => {
  // Bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);

  // Document editing state
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Add a new text element to the document
  const addTextElement = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Double click to edit',
      x: 50,
      y: 50,
      width: 200,
      height: 30,
      isEditing: false,
      isSelected: false,
      zIndex: elements.length,
    };
    updateElements([...elements, newElement]);
  };

  // Add a new signature element to the document
  const addSignatureElement = () => {
    const newElement = {
      id: `signature-${Date.now()}`,
      type: 'signature',
      content: 'Signature',
      x: 50,
      y: 100,
      width: 150,
      height: 80,
      isSelected: false,
      zIndex: elements.length,
    };
    updateElements([...elements, newElement]);
  };

  // Update elements and save to history
  const updateElements = (newElements) => {
    // Save current state to history before updating
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, [...newElements]]);
    setHistoryIndex(historyIndex + 1);
    setElements(newElements);
  };

  // Handle element selection
  const handleElementSelect = (id, event) => {
    event.stopPropagation();
    const updatedElements = elements.map(el => ({
      ...el,
      isSelected: el.id === id
    }));
    setElements(updatedElements);
    setSelectedElement(elements.find(el => el.id === id));
  };

  // Handle element movement
  const handleElementMove = (id, newX, newY) => {
    const updatedElements = elements.map(el => {
      if (el.id === id) {
        return { ...el, x: newX, y: newY };
      }
      return el;
    });
    updateElements(updatedElements);
  };

  // Save document changes
  const saveDocument = () => {
    // Here you would typically send the elements to your backend
    console.log('Saving document with elements:', elements);
    // Show success message
    alert('Document saved successfully!');
    
    // Close the modal after saving
    handleCloseUploadModal();  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

const [comment, setComment] = useState('');
const [comments, setComments] = useState([]);
const [isLoadingComments, setIsLoadingComments] = useState(false);

useEffect(() => {
  let isMounted = true;
  
  const loadComments = async () => {
    if (!selectedDoc?.file_id) return;
    
    setIsLoadingComments(true);
    try {
      const commentsData = await handleComments(selectedDoc.file_id);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  if (selectedDoc?.file_id) {
    loadComments();
  } else {
    setComments([]);
  }

  return () => {
    isMounted = false;
  };
}, [selectedDoc, handleComments]);

  const handleDocClick = (doc) => {
    setSelectedDoc(doc);
    console.log(doc);
    setIsBottomSheetOpen(true);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !selectedDoc?.file_id) return;
    
    try {
      // Save the comment text and clear the input immediately for better UX
      const commentText = comment;
      setComment('');
      
      // Extract user information from the selected document
      const approverName = 'Current Approver'; // Replace with actual approver name from your auth context
      const requesterName = selectedDoc.requester || selectedDoc.uploaded_by || 'Requester';
      
      // Add the comment via API
      const result = await addComment(
        selectedDoc.file_id, 
        commentText, 
        true, // isApprover
        approverName,
        requesterName
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add comment');
      }
      
      // Refresh comments from the server to ensure we have the latest data
      const updatedComments = await handleComments(selectedDoc.file_id);
      setComments(updatedComments);
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Show error message to the user
      alert(`Failed to add comment: ${error.message}`);
      // Restore the comment if there was an error
      setComment(comment);
    }
  };

  // Filter button state
  const [timeFilter, setTimeFilter] = useState(null);
  // Navigation state
  const [selectedNav, setSelectedNav] = useState(1); // 'Overview' is default active
  // Hovered icon button index
  const [hoveredBtn, setHoveredBtn] = useState(null);
  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const chartRef = useRef(null);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedChartIndex, setSelectedChartIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // Snackbar state for mobile info
  const [showMobileInfoSnackbar, setShowMobileInfoSnackbar] = useState(false);
  // State for tracking document approval status is now managed through the document's approval_status field
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);
  const [signedCount, setSignedCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('file_name');
  const searchFields = [
    { value: 'file_name', label: 'Document Name' },
    { value: 'system', label: 'System' },
    { value: 'created_date', label: 'Date' },
    { value: 'uploaded_by', label: 'Uploaded By' }
  ];

  useEffect(() => {
    setFilteredUploads(recentUploads);
    // Count approved and signed documents
    const approved = recentUploads.filter(upload => upload.approval_status === 'Approved').length;
    const signed = recentUploads.filter(upload => upload.signature_status === 'Signed').length;
    setApprovedCount(approved);
    setSignedCount(signed);
  }, [recentUploads]);

  useEffect(() => {
    let result = [...recentUploads];

    // Apply time filter if selected
    if (timeFilter) {
      const now = new Date();
      const filterDate = new Date(now); // Create a new date object
      
      switch(timeFilter) {
        case 'Last week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'Last month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'Last year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      result = result.filter(doc => {
        if (!doc.created_date) return false;
        const docDate = new Date(doc.created_date);
        return docDate >= filterDate;
      });
    }

    // Apply search filter if there's a query
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        result = result.filter(doc => {
          const fieldValue = String(doc[searchField] || '').toLowerCase();
          return fieldValue.includes(query);
        });
      }
    }
    
    console.log('Filter results:', {
      timeFilter,
      searchQuery,
      totalResults: result.length,
      firstFew: result.slice(0, 3).map(d => d.file_name)
    });
    
    setFilteredUploads(result);
  }, [searchQuery, searchField, recentUploads, timeFilter]);

  useEffect(() => {
    const fetchRecentUploads = async () => {
      setIsLoading(true);
      try {
        const data = await handleRecentUploads();
        setRecentUploads(data);
        setFilteredUploads(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recent uploads:', error);
        setError('Failed to load recent uploads');
        setIsLoading(false);
      }
    };
    fetchRecentUploads();
  }, []);

  // Format date to '12 Apr 2025' format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // Return original if invalid date
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const handleShowMobileInfo = () => {
    setShowMobileInfoSnackbar(true);
    setTimeout(() => setShowMobileInfoSnackbar(false), 5000);
  }

  // Upload navigation and fade state
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [fadePanel, setFadePanel] = useState(true);
  const [uploadView, setUploadView] = useState('grid'); // 'grid' or 'list'


  // Example uploads array (replace with real data as needed)
  const uploads = [
    {
      lastUpload: 'Last Upload - 45 minutes ago',
      title: 'D365 Application Modification Review [PDF]',
      systemNameLabel: 'System Name',
      systemName: 'D365 Application',
      uploadedBy: 'Tadiwa Mabasa',
      uploadedDate: '2025-05-08',
      uploadedSize: '2.5 MB',
    },
    {
      lastUpload: 'Last Upload - 2 hours ago',
      title: 'Firewall Policy Update [PDF]',
      systemNameLabel: 'System Name',
      systemName: 'Firewall',
      uploadedBy: 'Zvidzai',
      uploadedDate: '2025-05-07',
      uploadedSize: '1.2 MB',
    },
    {
      lastUpload: 'Last Upload - 1 day ago',
      title: 'User Access Change [CSV]',
      systemNameLabel: 'System Name',
      systemName: 'Active Directory',
      uploadedBy: 'Tinotenda',
      uploadedDate: '2025-05-06',
      uploadedSize: '3.3 MB',
    },
  ];

  // Fade panel navigation handler
  const handleFadePanel = (direction) => {
    setFadePanel(false);
    setTimeout(() => {
      setCurrentUploadIndex((prev) => {
        if (direction === 'next') {
          return prev < uploads.length - 1 ? prev + 1 : 0;
        } else {
          return prev > 0 ? prev - 1 : uploads.length - 1;
        }
      });
      setTimeout(() => setFadePanel(true), 20);
    }, 400); // match transition duration
  };

  // Handle opening upload modal
  const handleOpenUploadModal = (upload) => {
    setSelectedUpload(upload);
    setIsUploadModalOpen(true);
  };

  // Handle closing upload modal
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedUpload(null);
  };

// Define system names and their corresponding chart configurations
const systems = [
  'D365', 'D365 Db', 'Active Directory', 'Data Centre', 'Program Changes',
  'Backups', 'User Monitoring', 'VPN', 'Firewall', 'Admins'
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const [chartData, setChartData] = useState(Array(systems.length).fill([]));
const [lastUploads, setLastUploads] = useState(Array(systems.length).fill(null));
const [numInsights, setNumInsights] = useState(Array(systems.length).fill({totalUploads: 0, totalSigned: 0, totalMissing: 0}));

// Simplified chart configs
const chartConfigs = systems.map((_, index) => ({
  id: systems[index].toLowerCase().replace(/\s+/g, '-'),
  labels: months,
  data: chartData[index] || [],
  bg: [index % 3 === 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(18, 63, 227, 0.2)'],
  border: [index % 3 === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(18, 63, 227, 1)'],
  type: index % 3 === 0 ? 'line' : 'bar' // Every 3rd chart is a line chart
}));

// Load all chart data & recent uploads
useEffect(() => {
  const loadCharts = async () => {
    try {
      const data = await Promise.all(systems.map(sys => handleCharts(sys)));
      const lastUploads = await Promise.all(systems.map(sys => handleLastUpload(sys)));
      const numInsights = await Promise.all(systems.map(sys => handleNumInsights(sys)));

      const recentUploads = await handleRecentUploads();
      
      setRecentUploads(recentUploads);
      setChartData(data);
      setLastUploads(lastUploads);
      setNumInsights(numInsights);
    } catch (e) {
      console.error('Error loading charts:', e);
      // Consider adding error state or user notification here
    }
  };

  loadCharts();
}, []);

// Update chart when selected chart or year changes
useEffect(() => {

  if (chartData.length > 0) {
    const chartElement = document.getElementById(`chart-${chartConfigs[selectedChartIndex].id}`);

    if (chartElement) {
      // Destroy existing chart if it exists
      if (chartElement.chart) {
        chartElement.chart.destroy();
      }
      
      // Create new chart
      const ctx = chartElement.getContext('2d');

      chartElement.chart = new Chart(ctx, {
        type: chartConfigs[selectedChartIndex].type,
        data: {
          labels: months,
          datasets: [{
            label: systems[selectedChartIndex],
            data: chartData[selectedChartIndex] || [],
            backgroundColor: chartConfigs[selectedChartIndex].bg,
            borderColor: chartConfigs[selectedChartIndex].border,
            borderWidth: 1,
            fill: true,
            tension: 0.5,
            pointRadius: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // Add any additional chart options here
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
          plugins: {
            legend: {
              display: true,
              position:'bottom',
              align: 'center',
              labels: { boxWidth: 15, padding: 17 }
            }
          }
        }
      });
    }
  }
}, [selectedChartIndex, chartData, selectedYear]);

  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Snackbar for mobile info */}
      {showMobileInfoSnackbar && (
        <div className="fixed flex flex-col bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in-out">
           <div className="flex flex-row items-center justify-around"> 
             <div className="flex flex-row items-center justify-center ml-2">
              <MdOutlineBarChart className="text-lg text-black bg-white rounded-full p-1" /> <h2 className={`${inter.className} text-xs ml-1`}>Charts</h2>
            </div> 
            <div className="flex flex-row items-center justify-center ml-2">
              <MdOutlineInsights className="text-lg text-black bg-white rounded-full p-1" /> <h2 className={`${inter.className} text-xs ml-1`}>Insights</h2>
            </div>
            <div className="flex flex-row items-center justify-center ml-2">
              <MdOutlineSchedule className="text-lg text-black bg-white rounded-full p-1" /> <h2 className={`${inter.className} text-xs ml-1`}>Scheduler</h2>
            </div>
          </div>
          <h2 className={`${inter.className} text-xs text-center mt-2 w-full`}>are not available on mobile</h2>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`hidden md:flex md:flex-col bg-blue-500 text-white p-2 transition-all duration-400 items-center justify-around ${
            isSidebarExpanded ? 'md:w-[10.50%]' : 'md:w-[5%]'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        >
        <Image
          className="dark:invert items-center flex flex-col justify-center"
          src="/images/realLogo.png"
          alt="Logo"
          width={180}
          height={38}
          priority
        />
    
        <ul className="space-y-2 h-[90%] flex flex-col items-center justify-center">
            <h2 className={` ${inter.className} text-xl font-bold ${isSidebarExpanded ? 'block' : 'hidden'}`}>Systems</h2>

            {menuSystems.map((system, index) => {
              const IconComponent = systemIcons[index];
              return (
                <li 
                  key={index} 
                  className="mb-2 hover:bg-blue-600 p-2 rounded flex flex-row justify-center items-center w-full cursor-pointer"
                  onClick={() => {
                    if (index === 0) {
                      router.push('/D365App');
                    }
                  }}
                >
                  <IconComponent className="mr-4 text-xl text-white" size={25} /> 
                  <span className={`${lexend.className} ${isSidebarExpanded ? 'block' : 'hidden'} text-sm w-3/4`}>{system}</span>
                </li>
              );
            })}
        </ul>
    </div>

      {/* Main Content */}
      <div className="flex-1 w-[95%] h-screen md:overflow-hidden overflow-y-auto overflow-x-hidden">

        {/* Header */}
        <header className="w-full h-[8%] flex flex-row p-4 flex justify-between items-center border border-b-1 border-gray-300 sticky top-0 z-30 backdrop-blur-sm">
          {/* Mobile: Only show title and hamburger */}
          <div className="flex flex-row items-center w-full md:hidden justify-between">
            <div className="flex flex-row items-center p-2 border border-gray-300 rounded">
              <h1 className={`${inter.className} text-xl`}>Access Control Portal</h1>
            </div>
            <div className="flex flex-row items-center">
              {/* Info icon */}
              <button
                className="p-2 mr-1 focus:outline-none"
                onClick={handleShowMobileInfo}
                aria-label="Show info"
              >
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
                  <line x1="12" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button className="block md:hidden p-2 ml-2" onClick={() => setShowMobileMenu(true)}>
                {/* Hamburger icon (can use FiMenu or similar) */}
                <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tablet and up: Show full header */}
          <div className="hidden md:flex w-full flex-row justify-between items-center">

            <div className="flex flex-row items-center p-2 border border-gray-300 rounded">
              <h1 className={`${inter.className} text-xl`}>Access Control Portal</h1>
            </div>

            <div className="flex flex-row justify-around w-[32%] items-center">
              <div className="flex flex-row items-center justify-around w-2/3 h-full space-x-2">
                {['Home', 'Approvals', 'Emails', 'Signatures', 'Dashboard'].map((label, idx) => (
                  <div
                    key={label}
                    className={`flex items-center space-x-2 p-2 rounded-full cursor-pointer transition-colors duration-150
                      ${selectedNav === idx ? 'bg-black text-white' : 'hover:bg-gray-200 hover:text-black'}`}
                    onClick={() => setSelectedNav(idx)}
                  >
                    <span className={`${inter.className} text-sm tracking-wide`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-row justify-around w-[10%] items-center relative" style={{minHeight: '3rem'}}>
              <React.Fragment>
                {[
                  {icon: <BiCog className="text-lg" />, label: 'Settings'},
                  {icon: <HiOutlineBell className="text-lg" />, label: 'Notifications'},
                  {icon: <FaRegUser className="text-lg" />, label: 'Profile'}
                  ].map((btn, idx) => {
                  const isHovered = hoveredBtn === idx;
                    return (
                    <button
                      key={btn.label}
                      className={`icon-expand-btn flex items-center bg-gray-100 border border-gray-300 hover:bg-gray-200 h-12 rounded-full cursor-pointer transition-all duration-300 overflow-hidden ${isHovered ? 'icon-expand-btn-expanded justify-start' : 'justify-center'}`}
                      style={{
                        width: isHovered ? '12rem' : '3rem',
                        opacity: hoveredBtn === null || isHovered ? 1 : 0.2,
                        visibility: hoveredBtn === null || isHovered ? 'visible' : 'hidden',
                        zIndex: isHovered ? 20 : 10,
                        position: isHovered ? 'absolute' : 'relative',
                        left: isHovered ? '50%' : 'unset',
                        transform: isHovered ? 'translateX(-50%)' : 'none',
                        top: isHovered ? 0 : 'unset',
                      }}
                      onMouseEnter={() => setHoveredBtn(idx)}
                      onMouseLeave={() => isHovered && setHoveredBtn(null)}
                      tabIndex={hoveredBtn !== null && !isHovered ? -1 : 0}
                    >
                    {btn.icon}
                    <span
                      className="icon-btn-title-expanded ml-2 text-black whitespace-nowrap max-w-[120px] transition-all duration-300"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        maxWidth: isHovered ? 120 : 0,
                        marginLeft: isHovered ? 8 : 0,
                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                        overflow: 'hidden',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                      }}
                    >
                      {btn.label}
                    </span>
                  </button>
                  );
                })}
                <style jsx>{`
                    .icon-expand-btn {
                      width: 3rem;
                      padding-left: 0.5rem;
                      padding-right: 0.5rem;
                      z-index: 10;
                      transition: width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s, visibility 0.2s;
                    }
                    .icon-expand-btn-expanded {
                      width: 12rem !important;
                      justify-content: flex-start;
                      box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
                      z-index: 20;
                    }
                    .icon-btn-title-expanded {
                      opacity: 1;
                      max-width: 120px;
                      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                      overflow: hidden;
                      display: inline-block;
                      vertical-align: middle;
                    }
                  `}</style>
                </React.Fragment>
              </div>
            </div>
          </header>

        {/* Mobile Bottom Sheet Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-opacity-80 backdrop-blur-xs backdrop-saturate-150" onClick={() => setShowMobileMenu(false)} />
            {/* Bottom Sheet */}
            <div className={`absolute bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-2xl p-4 animate-slideup z-50 ${inter.className}`}>
 
              <div className="flex flex-col space-y-6">
                {/* User Section */}
                <div>
                  <h2 className={`text-lg font-bold mb-2 tracking-wider text-center ${inter.className} text-black p-1 rounded-lg`}>User</h2>
                  <div className="flex flex-row items-center justify-around gap-2">
                    {[
                      {icon: <BiCog className="text-2xl text-blue-600" />, label: 'Settings'},
                      {icon: <HiOutlineBell className="text-2xl text-blue-600" />, label: 'Notifications'},
                      {icon: <FaRegUser className="text-2xl text-blue-600" />, label: 'Profile'},
                    ].map(btn => (
                      <button key={btn.label} className="flex flex-row items-center gap-2 bg-white shadow rounded-lg px-3 py-2 hover:bg-blue-50 transition">
                        {btn.icon}
                        <span className="text-xs text-gray-800">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Nav Section */}
                <div>
                  <h2 className={`text-lg font-bold mb-2 tracking-wider text-center ${inter.className}`}>Nav</h2>
                  <div className="flex flex-row items-center justify-around">
                    {['Home', 'Approvals', 'Emails', 'Signatures', 'Reviews'].map((label, idx) => (
                      <button
                        key={label}
                        className={`flex flex-col items-center p-2 rounded-full transition-colors duration-150 ${selectedNav === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                        onClick={() => { setSelectedNav(idx); setShowMobileMenu(false); }}
                      >
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Systems Section */}
                <div>
                  <h2 className={`text-lg font-bold mb-2 tracking-wider text-center ${inter.className}`}>Systems</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {menuSystems.map((system, index) => {
                      const IconComponent = systemIcons[index];
                      return (
                        <button
                          key={system}
                          className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-3 hover:bg-blue-50 transition"
                          onClick={() => {
                            if (index === 0) router.push('/D365App');
                            setShowMobileMenu(false);
                          }}
                        >
                          <IconComponent className="mb-2 text-2xl text-blue-600" size={28} />
                          <span className="text-xs text-gray-800 text-center break-words">{system}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <style jsx>{`
              .animate-slideup {
                animation: slideUpSheet 0.3s cubic-bezier(0.4,0,0.2,1);
              }
              @keyframes slideUpSheet {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-around w-full h-[30%] md:h-[12%] mt-5">

          <div className="flex flex-col items-start justify-center md:w-1/2 w-full md:h-full h-[16%] ml-4 space-y-2 md:space-y-0">

            <h1 className={`${lexend.className} md:text-4xl text-3xl tracking-wider`}>Good morning, Munashe</h1>

            <div className="flex flex-row items-center justify-between ">
              <h1 className={`${inter.className} text-sm tracking-wide text-gray-600`}>You have <span className="text-red-500 text-lg">44</span> pending requests</h1>
              <CgDanger className="text-red-500 ml-2" size={20}/>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between md:w-1/2 w-full md:h-full h-[80%] p-2 md:p-0 space-x-2 md:space-x-0 md:space-y-0 space-y-2 mt-2 md:mt-0">

            <div className="flex flex-row items-center justify-around md:w-2/3 w-full md:h-full h-1/2 space-x-2 md:mt-0 mt-2 ">

              <div className='flex flex-col items-center justify-between md:basis-1/3 w-[45%] shadow-xs bg-gray-100/10 rounded-lg p-2 pl-4 h-full'>
                
                <div className="flex flex-row items-center justify-start h-1/3 w-full">
                  <h1 className={`${lexend.className} text-sm text-gray-500`}>Total Approved</h1>          
                </div>

                <div className="flex flex-row items-center justify-start h-1/3 w-full">
                  <h1 className={`${inter.className} text-2xl text-black`}>
                    {approvedCount.toLocaleString()}
                  </h1>
                </div>

                <div className="flex flex-row items-center justify-between h-1/3 w-full">
                  <h1 className={`${inter.className} text-xs text-gray-500 font-bold`}>Since last month</h1>

                  <div className="flex flex-row items-center justify-around w-1/3 h-full">                    
                    <h1 className={`${inter.className} text-xs text-blue-500`}>2.0%</h1>
                    <FaCaretUp className="text-blue-500" size={15}/>
                  </div>
                </div>                             

              </div>

              <div className='flex flex-col items-center justify-between md:basis-1/3 w-[45%] shadow-xs bg-gray-100/10 rounded-lg p-2 pl-4 h-full'>
                
                <div className="flex flex-row items-center justify-start h-1/3 w-full">
                  <h1 className={`${lexend.className} text-sm text-gray-500`}>Total Signed</h1>          
                </div>

                <div className="flex flex-row items-center justify-start h-1/3 w-full">
                  <h1 className={`${inter.className} text-2xl text-black`}>
                    {isLoading ? (
                      <div className="animate-pulse h-7 w-20 bg-gray-200 rounded"></div>
                    ) : (
                      signedCount.toLocaleString()
                    )}
                  </h1>
                </div>

                <div className="flex flex-row items-center justify-between h-1/3 w-full">
                  <h1 className={`${inter.className} text-xs text-gray-500 font-bold`}>Since last month</h1>

                  <div className="flex flex-row items-center justify-around w-1/3 h-full">                    
                    <h1 className={`${inter.className} text-xs text-red-500`}>24.0%</h1>
                    <FaCaretDown className="text-red-500" size={15}/>
                  </div>
                </div>                             

              </div>

            </div> 


            <div className="flex flex-col items-center justify-around md:w-1/3 w-full border border-gray-100 shadow-xs bg-gray-100/10 rounded-lg p-1 md:h-full h-[50%]">
              <h1 className={`${inter.className} text-sm text-black`}>Users</h1>

            <div className="flex flex-row items-center justify-between h-[90%] space-x-1 overflow-x-auto hide-scrollbar-x custom-scrollbar-x whitespace-nowrap w-full hover:scale-105">
            
              {dummyProfiles.map((profile, index) =>  (
              <div key={index} className="flex flex-row items-center justify-between h-3/4 min-w-[135px] p-1 border border-gray-100 rounded-full text-black space-x-2 cursor-pointer hover:bg-gray-400 hover:text-white">
                <div className="flex items-center justify-center rounded-full bg-red-200 ">
                  <Image src={profile.pic} className='rounded-full cursor-pointer' width={40} height={40} alt='profile'/>
                </div>

                <div className="flex flex-col items-start justify-center h-full space-y-1 w-2/3">
                  <h1 className={`${inter.className} text-sm truncate`}>{profile.name}</h1>  
                  <h1 className={`${inter.className} text-xs text-gray-500 truncate hover:text-white`}>{profile.role}</h1> 
                </div>
              </div>
            ))}
            </div>
              
            </div> 
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full border border-gray-100 shadow-xs bg-gray-100/10 rounded-lg h-[55%] md:h-[45%] mt-5 p-1 space-x-2">

          <div className='flex flex-row-reverse items-center justify-between md:w-1/2 w-full md:h-full h-[100%] p-2 space-x-2'>

            <div className="flex flex-col items-center justify-between w-[100%] h-full space-y-1 p-1 border border-gray-100 rounded-lg shadow-md p-1">
              
              <div className='flex flex-col items-start justify-center w-full md:h-[20%] h-[15%] space-y-2 p-1 border-b border-gray-100'>
                <h1 className={`${inter.className} text-xl text-black tracking-wide ml-2`}>Comments & Approvals</h1>
                <h1 className={`${lexend.className} text-xs text-gray-400 ml-2`}>Select a document to comment or approve</h1>
              </div>
              
              <div className="flex flex-col items-center justify-around w-full md:h-[30%] h-[20%] rounded-lg space-x-1 p-1">
                <div className='flex flex-row items-center justify-between w-full h-[20%] p-1'>
                  <div className='flex items-center space-x-1'>
                    <IoFilterCircleOutline className="text-lg text-black ml-2"/>
                    <h1 className={`${inter.className} text-xs text-black tracking-wide`}>Filter</h1>
                  </div>

                </div>

                <div className="flex flex-row md:items-center items-center md:justify-around justify-center w-full h-[70%] rounded-lg space-x-1 p-1">
                  {['Last year', 'Last month', 'Last week'].map((label, idx) => (
                    <button
                      key={label}
                      className={`w-[25%] md:w-[15%] p-1 rounded-full h-[65%] md:h-[80%] border border-gray-200 transition-colors duration-150
                        ${timeFilter === label ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200 hover:text-black'}`}
                      onClick={() => setTimeFilter(timeFilter === label ? null : label)}
                    >
                      <h1 className={`${inter.className} text-xs tracking-wide text-center`}>{label}</h1>
                    </button>
                  ))}

                  <div className="flex items-center space-x-2 w-[40%] h-full justify-around">
                    <div className="relative h-full flex items-center justify-center">
                      <input
                        type="text"
                        placeholder="Search documents..."
                        className="pl-8 pr-3 py-1 h-[80%] text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent"
                      />
                      <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                    <button 
                      onClick={() => setIsFullscreen(true)}
                      className="p-2 text-gray-500 hover:text-black transition-colors cursor-pointer bg-gray-100 rounded-full" 
                      title="View in fullscreen"
                    >
                      <FaExpand className="text-xl" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Fullscreen Modal with Backdrop */}
              {isFullscreen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-opacity-50 backdrop-blur-xs"
                    onClick={() => setIsFullscreen(false)}
                  />
                  {/* Modal Content */}
                  <div className="relative z-50 bg-white h-[95%] w-[60%] p-4 overflow-auto rounded-lg shadow-2xl custom-scrollbar">
                  {/* Floating search bar at the bottom */}
                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-black/10 backdrop-blur-xs shadow-lg rounded-lg px-4 py-3 border border-gray-200 flex items-center space-x-3 w-[50%]">
                    <div className="relative justify-around flex-1 bg-white rounded-lg flex flex-row items-center space-x-2">
                      <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className={`${inter.className} h-full py-2 pl-10 pr-2 text-sm text-gray-700 bg-transparent border-0 border-r border-gray-300 rounded-l-lg focus:ring-0 focus:border-gray-300`}
                      >
                        {searchFields.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search by ${searchFields.find(f => f.value === searchField)?.label || 'Document Name'}...`}
                        className={`${inter.className} w-[70%] text-center bg-red-300 text-black pl-4 py-2 border-0 bg-transparent focus:outline-none focus:ring-0`}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full cursor-pointer flex-shrink-0"
                    >
                      <FaTimes className="text-white" />
                    </button>
                  </div>

                  <div className="border border-gray-100 rounded-lg overflow-visible mt-4 relative">
                    {/* Document list header - sticky at top */}
                    <div className="sticky top-0 left-0 right-0 z-10 bg-gray-100 flex flex-row px-4 py-3 border-b">
                      <div className={`${lexend.className} w-[16%] text-sm font-medium text-gray-700 text-center px-1 truncate`}>System</div>
                      <div className={`${lexend.className} w-[24%] text-sm font-medium text-gray-700 text-center px-1 truncate`}>Doc Name</div>
                      <div className={`${lexend.className} w-[15%] text-sm font-medium text-gray-700 text-center px-1 truncate`}>Date</div>
                      <div className={`${lexend.className} w-[15%] text-sm font-medium text-gray-700 text-center px-1 truncate`}>Uploaded By</div>
                      <div className={`${lexend.className} w-[15%] text-sm font-medium text-gray-700 text-center px-1 truncate`}>Approved</div>
                      <div className={`${lexend.className} w-[15%] text-sm font-medium text-gray-700 text-center px-1 truncate`}>Signed</div>
                    </div>
                    {(filteredUploads.length > 0 ? filteredUploads : recentUploads).map((upload) => (
                      <div 
                        key={`full-${upload.file_id}`}
                        onClick={() => {
                          handleDocClick(upload);
                          setIsFullscreen(false);
                        }}
                        className="flex flex-row items-center w-full bg-white hover:bg-gray-50 transition cursor-pointer px-4 py-3 border-b-gray-200 border-b "
                      >
                        <div className={`${inter.className} w-[16%] text-sm text-black font-medium truncate text-center`}>{upload.system}</div>
                        <div className={`${inter.className} w-[24%] text-sm text-black truncate text-center`}>{upload.file_name}</div>
                        <div className={`${inter.className} w-[15%] text-sm text-gray-700 text-center`}>
                          {formatDate(upload.created_date)}
                        </div>
                        <div className={`${inter.className} w-[15%] text-sm text-gray-700 text-center flex items-center justify-center`}>
                          <Image 
                            src='/images/user1.png' 
                            width={20} 
                            height={20} 
                            alt='user' 
                            className="rounded-full"
                          />
                          <span className="ml-2">{upload.author}</span>
                        </div>
                        <div className="w-[15%] text-sm text-center">
                          <span 
                            className={`${inter.className} inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                              upload.approval_status === 'Approved' 
                                ? 'text-green-800 bg-green-100' 
                                : upload.approval_status === 'Rejected' 
                                  ? 'text-red-800 bg-red-100' 
                                  : 'text-gray-500 bg-gray-100'
                            }`}
                          >
                            {upload.approval_status === 'Approved' && <FaCheck className="mr-1" size={10} />}
                            {upload.approval_status === 'Rejected' && <FaTimes className="mr-1" size={10} />}
                            {upload.approval_status === 'Pending' && <FaClock className="mr-1" size={10} />}
                            {upload.approval_status}
                          </span>
                        </div>
                        <div className="w-[15%] text-sm text-gray-700 text-center">
                          <span className={`${inter.className} inline-flex items-center justify-center px-3 py-1 rounded-full text-xs ${
                            upload.signature_status === 'Signed' ? 'text-blue-700 bg-blue-100' : 'text-gray-500 bg-gray-100'
                          }`}>
                            <FaSignature className="mr-1" size={10} />
                            {upload.signature_status === 'Signed' ? 'Signed' : 'Not signed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className='flex flex-col items-center justify-between w-full md:w-full md:h-[65%] h-[60%] rounded-lg space-y-2 p-1 overflow-y-auto md:overflow-x-hidden overflow-x-auto scrollbar-hide'>

                {/* Sticky header row */}
                <div className="sticky top-0 z-10 bg-gray-100 rounded-t-lg w-full flex flex-row px-2 py-2 border-b border-gray-200">
                  <div className={`${inter.className} w-[16%] text-xs font-semibold text-gray-700 text-center`}>System</div>
                  <div className={`${inter.className} md:w-[24%] w-[34%] text-xs font-semibold text-gray-700 text-center`}>Doc Name</div>
                  <div className={`${inter.className} md:w-[15%] w-[25%] text-xs font-semibold text-gray-700 text-center`}>Date</div>
                  <div className={`${inter.className} md:w-[15%] w-[25%] text-xs font-semibold text-gray-700 text-center`}>Uploaded By</div>
                  <div className={`${inter.className} hidden md:block w-[15%] text-xs font-semibold text-gray-700 text-center`}>Approved</div>
                  <div className={`${inter.className} hidden md:block w-[15%] text-xs font-semibold text-gray-700 text-center`}>Signed</div>
                </div>
                {/* Data rows */}
                {isLoading ? (
                  <div className="w-full py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : recentUploads.length === 0 ? (
                  <div className="w-full py-8 text-center text-gray-500">
                    No documents found
                  </div>
                ) : (
                  recentUploads.map((upload) => (
                  <div 
                    key={upload.file_id} 
                    onClick={() => handleDocClick(upload)}
                    className="flex flex-row items-center w-full bg-white rounded-sm my-1 px-2 py-2 shadow-sm hover:bg-gray-50 transition h-[40%] space-x-1 md:space-x-0 cursor-pointer"
                  >
                    <div className={`${inter.className} w-[16%] text-sm text-black font-medium truncate text-center`}>{upload.system}</div>
                    <div className={`${inter.className} md:w-[24%] w-[34%] text-sm text-black truncate text-center`}>{upload.file_name}</div>
                    <div className={`${inter.className} md:w-[15%] w-[25%] text-sm text-gray-700 text-center`}>
                      {formatDate(upload.created_date)}
                    </div>
                    <div className={`${inter.className} md:w-[15%] w-[25%] text-sm text-gray-700 text-center flex items-center justify-center`}>
                      <Image 
                        src='/images/user1.png' 
                        width={20} 
                        height={20} 
                        alt='user' 
                        className="rounded-full"
                      />
                      <span className="ml-1 hidden md:inline">{upload.author}</span>
                    </div>
                    <div className={`${inter.className} hidden md:block w-[15%] text-xs text-center`}>
                      <span 
                        className={`inline-flex flex  justify-center items-center px-2 py-1 rounded-lg text-xs font-medium w-[80%] ${
                          upload.approval_status === 'Approved' 
                            ? 'text-green-800 bg-green-100' 
                            : upload.approval_status === 'Rejected' 
                              ? 'text-red-800 bg-red-100' 
                              : 'text-gray-500 bg-gray-100'
                        }`}
                      >
                        {upload.approval_status === 'Approved' && <FaCheck className="mr-1" size={10} />}
                        {upload.approval_status === 'Rejected' && <FaTimes className="mr-1" size={10} />}
                        {upload.approval_status === 'Pending' && <FaClock className="mr-1" size={10} />}
                        {upload.approval_status}
                      </span>
                    </div>
                    <div className={`${inter.className} hidden md:block w-[15%] text-xs text-gray-700 text-center`}>
                      <span className={`inline-flex items-center px-2 py-1 rounded ${upload.signature_status === 'Signed' ? 'text-blue-700 bg-blue-100' : 'text-gray-500 bg-gray-100'}`}>
                        <FaSignature className="mr-1" size={10} />
                        {upload.signature_status === 'Signed' ? 'Signed' : 'Not signed'}
                      </span>
                    </div>
                  </div>
                  )
                ))}

                {/* Modal */}
                <div 
                  className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ${isBottomSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                  }}
                >
                  {/* Backdrop Click Area */}
                  <div 
                    className="absolute inset-0"
                    onClick={() => setIsBottomSheetOpen(false)}
                  />
                  
                  {/* Modal Content */}
                  <div 
                    className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col transform transition-all duration-300 ${isBottomSheetOpen ? 'scale-100' : 'scale-95'} mx-2 sm:mx-0`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className={`${inter.className} text-xl font-semibold`}>Document Details</h3>
                        <button 
                          onClick={() => setIsBottomSheetOpen(false)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
                      {selectedDoc && (
                        <div className="space-y-6">
                          {/* Document Preview */}
                          <div className="bg-gray-100 rounded-lg border border-gray-200 p-2 sm:p-4 flex items-center justify-center">
                            <div className="text-center w-full">
                              <div className="relative w-full max-w-xs mx-auto aspect-[3/4] bg-white flex items-center justify-center">
                                <Image 
                                  src="/images/doc.png" 
                                  alt="Document Preview"
                                  fill
                                  style={{ objectFit: 'contain' }}
                                  className="rounded"
                                  priority
                                />
                              </div>
                              <p className={`${inter.className} text-xs sm:text-sm text-gray-500 mt-2 break-words px-2`}>
                                Firewall_Modification_Review.pdf
                              </p>
                            </div>
                          </div>

                          {/* Approve Button */}
                          <div className="pt-2">
                            {selectedDoc?.approval_status === 'Approved' ? (
                              <div className={`${inter.className} w-full py-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center text-base font-medium`}>
                                <FaCheck className="mr-2" />
                                Document Approved
                              </div>
                            ) : selectedDoc?.approval_status === 'Rejected' ? (
                              <div className={`${inter.className} w-full py-3 bg-red-100 text-red-800 rounded-lg flex items-center justify-center text-base font-medium`}>
                                <FaTimes className="mr-2" />
                                Document Rejected
                              </div>
                            ) : (
                              <div className="flex gap-2 w-full">
                                <button 
                                  className={`flex-[2] py-3 ${
                                    isApproving ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                                  } text-white rounded-lg flex items-center justify-center text-sm font-medium`}
                                  onClick={async () => {
                                    if (!selectedDoc?.file_id || isApproving) return;
                                    
                                    setIsApproving(true);
                                    try {
                                      const result = await updateDocumentStatus(selectedDoc.file_id, {
                                        file_name: selectedDoc.file_name,
                                        system: selectedDoc.system,
                                        author: selectedDoc.author,
                                        qrcode: selectedDoc.qrcode || '',
                                        month: selectedDoc.month || '',
                                        signature_status: selectedDoc.signature_status || ''
                                      }, 'Approved');
                                      
                                      if (result.success) {
                                        // Update the document in the list
                                        setRecentUploads(prev => prev.map(doc => 
                                          doc.file_id === selectedDoc.file_id 
                                            ? { ...doc, approval_status: 'Approved' } 
                                            : doc
                                        ));
                                        // Update the selected doc
                                        setSelectedDoc(prev => ({
                                          ...prev,
                                          approval_status: 'Approved'
                                        }));
                                      } else {
                                        alert(result.error || 'Failed to approve document');
                                      }
                                    } catch (error) {
                                      console.error('Approval error:', error);
                                      alert('An error occurred while approving the document');
                                    } finally {
                                      setIsApproving(false);
                                    }
                                  }}
                                  disabled={isApproving || isRejecting}
                                >
                                  {isApproving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Approving...
                                    </>
                                  ) : (
                                    <>
                                      <FaCheck className="mr-2" />
                                      Approve
                                    </>
                                  )}
                                </button>
                                
                                <button 
                                  className={`flex-1 py-3 ${
                                    isRejecting ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'
                                  } text-white rounded-lg flex items-center justify-center text-sm font-medium`}
                                  onClick={async () => {
                                    if (!selectedDoc?.file_id || isRejecting) return;
                                    
                                    if (window.confirm('Are you sure you want to reject this document?')) {
                                      setIsRejecting(true);
                                      try {
                                        const result = await updateDocumentStatus(selectedDoc.file_id, {
                                          file_name: selectedDoc.file_name,
                                          system: selectedDoc.system,
                                          author: selectedDoc.author,
                                          qrcode: selectedDoc.qrcode || '',
                                          month: selectedDoc.month || '',
                                          signature_status: selectedDoc.signature_status || ''
                                        }, 'Rejected');
                                        
                                        if (result.success) {
                                          // Update the document in the list
                                          setRecentUploads(prev => prev.map(doc => 
                                            doc.file_id === selectedDoc.file_id 
                                              ? { ...doc, approval_status: 'Rejected' } 
                                              : doc
                                          ));
                                          // Update the selected doc
                                          setSelectedDoc(prev => ({
                                            ...prev,
                                            approval_status: 'Rejected'
                                          }));
                                        } else {
                                          alert(result.error || 'Failed to reject document');
                                        }
                                      } catch (error) {
                                        console.error('Rejection error:', error);
                                        alert('An error occurred while rejecting the document');
                                      } finally {
                                        setIsRejecting(false);
                                      }
                                    }
                                  }}
                                  disabled={isRejecting || isApproving}
                                >
                                  {isRejecting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <FaTimes className="mr-2" />
                                  )}
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Document Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t">
                            <div className="p-2 sm:p-0">
                              <p className={`${inter.className} text-xs sm:text-sm text-gray-500`}>System</p>
                              <p className={`${inter.className} text-sm sm:text-base font-medium break-words`}>{selectedDoc.system}</p>
                            </div>
                            <div className="p-2 sm:p-0">
                              <p className={`${inter.className} text-xs sm:text-sm text-gray-500`}>Document</p>
                              <p className={`${inter.className} text-sm sm:text-base font-medium break-words`}>{selectedDoc.file_name}</p>
                            </div>
                            <div className="p-2 sm:p-0">
                              <p className={`${inter.className} text-xs sm:text-sm text-gray-500`}>Uploaded On</p>
                              <p className={`${inter.className} text-sm sm:text-base font-medium`}>{formatDate(selectedDoc.created_date)}</p>
                            </div>
                            <div className="p-2 sm:p-0">
                              <p className={`${inter.className} text-xs sm:text-sm text-gray-500`}>Uploaded By</p>
                              <div className="flex items-center">
                                <Image 
                                  src='/images/user1.png' 
                                  width={24} 
                                  height={24} 
                                  alt='user' 
                                  className="rounded-full mr-2 w-6 h-6 sm:w-6 sm:h-6"
                                />
                                <span className={`${inter.className} text-sm sm:text-base`}>{selectedDoc.author}</span>
                              </div>
                            </div>
                          </div>

                          {/* Comments Section */}
                          <div className="mt-6">
                            <div className="flex items-center mb-4">
                              <FaComment className="text-gray-500 mr-2" />
                              <h4 className={`${inter.className} font-medium`}>Comments</h4>
                            </div>
                            
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto p-3 border rounded-lg custom-scrollbar">
                              {Array.isArray(comments) && comments.length > 0 ? (() => {
                                // Flatten and sort all comments by timestamp
                                const allComments = comments.flatMap(comment => {
                                  if (!comment) return [];
                                  
                                  const commentData = comment.comment || {};
                                  const requesterName = comment.requester || 'Requester';
                                  
                                  // Current user is the approver, so their comments should be on the right
                                  const approverComments = (commentData.approver_comments || []).map(c => ({
                                    ...c,
                                    type: 'approver',
                                    commenter: 'You',
                                    isCurrentUser: true,
                                    timestamp: c.timestamp || comment.comment_time,
                                    bubbleTitle: undefined // No title for current user
                                  }));
                                  
                                  // Requester's comments (other person in the conversation)
                                  const requesterComments = (commentData.requester_comments || []).map(c => ({
                                    ...c,
                                    type: 'requester',
                                    commenter: requesterName,
                                    isCurrentUser: false,
                                    role: 'Requester',
                                    timestamp: c.timestamp || comment.comment_time,
                                    bubbleTitle: `${requesterName} •` // Combined title for requester
                                  }));

                                  return [...approverComments, ...requesterComments];
                                });

                                // Sort comments by timestamp, ensuring valid dates
                                const sortedComments = allComments
                                  .filter(comment => comment.timestamp) // Filter out comments without timestamps
                                  .sort((a, b) => {
                                    try {
                                      const dateA = new Date(a.timestamp);
                                      const dateB = new Date(b.timestamp);
                                      return dateA - dateB; // Sort oldest to newest
                                    } catch (e) {
                                      console.error('Error sorting comments:', e);
                                      return 0;
                                    }
                                  });

                                // If no valid timestamps, show in original order
                                const displayComments = sortedComments.length > 0 ? sortedComments : allComments;

                                if (isLoadingComments) {
                                  return (
                                    <div className="flex justify-center py-4">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                  );
                                }

                                return displayComments.length > 0 ? (
                                  displayComments.map((comment, idx) => (
                                    <div 
                                      key={`${comment.type}-${idx}`} 
                                      className={`flex ${comment.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div 
                                        className={`flex flex-col space-y-1 p-3 mb-2 max-w-[80%] ${
                                          comment.isCurrentUser 
                                            ? 'bg-blue-50 items-end rounded-tl-lg rounded-bl-lg rounded-br-lg' 
                                            : 'bg-gray-100 items-start rounded-tr-lg rounded-br-lg rounded-bl-lg'
                                        } ${inter.className}`}
                                      >
                                        <div className="flex justify-between items-center w-full">
                                          {comment.bubbleTitle ? (
                                            <div className="text-xs font-medium text-gray-800">
                                              {comment.bubbleTitle}
                                              <span className="text-xs text-gray-400 ml-2">
                                                Requester •
                                                {comment.timestamp && (() => {
                                                  const { showDate, date } = formatCommentTimestamp(comment.timestamp);
                                                  return showDate ? (
                                                    <span className="text-white bg-black p-1 rounded-full text-xs ml-1">{date}</span>
                                                  ) : null;
                                                })()}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="font-bold text-xs text-blue-700">
                                              {comment.commenter}
                                              {comment.timestamp && (() => {
                                                const { showDate, date } = formatCommentTimestamp(comment.timestamp);
                                                return showDate ? (
                                                  <span className="font-normal text-gray-500 ml-1">• {date}</span>
                                                ) : null;
                                              })()}
                                            </div>
                                          )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-800">{comment.text}</p>
                                        <div className="flex justify-end items-center w-full">
                                          <span className={`${inter.className} text-xs text-green-500`}>
                                            {comment.timestamp && formatCommentTimestamp(comment.timestamp).time}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className={`${inter.className} text-sm text-gray-500 text-center py-4`}>
                                    No comments yet
                                  </p>
                                );
                              })() : (
                                <p className={`${inter.className} text-sm text-gray-500 text-center py-4`}>
                                  No comments yet
                                </p>
                              )}
                            </div>

                            <form onSubmit={handleCommentSubmit} className="mt-4">
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                <input
                                  type="text"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Add a comment..."
                                  className={`${inter.className} flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                                />
                                <button 
                                  type="submit"
                                  disabled={!comment.trim()}
                                  className={`${inter.className} px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center text-sm sm:text-base`}
                                >
                                  <FaPaperPlane className="mr-2" />
                                  <span>Send</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                

              </div>

            </div>

          </div>

          <div className="hidden md:flex flex-row items-center justify-center w-1/2 h-full p-2 space-x-2 group/chart-nav relative">
            {/* Left Navigation Button */}
            <button
              onClick={() => setSelectedChartIndex((prev) => (prev > 0 ? prev - 1 : chartConfigs.length - 1))}
              className="p-1 bg-white shadow-md rounded-full mr-2 absolute left-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/chart-nav:opacity-100 transition-opacity duration-200"
            >
              <FaChevronLeft size={15} className='text-gray-500'/>
            </button>

            {/* Main Chart and Insights Content */}
            <div className="flex flex-row w-full h-full space-x-2">
              <div className="shadow-md w-[70%] rounded-lg p-6 h-full bg-white snap-center flex flex-col items-center">
                <div className="w-full flex justify-center items-center mb-2">
                  <h2 className={`${lexend.className} text-sm font-bold tracking-wide`}>
                    {systems[selectedChartIndex]}
                  </h2>
                  <div className="relative ml-6">
                    <select 
                      className={`${inter.className} text-xs text-gray-800 bg-white border border-gray-200 p-1 pr-6 rounded focus:outline-none cursor-pointer appearance-none`}
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <FaChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                  </div>
                </div>
                <div className="h-full w-full">
                  <canvas id={`chart-${chartConfigs[selectedChartIndex].id}`} className="h-full w-full"></canvas>
                </div>
              </div>

              <div className="shadow-md w-[30%] h-full bg-[url('/images/grayBG.jpg')] bg-cover snap-center flex flex-col items-center rounded-lg">
                <div className="flex flex-col items-center justify-between w-full h-[100%] backdrop-blur-xs rounded-lg p-1 space-y-1">

                  <div className="flex flex-row items-center justify-start w-full h-[15%] space-x-2 p-1 border-b border-gray-500">
                    <CgInsights className="text-white p-1 bg-red-500 rounded-full ml-4" size={32}/>

                    <div className="flex flex-col items-start justify-center ml-2">
                      <h1 className={`${inter.className} text-lg text-white `}>System Insights</h1>
                      <h1 className={`${lexend.className} text-xs text-gray-300 `}>Underlying system statistics</h1>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-between w-full h-[85%]"> 

                    <div className="flex flex-col items-center justify-between h-[25%] w-[94%]  space-y-1">
                
                      
                      <div className="flex flex-row items-center justify-between w-full space-x-1 p-1 border-b border-gray-500">
                        <div className="flex flex-row items-center justify-between w-[73%]">
                          <h1 className={`${inter.className} text-sm text-white `}>Last Upload</h1>
                          <h1 className={`${lexend.className} text-xs text-gray-400 `}>{lastUploads[selectedChartIndex]}</h1>
                        </div>
                        <div className="relative group/insight-pic flex items-center">
                          <span className={`${lexend.className} text-white text-xs mr-2`}>by: </span><Image src={'/images/user1.png'} alt={'user'} width={30} height={30} className="rounded-full cursor-pointer bg-red-200"/>
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/insight-pic:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            Zvidzai
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-between w-full space-x-1 p-1 border-b border-gray-500">
                        <div className="flex flex-row items-center justify-between w-[73%]">
                          <h1 className={`${inter.className} text-sm text-white `}>Next Expected</h1>
                          <h1 className={`${lexend.className} text-xs text-gray-400 `}>{}</h1>
                        </div>
                        <div className="relative group/insight-pic flex items-center">
                          <span className={`${lexend.className} text-white text-xs mr-2`}>by: </span><Image src={'/images/user2.png'} alt={'user'} width={30} height={30} className="rounded-full cursor-pointer bg-red-200"/>
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/insight-pic:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            Tadiwa
                          </span>
                        </div>
                      </div>
                    

                    </div>  

                    <div className="flex flex-row items-center justify-between w-full h-[15%] mt-2 space-y-1 backdrop-blur-md overflow-y-auto overflow-x-hidden custom-scrollbar rounded-lg">
                      <div className="flex flex-row items-center justify-center space-x-1 w-[60%] bg-white p-1 rounded-full">
                        <div className="flex flex-row items-center justify-between w-[5%] p-1 bg-red-500 rounded-full"></div>
                        <h1 className={`${inter.className} text-sm text-black`}>Numerical Insights</h1>
                      </div>
                        <IoMdMenu className='text-2xl text-black p-1 bg-white rounded-full cursor-pointer'/>
                    </div>     

                    <div className="flex flex-col items-center justify-between w-full h-[50%] mt-2 space-y-1 bg-white backdrop-blur-md overflow-y-auto overflow-x-hidden custom-scrollbar rounded-lg">

                  
                        <div  className="flex flex-col items-center justify-center w-full space-x-1 p-1 border-b border-gray-100">
                          <div className="flex flex-col items-center justify-between w-[50%] rounded-lg space-y-1">
                            <h1 className={`${lexend.className} text-sm text-black`}>Total Uploads</h1>
                            <h1 className={`${poppins.className} text-2xl text-orange-500 `}>{numInsights[selectedChartIndex].totalUploads}</h1>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center w-full space-x-1 p-1 border-b border-gray-100">
                          <div className="flex flex-col items-center justify-between w-[50%] rounded-lg space-y-1">
                            <h1 className={`${lexend.className} text-sm text-black`}>Total Signed</h1>
                            <h1 className={`${poppins.className} text-2xl text-orange-500 `}>{numInsights[selectedChartIndex].totalSigned}</h1>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center w-full space-x-1 p-1 border-b border-gray-100">
                          <div className="flex flex-col items-center justify-between w-[50%] rounded-lg space-y-1">
                            <h1 className={`${lexend.className} text-sm text-black`}>Total Missing</h1>
                            <h1 className={`${poppins.className} text-2xl text-orange-500 `}>{numInsights[selectedChartIndex].totalMissing}</h1>
                          </div>
                        </div>
  
                    </div>

                    {/* <div className="flex flex-row items-center justify-center rounded-xl bg-black mt-2 mb-2 p-1 w-[60%] h-[10%] space-x-1">
                      <h1 className={`${inter.className} text-xs text-white `}>See more..</h1>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Navigation Button */}
            <button
              onClick={() => setSelectedChartIndex((prev) => (prev < chartConfigs.length - 1 ? prev + 1 : 0))}
              className="p-1 bg-white shadow-md rounded-full ml-2 absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/chart-nav:opacity-100 transition-opacity duration-200"
            >
              <FaChevronRight size={15} className='text-gray-500'/>
            </button>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center md:justify-between w-full h-[85%] md:h-[29.58%] p-1 mt-2 space-x-1">
          <div className="flex flex-col w-1/2 p-1 bg-white overflow-auto custom-scrollbar rounded-lg h-full relative hidden md:block">
            {/* Scheduling Grid */}
            <Scheduler />
          </div>
          <div className=' flex flex-col md:flex-row w-full md:w-1/2 md:space-x-1 space-y-1 justify-between items-center rounded-lg md:h-full h-[100%] relative' >

            {/* FADE PANEL START */}
            <div className={`flex flex-col items-center justify-between w-full md:w-[65%] h-[45%] md:h-[100%] space-y-1 p-2 rounded-lg relative md:border md:border-gray-200 border border-gray-200 fade-upload-panel${fadePanel ? '' : ' hide'}`}
              >
              {/* Hamburger Icon and Tooltip with delayed hide */}
              {(() => {
                const [showTooltip, setShowTooltip] = React.useState(false);
                const hideTimeout = React.useRef();
                // Handlers
                const handleMouseEnter = () => {
                  clearTimeout(hideTimeout.current);
                  setShowTooltip(true);
                };
                const handleMouseLeave = () => {
                  hideTimeout.current = setTimeout(() => setShowTooltip(false), 300);
                };
                React.useEffect(() => () => clearTimeout(hideTimeout.current), []);
                return (
                  <div className="absolute top-3 right-6 z-30"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <FiMenu className="text-lg text-black cursor-pointer hover:text-black bg-gray-100 p-1 rounded-full" />
                    {showTooltip && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg transition-opacity duration-200 flex flex-col py-2 opacity-100 pointer-events-auto">
                        <button
                          className="flex items-center px-3 py-2 hover:bg-gray-100 w-full text-left"
                          onClick={() => {
                            setUploadView('list');
                            setShowTooltip(false);
                          }}
                        >
                          <MdViewList className="mr-2 text-lg" /> List View
                        </button>
                        <button
                          className="flex items-center px-3 py-2 hover:bg-gray-100 w-full text-left"
                          onClick={() => {
                            setUploadView('grid');
                            setShowTooltip(false);
                          }}
                        >
                          <MdGridView className="mr-2 text-lg" /> Grid View
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()} 
              {/* Upload Panel Content - dynamic */}
              {uploadView === 'grid' ? (
                <>
                  <div className='h-[10%] w-full flex flex-row items-center justify-start p-1'>
                    <h1 className={`${lexend.className} text-sm text-white tracking-wider font-semibold bg-black p-1 rounded-lg text-left w-[60%]`}>Recent Uploads</h1>
                    
                    <button
                      className="flex flex-row ml-4 items-center justify-center border border-gray-200 text-black rounded-full p-1 hover:bg-gray-100 hover:text-black hover:scale-105 align-center"
                      onClick={() => {
                        handleFadePanel('prev');
                      }}
                      aria-label="Previous Upload"
                    >
                      <FaArrowLeftLong className="text-xs"/>
                    </button>

                    <button
                      className="flex flex-row ml-2 items-center justify-center border border-gray-100 text-black rounded-full p-1 hover:bg-gray-100 hover:text-black hover:scale-105"
                      onClick={() => {
                        handleFadePanel('next');
                      }}
                      aria-label="Next Upload"
                    >
                      <FaArrowRightLong className="text-xs"/>
                    </button>
                  </div>

                  <div className='h-[7%] w-full flex flex-row items-center justify-start p-1 mt-3'>
                    
                    <h1 className={`${inter.className} text-xs text-gray-400 flex items-center tracking-wider`}>
                      {uploads[currentUploadIndex].lastUpload}
                      {/* Squircular badge for lastUpload */}

                      {(() => {
                        // Parse lastUpload (assume DD/MM/YYYY or ISO)
                        let uploadDate;
                        const val = uploads[currentUploadIndex].lastUpload;
                        if (typeof val === 'string' && val.includes('/')) {
                          // DD/MM/YYYY
                          const [day, month, year] = val.split('/').map(Number);
                          uploadDate = new Date(year, month - 1, day);
                        } else {
                          // ISO or Date object
                          uploadDate = new Date(val);
                        }
                        const now = new Date('2025-05-09T10:57:36+02:00');
                        const diffMs = now - uploadDate;
                        const diffDays = diffMs / (1000 * 60 * 60 * 24);
                        const isNew = diffDays < 1;
                        return (
                          <span
                            className={`${inter.className} text-xs squircular-badge ml-2 ${isNew ? 'bg-blue-600 text-blue-100 tracking-wide' : 'bg-red-500 text-red-100 tracking-wide'} rounded-lg p-1`}
                          >
                            {isNew ? 'New' : 'Old'}
                          </span>
                        );
                      })()}
                    </h1>
                  </div>
                  <div className='h-[15%] w-full flex flex-row items-center justify-start p-1'>
                    <h1 className={`${inter.className} text-lg text-black font-semibold truncate w-[69%]`}>
                      {uploads[currentUploadIndex].title}
                    </h1>
                    <span className="relative group ml-2">
                      <IoBarcode className='text-white cursor-pointer text-2xl rounded-sm bg-blue-500 p-1'/>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">Preview</span>
                    </span>
                    <span className="relative group ml-2">
                      <IoIosLink className='text-black cursor-pointer text-2xl rounded-full border border-gray-100 p-1'/>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">Share</span>
                    </span>

                  </div>
                  <div className = 'h-[60%] w-full flex flex-col items-center justify-center mt-2 p-1 space-x-1 border border-gray-200 rounded-lg shadow-md'>
                    <h1 className={`${inter.className} text-xs text-gray-400 tracking-wide w-full text-left ml-2 mt-1`}>
                      {uploads[currentUploadIndex].systemNameLabel}
                    </h1>
                    <div className='flex flex-row items-center justify-center w-full h-[95%] p-1'>
                      <h1 className={`${lexend.className} text-2xl md:text-4xl text-black`}>
                        {uploads[currentUploadIndex].systemName}
                      </h1>

                      <button 
                        className="flex flex-row ml-6 h-[100%] items-center justify-center space-x-1 border border-gray-100 text-black rounded-lg p-1 hover:bg-gray-100 hover:text-black hover:scale-105"
                        onClick={() => handleOpenUploadModal(uploads[currentUploadIndex])}
                      >
                        <h1 className={`${inter.className} text-xs`}>View Upload</h1>
                        <FaSquareArrowUpRight className="text-xs"/>                      
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-row items-center justify-around space-x-1 w-full h-[22%] p-1'>
                    <div className='flex flex-col items-center justify-center w-1/3 h-[100%] p-1 bg-green-200 rounded-lg shadow-md'>
                      <h1 className={`${inter.className} text-xs text-gray-600 tracking-wide`}>
                        Uploaded By
                      </h1>
                      <h1 className={`${inter.className} text-xs text-black mt-1`}>
                        {uploads[currentUploadIndex].uploadedBy}
                      </h1>
                    </div>
                    <div className='flex flex-col items-center justify-center w-1/3 h-[100%] p-1 bg-green-200 rounded-lg shadow-md'>
                      <h1 className={`${inter.className} text-xs text-gray-600 tracking-wide`}>
                        Uploaded Date
                      </h1>
                      <h1 className={`${inter.className} text-xs text-black mt-1`}>
                        {uploads[currentUploadIndex].uploadedDate}
                      </h1>
                    </div>
                    <div className='flex flex-col items-center justify-center w-1/3 h-[100%] p-1 bg-green-200 rounded-lg shadow-md'>
                      <h1 className={`${inter.className} text-xs text-gray-600 tracking-wide`}>
                        Uploaded Size
                      </h1>
                      <h1 className={`${inter.className} text-xs text-black mt-1`}>
                        {uploads[currentUploadIndex].uploadedSize}
                      </h1>
                    </div>                  
                  </div>
                </>
              ) : (
                // LIST VIEW TABLE
                <div className='flex flex-col items-center justify-between w-full h-full rounded-lg space-y-2 p-1 overflow-y-auto overflow-x-hidden scrollbar-hide'>
                  {/* Sticky header row */}
                  <div className="sticky top-0 z-10 bg-gray-100 rounded-t-lg w-full flex flex-row p-2 border-b border-gray-200 space-x-1">
                    <div className={`${inter.className}  w-[20%] text-xs font-semibold text-gray-700 text-center`}>System</div>
                    <div className={`${inter.className} w-[30%] text-xs font-semibold text-gray-700 text-center`}>Doc Name</div>
                    <div className={`${inter.className} w-[25%] text-xs font-semibold text-gray-700 text-center`}>Date</div>
                    <div className={`${inter.className} w-[25%] text-xs font-semibold text-gray-700 text-center`}>Uploaded By</div>
                  </div>
                  {/* Data rows */}
                  {uploads.map((upload, index) => (
                    <div key={index} className="flex flex-row items-center w-full bg-white rounded-sm my-1 p-2 shadow-sm hover:bg-gray-50 transition h-[40%] space-x-1">
                      <div className={`${inter.className} w-[20%] text-sm text-black font-medium truncate text-center`}>
                        {upload.systemName}
                      </div>
                      <div className={`${inter.className} w-[30%] text-sm text-black truncate text-center`}>
                        {upload.title}
                      </div>
                      <div className={`${inter.className} w-[25%] text-sm text-gray-700 text-center`}>
                        {upload.uploadedDate}
                      </div>
                      <div className={`${inter.className} w-[25%] text-sm text-gray-700 text-center`}>
                        {upload.uploadedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <style jsx>{`
                .fade-upload-panel {
                  opacity: 1;
                  transition: opacity 0.5s;
                }
                .fade-upload-panel.hide {
                  opacity: 0;
                }
              `}</style>
            </div>
            {/* FADE PANEL END */}


              <div className="flex flex-col items-center justify-between md:w-[30%] w-full md:h-full h-[53%] space-y-1  border border-gray-100 rounded-lg shadow-md bg-black">
                <div className="flex flex-col items-center justify-center w-full h-[35%] rounded-lg space-y-1 p-1">

                  <TbSignature className="text-6xl text-white"/>
                  <h1 className={`${inter.className} text-xs text-gray-300 p-2 bg-white/20 rounded-lg`}>Your e-signature</h1>

                </div>

                <div className="flex flex-col items-center justify-between w-full h-[65%] space-y-1 p-1 bg-white curved-inward-top">

                  <div className="flex flex-col items-center justify-end w-full h-[40%] p-1 space-y-1 mt-2">
                    <h1 className={`${inter.className} text-xl text-black tracking-wide`}>E-signature</h1>
                    <h1 className={`${inter.className} text-xs text-gray-400 tracking-wide`}>Settings for e-signature</h1>
                  </div>

                  <div className="flex flex-col items-center justify-center w-full h-[50%] p-1 space-y-2">
                    <button className="flex flex-row items-center justify-center space-x-1 bg-black/70 text-white rounded-lg h-[35%] p-1 hover:bg-gray-100 hover:text-black hover:scale-105">
                      <RiExchangeLine className="text-lg"/>
                      <h1 className={`${inter.className} text-xs`}>Change e-signature</h1>
                    </button>

                    <button className="flex flex-row items-center justify-center space-x-1 border border-gray-100 text-black rounded-lg h-[35%] p-1 hover:bg-gray-100 hover:text-black hover:scale-105">
                      <CgRemove className="text-lg"/>
                      <h1 className={`${inter.className} text-xs`}>Remove e-signature</h1>
                    </button>
                  </div>


                </div>
              </div>
          </div>
        
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && selectedUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(3px)' }}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full h-[90%] max-w-5xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-200" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              {/* Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className={`${inter.className} text-xl font-semibold`}>Document Preview</h3>
                <button 
                  onClick={handleCloseUploadModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-0 ">

                <div className="flex flex-col items-center justify-center h-full md:flex-row gap-2 w-full">

                  {/* Document Preview with Editing Tools */}
                  <div className="w-full md:w-[50%] h-full flex flex-col">
                    {/* Document Preview */}
                    <div className="relative bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center h-[92%] overflow-auto">
                      <Image 
                        src="/images/doc.png" 
                        alt="Document Preview"
                        width={600}
                        height={600}
                        className="object-cover w-full h-full max-w-full max-h-full"
                      />
                      {/* Editable elements container */}
                      <div 
                        className="absolute inset-0"
                        onClick={() => {
                          // Deselect all elements when clicking on empty space
                          setElements(elements.map(el => ({ ...el, isSelected: false })));
                          setSelectedElement(null);
                        }}
                      >
                        {elements.map((element) => (
                          <div
                            key={element.id}
                            className={`absolute border-2 ${element.isSelected ? 'border-blue-500' : 'border-transparent'} cursor-move`}
                            style={{
                              left: `${element.x}px`,
                              top: `${element.y}px`,
                              minWidth: `${element.width}px`,
                              minHeight: `${element.height}px`,
                              zIndex: element.zIndex,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementSelect(element.id, e);
                            }}
                            onDoubleClick={() => {
                              if (element.type === 'text') {
                                const updatedElements = elements.map(el => ({
                                  ...el,
                                  isEditing: el.id === element.id
                                }));
                                setElements(updatedElements);
                              }
                            }}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', element.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const id = e.dataTransfer.getData('text/plain');
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              handleElementMove(id, x, y);
                            }}
                          >
                            {element.type === 'text' ? (
                              element.isEditing ? (
                                <textarea
                                  className="w-full h-full p-1 resize-none focus:outline-none bg-yellow-50"
                                  value={element.content}
                                  onChange={(e) => {
                                    const updatedElements = elements.map(el => 
                                      el.id === element.id 
                                        ? { ...el, content: e.target.value } 
                                        : el
                                    );
                                    setElements(updatedElements);
                                  }}
                                  onBlur={() => {
                                    const updatedElements = elements.map(el => ({
                                      ...el,
                                      isEditing: false
                                    }));
                                    setElements(updatedElements);
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="w-full h-full p-1 whitespace-pre-wrap break-words"
                                >
                                  {element.content}
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <FaSignature className="text-4xl text-gray-400" />
                              </div>
                            )}
                            {element.isSelected && (
                              <div className="absolute -right-2 -top-2 flex space-x-1">
                                <button 
                                  className="bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedElements = elements.filter(el => el.id !== element.id);
                                    updateElements(updatedElements);
                                  }}
                                >
                                  <FaTimes className="text-red-500 text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Document Editing Tools */}
                    <div className="w-full mt-1 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 rounded hover:bg-gray-100"
                          title="Add Text"
                          onClick={() => addTextElement()}
                        >
                          <FaFont className="text-gray-700" />
                        </button>
                        <button 
                          className="p-2 rounded hover:bg-gray-100"
                          title="Add Signature"
                          onClick={() => addSignatureElement()}
                        >
                          <FaSignature className="text-gray-700" />
                        </button>
                        <div className="border-l border-gray-300 mx-1"></div>
                        <button 
                          className="p-2 rounded hover:bg-gray-100"
                          title="Undo"
                        >
                          <FaUndo className="text-gray-700" />
                        </button>
                        <button 
                          className="p-2 rounded hover:bg-gray-100"
                          title="Redo"
                        >
                          <FaRedo className="text-gray-700" />
                        </button>
                      </div>
                      <button 
                        className="bg-black text-white p-2 rounded hover:bg-blue-600 text-sm flex items-center"
                        onClick={saveDocument}
                      >
                        <FaSignature className="text-white mr-2" />
                        Sign Document
                      </button>
                    </div>
                  </div>

 
                 
                  <div className="w-full md:w-1/2 h-full space-y-6 flex flex-col items-center justify-center p-2">

                    <h3 className={`${inter.className} text-sm bg-black p-2 text-white rounded-lg font-semibold`}>Document Metadata</h3>                    

                    {/* Document Details */}
                  
                    <div className="grid grid-cols-2 gap-3 w-full p-4">
                      {/* Row 1 */}
                      <div className="flex flex-col p-3 border border-gray-200 rounded-lg justify-center items-center bg-black/2 space-y-2">
                        <p className={`${inter.className} text-sm text-gray-500`}>System</p>
                        <p className={`${inter.className} text-base font-medium`}>
                          {selectedUpload.systemName}
                        </p>
                      </div>
                      
                      <div className="flex flex-col p-3 border border-gray-200 rounded-lg justify-center items-center bg-black/2 space-y-2">
                        <p className={`${inter.className} text-sm text-gray-500`}>Uploaded By</p>
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <FaRegUser className="text-gray-500 text-sm" />
                          </div>
                          <p className={`${inter.className} font-medium text-sm`}>
                            {selectedUpload.uploadedBy}
                          </p>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="flex flex-col p-3 border border-gray-200 rounded-lg justify-center items-center bg-black/2 space-y-2">
                        <p className={`${inter.className} text-sm text-gray-500`}>Uploaded Date</p>
                        <p className={`${inter.className} font-medium text-sm`}>
                          {selectedUpload.uploadedDate}
                        </p>
                      </div>

                      <div className="flex flex-col p-3 border border-gray-200 rounded-lg justify-center items-center bg-black/2 space-y-2">
                        <p className={`${inter.className} text-sm text-gray-500`}>Status</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck className="mr-1 text-xs" />
                          Uploaded
                        </span>
                      </div>
                    </div>

                    <div className=" w-full p-2 h-[8%] flex flex-row items-start justify-between">
                        <div>
                          <p className={`${inter.className} text-sm text-gray-500`}>File Type</p>
                          <p className={`${inter.className} font-medium`}>
                            {selectedUpload.title.split('.').pop().toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className={`${inter.className} text-sm text-gray-500`}>Size</p>
                          <p className={`${inter.className} font-medium`}>{selectedUpload.uploadedSize}</p>
                        </div>
                      </div> 

                    <div className="pt-4 border-t h-[10%] w-full">
                      <div className="flex space-x-3">
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <IoIosLink className="mr-2" />
                          <span className={`${inter.className} text-sm`}>Share</span>
                        </button>
                        <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center">
                          <FaDownload className="mr-2" />
                          <span className={`${inter.className} text-sm`}>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approver;