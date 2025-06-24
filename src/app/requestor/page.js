"use client"
import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import Image from "next/image";
import {inter, lexend} from "../../../public/fonts.ts";
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
    FaUser,
    FaUsers,
    FaFile,
    FaChevronDown,
    FaRegUser,
  } from 'react-icons/fa';

  import { HiOutlineDatabase } from "react-icons/hi";
  import { RiExchange2Line } from "react-icons/ri";
  import { MdOutlineVpnKey } from "react-icons/md";
  import { RiAdminLine } from "react-icons/ri";
  import { AiOutlineFire } from "react-icons/ai";
  import { GrFormView } from "react-icons/gr";
  import "@/app/globals.css";
  import { useRouter } from 'next/navigation';
  import { BiCog } from "react-icons/bi";
import { HiOutlineBell } from 'react-icons/hi2';
import { handleCharts } from '../../../lib/global-api.js';
import WebSocketInstance from  '../../../lib/websocket.js'
import { handleSubsidiaries } from './api.js';

  
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
  'D365 App',
  'D365 DB',
  'Active Directory',
  'Data Centre',
  'Program Changes',
  'Backups',
  'User Monitoring',
  'VPN',
  'Firewall',
  'Admins',
];

const systemsWithCards = [
  {'system':'Data Centre', 'icon': HiOutlineDatabase,}, 
  {'system':'Program Changes', 'icon': RiExchange2Line },
  {'system':'VPN', 'icon': MdOutlineVpnKey},
  {'system':'Firewall', 'icon': AiOutlineFire},
  {'system':'Admins', 'icon': RiAdminLine},];

  const dummyUploads = [
    {
      name: 'Annual Report 2025',
      system: 'D365 App',
      status: 'Approved',
      creator: 'John Doe'
    },
    {
      name: 'Budget Plan',
      system: 'Active Directory',
      status: 'Cancelled',
      creator: 'Jane Smith'
    },
    {
      name: 'Q1 Sales Report',
      system: 'D365 DB',
      status: 'Approved',
      creator: 'Mike Johnson'
    },
    {
      name: 'Employee Handbook',
      system: 'User Monitoring',
      status: 'Cancelled',
      creator: 'Sarah Wilson'
    }
  ];

  const dummyComments = [
    {
      name: 'J.Doe',
      system: 'Active Directory',
      status: 'New'
    },
    {
      name: 'J.Smith',
      system: 'D365 App',
      status: 'New'
    },
    {
      name: 'M.Johnson',
      system: 'User Monitoring',
      status: 'Old'
    },
    {
      name: 'S.Wilson',
      system: 'Data Centre',
      status: 'Old'
    },
    {
      name: 'S.Machiri',
      system: 'Data Centre',
      status: 'Old'
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

function loadChart(chartId, labels, data, backgroundColor, borderColor, type) {
  const ctx = document.getElementById(chartId).getContext('2d');
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Uploaded Documents',
        data: data,
        backgroundColor: backgroundColor,
        borderColor: type === 'doughnut' ? 'white' : borderColor,
        borderWidth: type === 'doughnut' ? 3 : 1,
        fill: true,
        tension: 0.4,
        pointRadius: 1,
        borderRadius: type === 'doughnut' ? 7 : 0,
        cutout: type === 'doughnut' ? '70%' : '0%',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      plugins: {
        legend: {
          display: true,
          position: type === 'doughnut' ? 'left' : 'top',
          align: 'start',
          labels: {
            boxWidth: 15,
            padding: 17,
          }
        }
      },
      scales: type === 'doughnut' ? {} : {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}



const Page = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [showMobileInfoSnackbar, setShowMobileInfoSnackbar] = useState(false);
  const chartRefs = useRef({});
  const [subsidiariesData, setSubsidiariesData] = useState({});

  // Handler for showing snackbar
  const handleShowMobileInfo = () => {
    setShowMobileInfoSnackbar(true);
    setTimeout(() => setShowMobileInfoSnackbar(false), 5000);
  }

  // Helper function to get month name from month number (0-11)
  const getMonthName = (monthNumber) => {
    const date = new Date(0, monthNumber);
    return date.toLocaleString('default', { month: 'long' });
  };

  // HandleSubsidiaries function implementation
  useEffect(() => {
    const loadData = async () => {
      const data = {};
      const monthName = getMonthName(selectedMonth);

      for (const system of systemsWithCards) {
        try {
          const count = await handleSubsidiaries(system.system, monthName);
          data[system.system] = count;
        } catch (e) {
          console.error(`Error loading data for ${system.system}:`, e);
          data[system.system] = 0;
        }
      }
      console.log(data);
      setSubsidiariesData(data);
    };
    
    loadData();
  }, [selectedMonth]); // Only re-run when selectedMonth changes

  // Initialize WebSocket and set up chart updates
  useEffect(() => {
    WebSocketInstance.connect();

    const handleChartData = (data) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Update each chart with new data
        if (data['D365']) {
            updateChart('chart-d365-app', months, data['D365'], 
                ['rgba(18, 63, 227, 0.2)'], 
                ['rgba(18, 63, 227, 1)'], 'bar');
        }
        else if (data['Active Directory']) {
            updateChart('chart-active-directory', months, data['Active Directory'], 
                ['rgba(255, 99, 132, 0.2)'], 
                ['rgba(255, 99, 132, 1)'], 'bar');
        }
        else if (data['D365 Db']) {
            updateChart('chart-d365-db', months, data['D365 Db'], 
                ['rgba(18, 63, 227, 0.2)'], 
                ['rgba(18, 63, 227, 1)'], 'line');
        }
        else if (data['User Monitoring']) {
            updateChart('chart-user-monitoring', months, data['User Monitoring'], 
                ['rgba(255, 99, 132, 0.2)'], 
                ['rgba(255, 99, 132, 1)'], 'line');
        }
        else if (data['Backups']) {
            updateChart('chart-backups', months, data['Backups'], 
                ['rgba(18, 63, 227, 0.2)', 'rgba(18, 63, 227, 0.3)', 'rgba(18, 63, 227, 0.4)', 
                 'rgba(18, 63, 227, 0.5)', 'rgba(18, 63, 227, 0.6)', 'rgba(18, 63, 227, 0.7)', 
                 'rgba(18, 63, 227, 0.8)', 'rgba(18, 63, 227, 0.9)', 'rgba(18, 63, 227, 1.0)', 
                 'rgba(18, 63, 227, 0.8)', 'rgba(18, 63, 227, 0.6)', 'rgba(18, 63, 227, 0.4)'], 
                ['rgba(18, 63, 227, 1)'], 'doughnut');
        }
    };

    WebSocketInstance.addCallbacks(handleChartData);

    return () => {
        WebSocketInstance.removeCallback(handleChartData);
    };
  }, 
  []);

  useEffect(() => {
    const loadAllCharts = async () => {

      try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Load data for all charts in parallel
        const [
          d365Data,
          adData,
          d365dbData,
          userMonitoringData,
          backupsData
        ] = await Promise.all([
          handleCharts('D365'),
          handleCharts('Active Directory'),
          handleCharts('D365 Db'),
          handleCharts('User Monitoring'),
          handleCharts('Backups')
        ]);

        // Initialize charts with the fetched data
        loadChart('chart-d365-app', months, d365Data, ['rgba(18, 63, 227, 0.2)'], ['rgba(18, 63, 227, 1)'], 'bar');
        loadChart('chart-active-directory', months, adData, ['rgba(255, 99, 132, 0.2)'], ['rgba(255, 99, 132, 1)'], 'bar');
        loadChart('chart-d365-db', months, d365dbData, ['rgba(18, 63, 227, 0.2)'], ['rgba(18, 63, 227, 1)'], 'line');
        loadChart('chart-user-monitoring', months, userMonitoringData, ['rgba(255, 99, 132, 0.2)'], ['rgba(255, 99, 132, 1)'], 'line');
        loadChart('chart-backups', months, backupsData, 
          ['rgba(18, 63, 227, 0.2)', 'rgba(18, 63, 227, 0.3)', 'rgba(18, 63, 227, 0.4)', 
           'rgba(18, 63, 227, 0.5)', 'rgba(18, 63, 227, 0.6)', 'rgba(18, 63, 227, 0.7)', 
           'rgba(18, 63, 227, 0.8)', 'rgba(18, 63, 227, 0.9)', 'rgba(18, 63, 227, 1.0)', 
           'rgba(18, 63, 227, 0.8)', 'rgba(18, 63, 227, 0.6)', 'rgba(18, 63, 227, 0.4)'], 
          ['rgba(18, 63, 227, 1)'], 'doughnut');
      } catch (error) {
        console.error('Error loading charts:', error);
      }
    };

    loadAllCharts();
  }, []);

  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Snackbar for mobile info */}
      {showMobileInfoSnackbar && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in-out">
          Insights for other systems are not available on mobile
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`hidden md:block h-full bg-blue-800 text-white p-2 transition-all duration-400 flex flex-col items-center justify-between ${
            isSidebarExpanded ? 'w-[11%]' : 'w-[5%]'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        >
        <Image
          className="dark:invert"
          src="/images/reallogo.png"
          alt="logo"
          width={180}
          height={38}
          priority
        />
    
        <ul className="space-y-2 h-[80%] flex flex-col items-center justify-center">
            <h2 className={`text-xl font-bold ${isSidebarExpanded ? 'block' : 'hidden'}`}>Systems</h2>

            {systems.map((system, index) => {
              const IconComponent = systemIcons[index];
              return (
                <li 
                  key={index} 
                  className="mb-2 hover:bg-blue-700 p-2 rounded flex flex-row justify-center items-center w-full cursor-pointer"
                  onClick={() => {
                    if (index === 0) {
                      router.push('/D365App');
                    }
                  }}
                >
                  <IconComponent className="mr-2 text-xl" size={25} /> 
                  <span className={`${isSidebarExpanded ? 'block' : 'hidden'} ${lexend.className} text-sm w-3/4`}>{system}</span>
                </li>
              );
            })}
        </ul>
    </div>

      {/* Main Content */}
      <div className="flex-1 w-[95%] h-screen overflow-hidden overflow-y-auto md:overflow-y-hidden scrollbar-hide">

        {/* Header */}
        <header className="sticky top-0 z-40 w-full h-[8%] flex flex-row p-4 justify-between items-center border border-b-1 border-gray-300 md:bg-white backdrop-blur-lg">
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


        {/* Mobile BottomSheet Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 backdrop-blur-xs bg-opacity-30" onClick={() => setShowMobileMenu(false)} />
            {/* BottomSheet */}
            <div className="relative w-full bg-white rounded-t-2xl shadow-lg p-5 animate-slide-up flex flex-col max-h-[80vh] overflow-y-auto">
              {/* Close Button */}
              <button className="absolute top-3 right-5 text-xl text-white p-1 rounded-full bg-black w-6 h-6 flex justify-center items-center" onClick={() => setShowMobileMenu(false)}>&times;</button>
              {/* Nav Section */}
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-gray-500 mb-2 text-center">Navigation</h2>
                <div className="flex flex-row w-full gap-2 justify-center items-center h-20">
                  {['Home', 'Emails', 'Pending'].map((label, idx) => (
                    <button
                      key={label}
                      className={`flex flex-col items-center justify-center flex-1 p-3 rounded transition-colors duration-150
                        ${selectedNav === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                      onClick={() => {
                        // setSelectedNav(idx);
                        setShowMobileMenu(false);
                        /* add navigation logic here */
                      }}
                    >
                      <span className={`${inter.className} text-sm`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* User Section */}
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-gray-500 mb-2 text-center">User</h2>
                <div className="flex flex-row w-full gap-2 justify-center items-center h-20">
                  {[
                    { label: 'Settings', icon: <BiCog className="text-lg mb-1" /> },
                    { label: 'Notifications', icon: <HiOutlineBell className="text-lg mb-1" /> },
                    { label: 'Profile', icon: <FaRegUser className="text-lg mb-1" /> },
                  ].map((item, idx) => (
                    <button
                      key={item.label}
                      className={`flex flex-col items-center justify-center flex-1 p-3 rounded transition-colors duration-150
                        ${selectedUser === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                      onClick={() => {  
                        setSelectedUser(idx);
                        setShowMobileMenu(false);
                        /* add user logic here */
                      }}
                    >
                      {item.icon}
                      <span className={`${inter.className} text-sm`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Systems Section */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 mb-2 text-center">Systems</h2>
                <div className="grid grid-cols-2 gap-2 items-center justify-center">
                  {systems.map((system, idx) => {
                    const IconComponent = systemIcons[idx];
                    return (
                      <button key={system} className="flex items-center gap-2 p-2 rounded bg-gray-100 border border-gray-200 hover:bg-gray-200 h-12" onClick={() => { setShowMobileMenu(false); }}>
                        {IconComponent && <IconComponent className="text-blue-700 text-lg" />}
                        <span className={`${inter.className} text-xs`}>{system}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tablet and up: Show full header */}
        <div className="hidden md:flex flex-row justify-between items-center w-full">
          <div className="flex flex-row items-center p-2 border border-gray-300 rounded">
            <h1 className={`${inter.className} text-xl`}>Access Control Portal</h1>
          </div>
          <div className="flex flex-row justify-around w-[39%] items-center">
            <div className="flex space-x-4 text-black justify-around flex-row rounded-full p-1 bg-gray-100 ">
              <div className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                <span className={`${inter.className} text-sm tracking-wide `}>Overview</span>
              </div>
              <div className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                <span className={`${inter.className} text-sm tracking-wide `}>Emails</span>
              </div>
              <div className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                <span className={`${inter.className} text-sm tracking-wide `}>Pending</span>
              </div>
              <div className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                <span className={`${inter.className} text-sm tracking-wide `}>Comments</span>
              </div>
              <div className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                <span className={`${inter.className} text-sm tracking-wide `}>Meetings</span>
              </div>
            </div>
            <button className="flex items-center space-x-2 hover:bg-gray-200 p-3 rounded-full cursor-pointer bg-gray-100">
              <BiCog />
              <span className={`${inter.className} text-sm tracking-wide `}>Settings</span>
            </button>
            <button className="flex items-center space-x-2 hover:bg-gray-200 p-2 w-12 h-12 justify-center rounded-full cursor-pointer bg-gray-100">
              <HiOutlineBell />
            </button>
            <button className="flex items-center space-x-2 hover:bg-gray-200 p-2 w-12 h-12 justify-center rounded-full cursor-pointer bg-gray-100">
              <FaRegUser/>
            </button>
          </div>
        </div>
      </header>

        <div className="flex flex-row items-center w-full h-[7%] mt-2">
            <h1 className={`${lexend.className} md:text-4xl text-3xl ml-4`}>Welcome back, Tadiwa</h1>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full  md:h-[9%] mt-2 p-1">

            <div className="items-center w-full md:w-1/3 h-full flex flex-col p-2 ">

              <h1 className={`${lexend.className} text-sm self-start ml-2`}>Overall Performance</h1>

              <div className="flex flex-row items-center justify-between w-full h-full p-2 space-x-1">
                <h1 className={`${lexend.className} text-sm w-[40%] md:w-[40%] text-xs bg-green-200 text-center items-center justify-center rounded-full p-1`}>Completed: 40%</h1>
                <h1 className={`${lexend.className} text-sm w-[20%] md:w-[20%] text-xs bg-black text-center items-center justify-center rounded-full p-1 text-white`}>Ongoing: 20%</h1>
                <h1 className={`${lexend.className} text-sm w-[40%] md:w-[40%] text-xs bg-red-500 text-center items-center justify-center rounded-full p-1 text-white`}>Pending: 60%</h1>
              </div>
            </div>

            <div className="items-center w-full md:w-1/3 h-full flex flex-col p-2 justify-between">

              <h1 className={`${lexend.className} text-sm self-start h-1/6 ml-2 md:ml-0`}>Overall Statistics</h1>

              <div className="flex flex-row items-center justify-between w-full h-4/6 p-1 space-x-3 ">
                
                <div className="w-1/4 h-full flex flex-col items-center justify-between ">
                
                  <div className="h-3/4 flex flex-row items-center justify-between">
                    <FaUsers className="rounded-full text-xl p-1 h-6 w-6 bg-gray-100" size={20}/>
                    <h1 className={`${lexend.className} text-3xl  items-center justify-center rounded-full p-1`}>8</h1>
                  </div>

                    <p className={`${lexend.className} text-xs items-center text-left`}>Users</p>
                </div>

                <div className="w-1/4 h-full flex flex-col items-center justify-between ">
                
                  <div className="h-3/4 flex flex-row items-center justify-between">
                    <FaFile className="rounded-full h-6 w-6 p-1 bg-gray-100" size={20}/>
                    <h1 className={`${lexend.className} text-3xl  items-center justify-center rounded-full p-1`}>1000</h1>
                  </div>

                    <p className={`${lexend.className} text-xs items-center text-left`}>Signed</p>
                </div>

                <div className="w-1/4 h-full flex flex-col items-center justify-between ">
                
                  <div className="h-3/4 flex flex-row items-center justify-between">
                    <FaLayerGroup className="rounded-full text-xl p-1 h-6 w-6 bg-gray-100" size={20}/>
                    <h1 className={`${lexend.className} text-3xl  items-center justify-center rounded-full p-1`}>100</h1>
                  </div>

                    <p className={`${lexend.className} text-xs items-center text-left`}>Unsigned</p>
                </div>


              </div>

            </div>
        </div>

        <div className="w-full h-[63.5%] flex md:flex-row flex-col justify-between p-2">
          
          <div className="w-full h-full flex flex-col justify-between space-y-2 md:space-y-0">

            <div className="w-full h-1/2 flex flex-col md:flex-row justify-between md:bg-gray-100 md:p-4 md:ml-2 p-2 rounded-lg overflow-y-auto max-h-[60vh] space-y-2 snap-y snap-mandatory scrollbar-hide">

              <div className="shadow-md md:w-[31%] w-full rounded-lg md:p-6 p-6 h-full bg-white hover:bg-blue-200 snap-center">
                
                <div className="flex justify-between items-center mb-1">
                  <h2 className={`${inter.className} text-sm font-bold`}>D365 App</h2>
                  <div className="relative">
                    <select 
                      className={`${inter.className} text-xs text-gray-800 bg-gray-100 p-1 pr-6 rounded focus:outline-none cursor-pointer appearance-none`}
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
                
                <div className="h-full w-full overflow-x-auto overflow-y-hidden">
                    <canvas id="chart-d365-app" className="h-full w-full  "></canvas>
                </div>
              </div>

              <div className="shadow-md md:w-[31%] w-full rounded-lg p-6 h-full bg-white hover:bg-blue-200 snap-center">
                <div className="flex justify-between items-center mb-1">
                  <h2 className={`${inter.className} text-sm font-bold`}>D365 DB</h2>
                  <div className="relative">
                    <select 
                      className={`${inter.className} text-xs text-gray-800 bg-gray-100 p-1 pr-6 rounded focus:outline-none cursor-pointer appearance-none`}
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
                <div className="h-full w-full overflow-x-auto overflow-y-hidden">
                    <canvas id="chart-d365-db" className="h-full w-full"></canvas>
                </div>
              </div>

              <div className="shadow-md md:w-[31%] w-full rounded-lg p-6 h-full bg-white hover:bg-red-200 snap-center ">
                <div className="flex justify-between items-center mb-1">
                  <h2 className={`${inter.className} text-sm font-bold`}>Active Directory</h2>
                  <div className="relative">
                    <select 
                      className={`${inter.className} text-xs text-gray-800 bg-gray-100 p-1 pr-6 rounded focus:outline-none cursor-pointer appearance-none`}
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

                <div className="h-full w-full overflow-x-auto overflow-y-hidden">
                    <canvas id="chart-active-directory" className="h-full w-full"></canvas>
                </div>
              </div>
            </div>

            <div className="w-full h-1/2 flex flex-col md:flex-row justify-between md:p-4 md:ml-2 p-2 rounded-lg scrollbar-hide snap-y snap-mandatory overflow-y-auto max-h-[60vh]" >

              <div className="shadow-md md:w-[31%] w-full rounded-lg p-6 h-full bg-white hover:bg-red-200 snap-center">
                <div className="flex justify-between items-center mb-1">
                  <h2 className={`${inter.className} text-sm font-bold`}>User Monitoring</h2>
                  <div className="relative">
                    <select 
                      className={`${inter.className} text-xs text-gray-800 bg-gray-100 p-1 pr-6 rounded focus:outline-none cursor-pointer appearance-none`}
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
                <div className="h-full w-full overflow-x-auto overflow-y-hidden">
                    <canvas id="chart-user-monitoring" className="h-full w-full"></canvas>
                </div>
              </div>

              <div className="w-[65.5%] flex flex-row shadow-md md:w-[65%] w-full rounded-lg h-full p-4 snap-center">

                <div className = 'md:w-1/2 w-full flex flex-col p-2'>
                  <div className="flex justify-between items-center mb-1">
                    <h2 className={`${inter.className} text-sm font-bold`}>Backups</h2>
                    <div className="relative">
                      <select 
                        className={`${inter.className} text-xs text-gray-800 bg-gray-100 p-1 pr-6 rounded focus:outline-none cursor-pointer appearance-none`}
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

                  <div className="h-[99%] w-full overflow-x-auto overflow-y-hidden justify-between">
                      <canvas id="chart-backups" className="h-full w-full p-3 flex flex-row justify-between"></canvas>
                  </div>

                </div>

                <div className='flex flex-col w-1/2 p-2 h-[90%] rounded-xl overflow-hidden border border-gray-200 hidden md:block'>

                  <div className='flex flex-col w-full h-full space-y-1 '>
                    <h2 className={`${lexend.className} text-sm font-bold mb-2`}>Recent Uploads</h2>
                    
                    <div className='flex flex-row text-sm text-center text-black bg-gray-100 p-2 rounded-lg'>
                      <div className='w-1/4 hover:bg-white rounded-full p-1'>Name</div>
                      <div className='w-1/4 hover:bg-white rounded-full p-1'>System</div>
                      <div className='w-1/4 hover:bg-white rounded-full p-1'>Status</div>
                      <div className='w-1/4 hover:bg-white rounded-full p-1'>Creator</div>
                    </div>

                    <div className='space-y-2 overflow-hidden overflow-y-auto scrollbar-hide'>
                      {dummyUploads.map((upload, index) => (
                        <div key={index} className='flex flex-row text-xs items-center text-center bg-white rounded-lg p-2 hover:bg-blue-100'>
                          <div className='w-1/4 truncate '>{getFirstTwoWords(upload.name)}</div>
                          <div className='w-1/4'>{upload.system}</div>
                          <div className='w-1/4 flex items-center justify-center'>{getStatusIndicator(upload.status)}</div>
                          <div className='w-1/4'>{upload.creator}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className='flex flex-col justify-between w-1/4 h-full bg-gray-100 rounded-lg p-2 hidden md:block'>
          
            <div className="flex p-1 mb-2 items-center flex-row justify-between bg-white w-full">
              <h2 className={`${inter.className} text-lg font-bold w-full text-left ml-4`}>Target Statistics</h2>

              <div className='flex flex-row items-center space-x-1'>
                <p className={`${lexend.className} text-xs text-gray-500 text-left mr-2`}>Jan</p>
                <FaChevronDown className="text-gray-500 text-xs" />
              </div>
            </div>

            <div className="flex flex-col justify-between items-center w-full bg-white p-3 h-[25%] overflow-hidden relative">

              <h2 className={`${inter.className} text-sm text-gray-700 w-full text-left ml-4`}>In progress</h2>

              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-4.5">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

                <div className='flex flex-col items-center justify-center'>
                  <p className={`${inter.className} text-sm text-gray-600`}>Estimated processing finish time</p>
                  <p className={`${inter.className} text-xs text-gray-500`}>4-5 business days</p>
                </div>
            </div>

            <div className='flex flex-col w-full p-2 h-[68%] bg-gray-100 rounded-xl overflow-hidden overflow-y-auto space-y-2'>
              
              <div className = 'flex flex-row items-center justify-between border p-1 rounded-lg border-gray-200 duration-300'>
                <h1 className= {`${lexend.className} text-black text-lg  ml-2 tracking-wide`} >Subsidiaries</h1>

                <div className='relative'>
                  <select 
                    className={`${lexend.className} text-xs text-gray-800 bg-gray-200 p-2 pr-6 rounded-full appearance-none focus:outline-none cursor-pointer`}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(0, i);

                      const monthName = date.toLocaleString('default', { month: 'long' });
                      return (
                        <option key={i} value={i}>
                          {monthName}
                        </option>
                      );
                    })}
                  </select>
                  <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                </div>

              </div>

              {systemsWithCards.map((system, index) => {

                const Icon = system.icon
                               
                
                return (
                <div key={index} className='w-full hover:bg-gray-200 flex flex-row h-1/6 rounded-xl items-center justify-around hover:translate-x-2 duration-300'>

                  <div className = 'h-full w-1/3 flex flex-col items-center justify-center text-center'>
                    < Icon size={35} color='white' className='p-2 bg-black rounded-full'/>
                  </div>

                  <div className = ' flex flex-col p-1 h-full justify-around items-center w-1/3'>
                    <h1 className= {`${lexend.className} text-black text-sm truncate `} >{system.system}</h1>
                    {/* <div className='w-1/2 border' ></div> */}
                    <p className= {`${inter.className} text-gray-500 text-xs`} >Uploaded Docs</p>
                  </div>
                
                  <div className = 'h-full w-1/3 flex flex-row-reverse items-center justify-around text-center'>
                    <h1 className= {`${lexend.className} text-black text-2xl `} >{subsidiariesData[system.system]}</h1>
                  </div>

              </div>
              );
            })}
            </div>
            

          </div>



        </div>

        <div className='w-full md:h-26 flex md:flex-row flex-col justify-between p-2 md:space-x-2 space-y-2 md:space-y-0 '>

          <div className='flex flex-row justify-around h-full md:w-3/5 w-full items-center rounded-xl ml-2 '>

            <h2 className={`${lexend.className} text-sm font-bold p-2 bg-black text-white rounded-full `}>Comments</h2>

            <div className='md:w-full w-[90%] h-full flex flex-row items-center space-x-2 overflow-hidden overflow-x-auto scrollbar-hide rounded-xl p-1'>
              {dummyComments.map((comment, index) => (
                <div key={index} className='flex flex-row space-x-2 p-2 md:w-1/4 md:h-3/4 bg-white rounded-full border border-gray-200 items-center justify-between'>
                  <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center'>
                    <FaUser className="text-gray-500" />
                  </div>
                  
                  <div className='flex flex-col w-1/2 text-xs'>
                    <div className='flex justify-between items-center mb-1 w-full'>
                      <span className='w-2/3 truncate'>{comment.name}</span>
                      {getCommentIndicator(comment.status)}
                    </div>
                    <p className={`${inter.className} text-gray-500 w-full truncate`}>{comment.system}</p>
                  </div>
                  
                  <div className='flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200'>
                    <GrFormView className="text-gray-500" size={23} />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className = 'md:w-1/5 w-full h-full border border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-100 space-y-1 '>
          
            <div className='p-1'>
              <h2 className={`${lexend.className} text-lg font-bold`}>Quick Links</h2>
              <p className={`${inter.className} text-xs text-gray-500`}>Essential dues</p>
            </div>
          
          </div>

          <div className = 'md:w-1/5 w-full h-full border border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-100 '>
              <h1 className={`${lexend.className} text-lg p-1 text-black rounded-full`}>By Tadiee</h1>
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default Page;