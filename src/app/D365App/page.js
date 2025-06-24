'use client'
import { useState, useEffect, forwardRef } from 'react';

import { uploadFile } from './api';
import PendingApprovalsPanel from './PendingApprovalsPanel';
import Image from "next/image";
import { FaCircle, FaCheckCircle, FaRegUser, FaArrowDown, FaHandPointDown, FaFile, FaBars, FaUpload, FaFilePdf, FaFileWord, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import { useRef } from 'react';
import { IoSettingsOutline } from "react-icons/io5";
import { FiInfo, FiUpload, FiX, FiFile } from "react-icons/fi";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Slide,
  Typography,
  Divider
} from '@mui/material';
import { handleFileNameCharts } from '../../../lib/global-api';
import '../globals.css';


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MobileInfoSheet = dynamic(() => import("./MobileInfoSheet"), { ssr: false });
import { inter, lexend } from '../../../public/fonts';
import { MdViewInAr } from "react-icons/md";
import { HiViewColumns } from "react-icons/hi2";
import { MdOutlineNavigateNext, MdNavigateNext  } from "react-icons/md";
import { BsCalendar2Date } from "react-icons/bs";
import { LuCalendarClock } from "react-icons/lu";
import { TbAlarmPlus } from "react-icons/tb";
import { FaLocationArrow } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
import '@/app/globals.css';
import Chart from 'chart.js/auto';
import { CgCalendarToday } from "react-icons/cg";
import { TiDocument } from "react-icons/ti";
import { PiSignatureDuotone } from "react-icons/pi";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GrCompliance, GrFormNextLink } from "react-icons/gr";
import { TbBrandNextcloud } from "react-icons/tb";
import { MdDownloading } from "react-icons/md";
import { BsAppIndicator } from "react-icons/bs";
import { RiEditCircleLine } from "react-icons/ri";

const months = [
  'Jan', 'Feb', 'Mar', 'Apr',
  'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec',
];

// Dummy Y categories (e.g., could be different types of activity)
const categories = ['Activity A', 'Activity B', 'Activity C'];

const generateDummyData = () => {
  const data = [];
  for (let i = 0; i < months.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      data.push({
        x: months[i],
        y: categories[j],
        value: Math.floor(Math.random() * 100),
      });
    }
  }
  return data;
};

const DocumentUploadForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    system: '',
    documentName: '',
    month: '',
    fileType: '',
    file: null,
    year: new Date().getFullYear()
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

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
    'Admins'
  ];
  const documentNames = [
    'User Modification Reviews',
    'Super User Access Reviews',
    'Access Forms',
    'Developers Access Reviews',
    'Braintree Access Reviews',
    'Role Based Matrices',
    'User Termination Reviews',
    'User Creation Reviews',
    'OS Layer Reviews',
    'User Recertifications',
    'User Access Reviews',
  ];
  const fileTypes = ['PDF', 'DOCX', 'XLSX', 'JPG', 'PNG'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.system) newErrors.system = 'System is required';
    if (!formData.documentName.trim()) newErrors.documentName = 'Document name is required';
    if (!formData.month) newErrors.month = 'Month is required';
    if (!formData.fileType) newErrors.fileType = 'File type is required';
    if (!formData.file) newErrors.file = 'File is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset status message when dialog is opened/closed
  useEffect(() => {
    if (open) {
      setUploadStatus({ type: '', message: '' });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    if (!formData.file) {
      setErrors(prev => ({
        ...prev,
        file: 'File size exceeds 10MB limit'
      }));
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading file...' });

    try {
      // Prepare the file data for upload
      const fileData = {
        system: formData.system,
        documentName: formData.documentName,
        month: formData.month,
        fileType: formData.fileType,
        year: formData.year,
        author: 'Current User' // In a real app, get this from auth context
      };

      // Call the uploadFile API function
      const result = await uploadFile(formData.file, fileData);
      
      // Show success message
      setUploadStatus({ 
        type: 'success', 
        message: 'File uploaded successfully!' 
      });
      
      // Notify parent component of successful upload with the server response
      if (onSubmit) {
        onSubmit({
          ...formData,
          id: result.id || Date.now().toString(), // Use server ID or generate a temporary one
          uploadedAt: new Date().toISOString(),
          status: 'pending',
          ...result // Include any additional data from the server
        });
      }
      
      // Close the dialog after a short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // More specific error messages based on error type
      let errorMessage = 'Failed to upload file. Please try again.';
      
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('413')) {
        errorMessage = 'File is too large. Please choose a smaller file.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadStatus({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setFormData({
      system: '',
      documentName: '',
      month: '',
      fileType: '',
      file: null,
      year: new Date().getFullYear()
    });
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="md"
      PaperProps={{
        sx: {
          position: 'fixed',
          top: { xs: 'auto', sm: '50%' },
          bottom: { xs: 0, sm: 'auto' },
          left: '50%',
          transform: { xs: 'translate(-50%, 0)', sm: 'translate(-50%, -50%)' },
          width: { xs: '100%', sm: '90%', md: '80%', lg: '70%' },
          maxWidth: '800px',
          maxHeight: { xs: '90vh', sm: '90vh' },
          margin: 0,
          borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Inter, sans-serif !important',
          '@media (max-width: 600px)': {
            '& .MuiDialogContent-root': {
              padding: '16px 8px'
            },
            '& .MuiTableCell-root': {
              padding: '8px 4px',
              '&:first-of-type': {
                paddingLeft: '8px'
              },
              '&:last-child': {
                paddingRight: '8px'
              }
            }
          }
        }
      }}
      BackdropProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%' }}>
          <Typography variant="h6" sx={{ 
            fontSize: { xs: '1rem', sm: '1.25rem' },
            textAlign: 'center',
            width: '100%',
            fontFamily: 'Inter, sans-serif'
          }}>
            Upload Document
          </Typography>
          <IconButton
            edge="end"
            onClick={handleClose}
            aria-label="close"
            sx={{
              backgroundColor: 'red',
              color: 'white',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
              margin: '4px',
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              '& svg': {
                fontSize: { xs: '1rem', sm: '1.25rem' }
              },
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <FiX />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent dividers sx={{ 
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
        fontFamily: 'Inter, sans-serif'
      }}>
        <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none', fontFamily: 'Inter, sans-serif' }}>
          <Table sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' } }}>
            <TableBody>
              <TableRow>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{
                    minWidth: { xs: '140px', sm: '170px' },
                    width: { xs: '140px', sm: '170px' },
                    bgcolor: 'black',
                    color: 'white',
                    fontWeight: '500',
                    padding: { xs: '12px 8px', sm: '14px 12px' },
                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    System <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                  </Box>
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="system"
                    value={formData.system}
                    onChange={handleChange}
                    error={!!errors.system}
                    helperText={errors.system}
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      sx: { fontFamily: 'Inter, sans-serif' }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: 'Inter, sans-serif' }
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: { fontFamily: 'Inter, sans-serif !important' }
                        }
                      }
                    }}
                  >
                    {systems.map((system) => (
                      <MenuItem key={system} value={system}>
                        {system}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{
                    minWidth: { xs: '140px', sm: '170px' },
                    width: { xs: '140px', sm: '170px' },
                    bgcolor: 'black',
                    color: 'white',
                    fontWeight: '500',
                    padding: { xs: '12px 8px', sm: '14px 12px' },
                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    Document Name <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '100%' }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="documentName"
                    value={formData.documentName}
                    onChange={handleChange}
                    error={!!errors.documentName}
                    helperText={errors.documentName}
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      sx: { fontFamily: 'Inter, sans-serif' }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: 'Inter, sans-serif' }
                    }}
                    SelectProps={{
                      native: false,
                      MenuProps: {
                        PaperProps: {
                          sx: { fontFamily: 'Inter, sans-serif !important' }
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Select document name</em>
                    </MenuItem>
                    {documentNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{
                    minWidth: { xs: '140px', sm: '170px' },
                    width: { xs: '140px', sm: '170px' },
                    bgcolor: 'black',
                    color: 'white',
                    fontWeight: '500',
                    padding: { xs: '12px 8px', sm: '14px 12px' },
                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    Month <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '100%' }}>
                  <Box display="flex" gap={1}>
                    <TextField
                      select
                      size="small"
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      error={!!errors.month}
                      helperText={errors.month}
                      variant="outlined"
                      margin="dense"
                      sx={{ 
                        minWidth: 120,
                        '& .MuiSelect-select': { fontFamily: 'Inter, sans-serif' }
                      }}
                      InputProps={{
                        sx: { fontFamily: 'Inter, sans-serif' }
                      }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: { fontFamily: 'Inter, sans-serif !important' }
                          }
                        }
                      }}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      size="small"
                      name="year"
                      value={formData.year || currentYear}
                      onChange={handleChange}
                      variant="outlined"
                      margin="dense"
                      sx={{ 
                        minWidth: 100,
                        '& .MuiSelect-select': { fontFamily: 'Inter, sans-serif' }
                      }}
                      InputProps={{
                        sx: { fontFamily: 'Inter, sans-serif' }
                      }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: { fontFamily: 'Inter, sans-serif !important' }
                          }
                        }
                      }}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{
                    minWidth: { xs: '140px', sm: '170px' },
                    width: { xs: '140px', sm: '170px' },
                    bgcolor: 'black',
                    color: 'white',
                    fontWeight: '500',
                    padding: { xs: '12px 8px', sm: '14px 12px' },
                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    File Type <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '100%' }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="fileType"
                    value={formData.fileType}
                    onChange={handleChange}
                    error={!!errors.fileType}
                    helperText={errors.fileType}
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      sx: { fontFamily: 'Inter, sans-serif' }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: 'Inter, sans-serif' }
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: { fontFamily: 'Inter, sans-serif !important' }
                        }
                      }
                    }}
                  >
                    {fileTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{
                    minWidth: { xs: '140px', sm: '170px' },
                    width: { xs: '140px', sm: '170px' },
                    bgcolor: 'black',
                    color: 'white',
                    fontWeight: '500',
                    padding: { xs: '12px 8px', sm: '14px 12px' },
                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  File
                </TableCell>
                <TableCell>
                  <Box sx={{ mt: 1, width: '100%' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<FiUpload />}
                      disabled={isUploading}
                      fullWidth
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        textTransform: 'none',
                        width: '100%',
                        mb: 1,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {formData.file ? (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formData.file.name}
                        </span>
                      ) : 'Choose File'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Clear any previous file errors
                            setErrors(prev => ({
                              ...prev,
                              file: ''
                            }));
                            
                            // Validate file size (e.g., 10MB limit)
                            const maxSize = 10 * 1024 * 1024; // 10MB
                            if (file.size > maxSize) {
                              setErrors(prev => ({
                                ...prev,
                                file: 'File size exceeds 10MB limit'
                              }));
                              return;
                            }
                            
                            // Update form data with the new file
                            setFormData(prev => ({
                              ...prev,
                              file: file,
                              // Auto-detect file type from extension if not set
                              fileType: !prev.fileType ? 
                                file.name.split('.').pop().toUpperCase() : 
                                prev.fileType
                            }));
                          }
                        }}
                        disabled={isUploading}
                        onClick={(e) => {
                          // Clear the input value to allow re-uploading the same file
                          e.target.value = '';
                        }}
                      />
                    </Button>
                    {errors.file && (
                      <Typography color="error" variant="caption" display="block">
                        {errors.file}
                      </Typography>
                    )}
                    {formData.file && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Size: {(formData.file.size / 1024).toFixed(2)} KB
                      </Typography>
                    )}
                    {uploadStatus.message && (
                      <Box 
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: uploadStatus.type === 'error' 
                            ? 'error.light' 
                            : uploadStatus.type === 'success'
                            ? 'success.light'
                            : 'info.light',
                          color: uploadStatus.type === 'error' 
                            ? 'error.contrastText' 
                            : uploadStatus.type === 'success'
                            ? 'success.contrastText'
                            : 'info.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        {uploadStatus.type === 'success' && <FaCheckCircle />}
                        {uploadStatus.type === 'error' && <FiX size={18} />}
                        {uploadStatus.type === 'info' && <AiOutlineLoading3Quarters className="spin" />}
                        <Typography variant="body2" component="span">
                          {uploadStatus.message}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <DialogActions sx={{ 
          p: 2, 
          position: 'sticky', 
          bottom: 0, 
          bgcolor: 'background.paper',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          '& button': {
            minWidth: { xs: '80px', sm: '100px' },
            padding: { xs: '6px 8px', sm: '8px 16px' }
          }
        }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            color="primary"
            size="small"
            fullWidth={false}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            size="small"
            fullWidth={false}
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const bottomSheetRef = useRef(null);

  // Close menu bottom sheet if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (bottomSheetRef.current && !bottomSheetRef.current.contains(event.target)) {
        setShowMenuSheet(false);
      }
    }
    if (showMenuSheet) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenuSheet]);
  const [selectedOption, setSelectedOption] = useState('');

    const [noChartData, setNoChartData] = useState(false);
const [lastUploadDate, setLastUploadDate] = useState('');

useEffect(() => {
  async function fetchLastUpload() {
    try {
      const result = await handleLastUpload('VPN', selectedOption);
      // Format date as "DD MMM, YYYY"
      if (!result) {
        setLastUploadDate('N/A');
      } else {
        const dateObj = new Date(result);
        const formatted = isNaN(dateObj) ? result : dateObj.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setLastUploadDate(formatted);
      }
    } catch {
      setLastUploadDate('N/A');
    }
  }
  if (selectedOption) {
    fetchLastUpload();
  } else {
    setLastUploadDate('');
  }
}, [selectedOption]);
    const chartRef = useRef(null);
    useEffect(() => {
      async function fetchChartData() {
        try {
          const system = 'VPN';
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const data = await handleFileNameCharts(system, selectedOption);

          // Fetch all records for last upload date
          const fileRecords = await fetch('http://127.0.0.1:8000/upload/viewuploads');
          const response = await fileRecords.json();
          const filtered = response.filter(item => item.system === system && (!selectedOption || item.file_name === selectedOption));

          // Find latest created_date among filtered records
          let latestDate = null;
          for (let i = 0; i < filtered.length; i++) {
            const item = filtered[i];
            let parts = item.created_date.split('/');
            let dateObj;
            if (parts.length === 3) {
              dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
            } else {
              dateObj = new Date(item.created_date);
            }
            if (!latestDate || dateObj > latestDate) {
              latestDate = dateObj;
            }
          }
          if (latestDate) {
            setLastUploadDate(latestDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
          } else {
            setLastUploadDate('N/A');
          }

          // Always destroy previous chart instance before updating or hiding
          if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
          }

          if (data.every(val => val === 0)) {
            setNoChartData(true);
          } else {
            setNoChartData(false);
            setTimeout(() => {
              const canvas = document.getElementById('chart-backups');
              if (canvas) {
                const backgroundColors = [
                  'rgba(255, 165, 0, 0.2)', 'rgba(255, 165, 0, 0.3)', 'rgba(255, 165, 0, 0.4)', 'rgba(255, 165, 0, 0.5)',
                  'rgba(255, 165, 0, 0.6)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 165, 0, 0.8)', 'rgba(255, 165, 0, 0.9)',
                  'rgba(255, 165, 0, 1.0)', 'rgba(255, 165, 0, 0.8)', 'rgba(255, 165, 0, 0.6)', 'rgba(255, 165, 0, 0.4)'
                ];
                const borderColors = ['rgba(255, 165, 0, 1)'];
                loadChart('chart-backups', months, data, backgroundColors, borderColors, 'doughnut');
              }
            }, 0);
          }
        } catch (err) {
          console.error('[Chart] Failed to load chart data:', err);
          setNoChartData(true);
          if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
          }
          setLastUploadDate('N/A');
        }
      }
      fetchChartData();
    }, [selectedOption]);

  function loadChart(chartId, labels, data, backgroundColor, borderColor, type) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return; // Defensive: canvas might not exist
    // Always destroy previous chart instance before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    const ctx = canvas.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderColor: type === 'doughnut' ? 'rgba(255, 255, 255, 0.3)' : borderColor,
          borderWidth: type === 'doughnut' ? 3 : 1,
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
            display: false,
            position: type === 'doughnut' ? 'left' : 'top',
            align: 'center',
            labels: {
              boxWidth: 15,
              padding: 15
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

  const data = generateDummyData();

  const options = [
    'User Modification Reviews',
    'Super User Access Reviews',
    'Access Forms',
    'Developers Access Reviews',
    'Braintree Access Reviews',
    'Role Based Matrices',
    'User Termination Reviews',
    'User Creation Reviews',
    'OS Layer Reviews',
    'User Recertifications',
    'User Access Reviews',
  ];

  const handleUploadSubmit = (formData) => {
    // Handle the form submission here
    console.log('Form submitted:', formData);
    // You can add your API call here to submit the form data
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null); // For file sidebar metadata


  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <div className=" hidden md:block w-70 bg-gray-100 border border-gray-200 ">

        <div className="flex flex-col h-full">

          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200 w-full h-1/6 bg-gray-200 items-center justify-center">

            <div className="flex flex-col items-center justify-between space-y-2 w-full h-full">

              <Image
                className="dark:invert"
                src="/images/reallogo.png"
                alt="logo"
                width={60}
                height={60}
                priority
              />

              <div className="w-full flex flex-col items-center justify-center">
                <h2 className={`${lexend.className} text-2xl font-bold text-gray-800`}>Adrian Matter</h2>
                <p className={`${inter.className}  text-sm text-gray-500`}>Requester</p>
              </div>

            </div>

          </div>

          <div className="p-2 border-b border-gray-200 w-full flex flex-row items-center justify-around h-15 rounded-xl bg-white items-center">
            
            <HiViewColumns className="text-4xl text-black bg-gray-100 rounded-lg p-2" />

            <div className="flex flex-col items-center justify-center h-1/6">
                <h2 className={`${inter.className} text-sm font-bold text-black`}>
                Currently Viewing
                </h2>
                <p className={`${inter.className} text-xs text-gray-600`}>
                {selectedOption || 'No option selected'}
                </p>
            </div>
            <MdOutlineNavigateNext className="text-2xl text-black" />
          </div>

          {/* Options Section */}
          <div className="flex flex-col h-3/4 w-full p-2 ">

            <div className="space-y-1 w-full h-full p-2">

            <div className="flex flex-row items-center justify-between w-full h-5 mb-5 mt-5">
                <h2 className={`${inter.className} text-sm font-bold text-black tracking-wide`}>
                Available Views
                </h2>
                <p className={`${inter.className} text-xs text-gray-600 border border-gray-200 rounded-lg p-2`}>
                {options.length} options
                </p>
            </div>

            <hr className="border-t border-gray-300 my-2" />

              {options.map((option, index) => (
                <button key={index} onClick={() => setSelectedOption(option)} className="group flex text-black flex-row w-full h-12 justify-between items-center p-3 hover:bg-gray-200 rounded-lg hover:scale-110 transition-all duration-300 hover:shadow-lg hover:text-blue-600 cursor-pointer">
                  <div className="flex flex-row items-center text-center space-x-3 w-full h-full">

                      <div className="flex flex-row items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                        {selectedOption === option ? (
                          <FaCheckCircle className="text-blue-500" />
                        ) : (
                          <FaCircle className="text-gray-100" />
                        )}
                      </div>
                    <span className={`${lexend.className} text-xs whitespace-nowrap overflow-hidden max-w-[90px] group-hover:max-w-none group-hover:overflow-visible group-hover:whitespace-normal`}>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen w-full flex-col">
        {/* Your main content here */}

        {/* Header */}
        <header className="w-full h-20 flex flex-row p-4 justify-between items-center border border-gray-300">
          <div className="flex flex-row items-center p-2 border border-gray-300 rounded">
            <h1 className={`${inter.className} text-xl`}>Access Control Portal</h1>
          </div>
          {/* Hamburger menu visible only on small screens */}
          <button className="block md:hidden p-2 rounded focus:outline-none" onClick={() => setShowMenuSheet(true)} aria-label="Open menu">
            <FaBars size={24} />
          </button>

          {/* Bottom Sheet for mobile (menu) */}
          {showMenuSheet && (
            <div className="fixed inset-0 z-50 flex items-end md:hidden backdrop-blur-xs bg-opacity-30 transition-all">
              <div ref={bottomSheetRef} className="w-full bg-white rounded-t-2xl shadow-lg p-4 max-h-[80vh] overflow-y-auto animate-slideUp scrollbar-hide">
                {/* User Section */}
                <div className="mb-4">
                  <h2 className={`${inter.className} text-sm font-bold mb-2 text-center text-black tracking-wider`}>User</h2>
                  <div className="flex flex-row space-x-4 w-full justify-center items-center border-b border-gray-200 p-1 bg-gray-100 rounded-full">
                    <button className="flex items-center space-x-2 hover:bg-gray-200 p-2 h-10 justify-center rounded-2xl cursor-pointer bg-white">
                      <IoSettingsOutline />
                      <span className={`${inter.className} text-xs text-black`}>Settings</span>
                    </button>
                    <button className="relative flex items-center hover:bg-gray-200 p-2 h-10 justify-center rounded-2xl cursor-pointer bg-white">
                      <IoMdNotificationsOutline className="text-1xl" />
                      <span className={`${inter.className} text-xs text-black ml-1`}>Notifications</span>
                      <span className={`${inter.className} absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center`}>3</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:bg-gray-200 p-2 h-10 justify-center rounded-2xl cursor-pointer bg-white">
                      <FaRegUser/>
                      <span className={`${inter.className} text-xs text-black`}>User</span>
                    </button>
                  </div>
                </div>
                {/* Nav Section */}
                <div className="mb-4">
                  <h2 className={`${inter.className} text-sm font-bold mb-2 text-center text-black tracking-wider`}>Nav</h2>
                  <div className="flex space-x-8 text-black justify-center items-center flex-row p-1 border-t border-gray-200 bg-gray-100 rounded-full" >
                    <div className="flex items-center bg-black space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                      {/* <FaHome /> */}
                      <span className={`${inter.className} text-xs text-white`}>Home</span>
                    </div>
                    <div className="flex items-center bg-white space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                      {/* <FaCog /> */}
                      <span className={`${inter.className} text-xs text-black`}>Reviews</span>
                    </div>
                  </div>
                </div>
                {/* Views Section */}
                <div>
                  <h2 className={`${inter.className} text-sm font-bold mb-2 text-center text-black tracking-wider`}>Views</h2>
                  <div className="w-full h-full p-2">
                    <div className="flex flex-row items-center justify-between w-full mb-5 rounded-full p-1">
                      <h3 className={`${inter.className} text-sm font-bold text-black tracking-wide ml-2`}>
                        Available Views
                      </h3>
                      <p className={`${inter.className} text-xs text-gray-600 border border-gray-200 rounded-lg p-2 mr-2`}>
                        {options.length} options
                      </p>
                    </div>
                    <hr className="border-t border-gray-300 my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      {options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => { setSelectedOption(option); setShowMenuSheet(false); }}
                          className={`flex flex-row w-full h-16 justify-between items-center p-3 hover:bg-gray-200 rounded-lg cursor-pointer border ${selectedOption === option ? 'border-blue-500' : 'border-gray-200'}`}
                        >
                          <div className="flex flex-row items-center text-center space-x-3 w-full h-full">
                            <div className="flex flex-row items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                              {selectedOption === option ? (
                                <FaCheckCircle className="text-blue-500" />
                              ) : (
                                <FaCircle className="text-gray-100" />
                              )}
                            </div>
                            <span className={`${lexend.className} text-black text-xs truncate overflow-hidden whitespace-nowrap max-w-[90px]`}>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* The rest of the header is hidden on small screens */}
          <div className="hidden md:flex flex-row justify-around w-2/6 md:w-138 items-center">    
            <div className="flex items-center hover:bg-gray-100 p-2 rounded-full cursor-pointer ">
              <input type="text" placeholder="Search" className="border hover:border-white border-gray-200 hover:text-black rounded-full p-2 text-xs truncate" />
            </div>      
            <div className="flex space-x-4 text-black justify-around flex-row rounded-full p-1 bg-gray-100 ">              
              <div className="flex items-center bg-gray-300 space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                {/* <FaHome /> */}
                <span className={`${inter.className} text-xs`}>Overview</span>
              </div>
              <div className="flex items-center bg-white space-x-2 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                {/* <FaCog /> */}
                <span className={`${inter.className} text-xs`}>Home</span>
              </div>
            </div>
            <button className="flex items-center space-x-2 hover:bg-gray-200 p-3 rounded-full cursor-pointer bg-gray-100">
              <IoSettingsOutline  />
              <span className={`${inter.className} text-xs`}>Settings</span>
            </button>
            <button className="relative flex items-center hover:bg-gray-200 p-2 w-12 h-12 justify-center rounded-full cursor-pointer bg-gray-100">
              <IoMdNotificationsOutline className="text-1xl" />
              <span className={`${inter.className} absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center`}>3</span>
            </button>
            <button className="flex items-center space-x-2 hover:bg-gray-200 p-2 w-12 h-12 justify-center rounded-full cursor-pointer bg-gray-100">
              <FaRegUser/>
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row w-full md:h-220 h-[95vh] p-2 space-x-1 overflow-hidden overflow-y-auto md:overflow-y-hidden space-y-2 md:space-y-0">
          {/* Your main content here */}

          <div className="flex flex-row w-full md:w-1/2 h-full p-2 space-x-1 bg-[url('/images/Sectionbg.jpg')] shadow-md bg-cover rounded-xl">
            {/* Your main left content here */}
            <div className="flex flex-col justify-between p-1 rounded-xl h-full md:w-2/3 overflow-y-auto overflow-hidden">
            
              <div className='w-full h-2/5 flex flex-col p-2 bg-white/15 shadow-md rounded-xl justify-around'>
                <h2 className={`${lexend.className} text-sm text-white mb-1 text-center md:w-1/3 p-1 bg-black rounded-lg ml-4`}>Progress Statistics</h2>

                <div className='w-full h-[90%] flex flex-col p-2 rounded-xl items-center justify-around'>

                  <div className='w-full h-[10%] flex flex-row p-1 items-center justify-start mt-3'>
                    <h1 className={`${lexend.className} text-5xl text-black text-center p-1 rounded-lg`}>64%</h1>
                    <p className={`${lexend.className} text-xs text-gray-600 w-[15%] text-center rounded-lg text-left`}>Total Activity</p>
                  </div>

                  <div className='w-full h-[12%] flex flex-row p-1 rounded-xl items-center justify-around space-x-1'>

                    <div className='w-[24%] h-[100%] flex flex-col items-start justify-between'>
                      <div className = 'w-full h-[40%] items-center justify-around bg-blue-400 rounded-full'>             
                      </div>
                      <h1 className={`${inter.className} text-xs text-black w-[100%] text-left`}>24%</h1>
                    </div>

                    <div className='w-[35%] h-[100%] flex flex-col items-start justify-between'>
                      <div className = 'w-full h-[40%] items-center justify-around bg-green-400 rounded-full'>             
                      </div>
                      <h1 className={`${inter.className} text-xs text-black w-[100%] text-left`}>35%</h1>
                    </div>

                    <div className='w-[41%] h-[100%] flex flex-col items-start justify-between'>
                      <div className = 'w-full h-[40%] items-center justify-around bg-orange-400 rounded-full'>             
                      </div>
                      <h1 className={`${inter.className} text-xs text-black w-[100%] text-left`}>41%</h1>
                    </div>
                    
                  </div>

                  <div className='w-[100%] h-[60%] flex flex-row items-center justify-between bg-white/10 rounded-xl'>

                    <div className=' w-[30%] h-[75%] flex flex-col items-center justify-around border-r border-gray-400'>
                      <AiOutlineLoading3Quarters className='md:text-3xl text-white md:p-2 p-1 rounded-full bg-blue-400'/>
                      <h1 className={`${inter.className} text-2xl text-black `}>8</h1>
                      <h1 className={`${lexend.className} text-xs text-gray-600 md:tracking-wide`}>In progress</h1>
                    </div>

                    <div className=' w-[30%] h-[75%] flex flex-col items-center justify-around border-r border-gray-400'>
                      <GrCompliance className='md:text-3xl text-white md:p-2 p-1 rounded-full bg-green-400'/>
                      <h1 className={`${inter.className} text-2xl text-black `}>12</h1>
                      <h1 className={`${lexend.className} text-xs text-gray-600 md:tracking-wide`}>Completed</h1>
                    </div>

                    <div className=' w-[30%] h-[75%] flex flex-col items-center justify-around'>
                      <TbBrandNextcloud className='md:text-3xl text-white md:p-2 p-1 rounded-full bg-orange-400'/>
                      <h1 className={`${inter.className} text-2xl text-black `}>14</h1>
                      <h1 className={`${lexend.className} text-xs text-gray-600 md:tracking-wide`}>Upcoming</h1>
                    </div>

                  </div>
                </div>
              </div>

              <div className='w-full md:h-[25%] h-1/4 flex flex-col p-2 rounded-xl shadow-md backdrop-blur-xs bg-white/15 scrollbar-hide custom-scrollbar'>
                <h2 className={`${lexend.className} text-sm text-black font-medium mb-2 border-b border-gray-400 pb-1`}>Pending Approvals</h2>
                <PendingApprovalsPanel system="VPN" />
              </div>

              <div className = 'w-full h-1/3 flex flex-col p-2 rounded-xl shadow-md bg-white/50'>
                <h2 className={`${lexend.className} text-sm text-white mb-1 md:w-[18%] ml-4 text-center text-bold p-1 bg-black rounded-lg`}>Uploads</h2>
                <div className="h-[90%] w-full overflow-x-auto overflow-y-hidden">
                    {noChartData ? (
                      <div className={`${inter.className} flex flex-col items-center justify-center h-full text-gray-500`}>
                      <svg className="mb-2" width="36" height="36" fill="none" viewBox="0 0 24 24"><path fill="#F59E42" d="M4 17a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v9a1 1 0 0 1-1 1Zm8 0a1 1 0 0 1-1-1V3a1 1 0 1 1 2 0v13a1 1 0 0 1-1 1Zm8 0a1 1 0 0 1-1-1v-5a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1Z"/><path fill="#E5E7EB" d="M3 20a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z"/></svg>
                      <span className="text-lg font-semibold mb-1">No chart data available</span>
                      <span className="text-sm text-gray-400 text-center">There are no uploads or activity to display for this selection.<br/>Try uploading a file or changing your filter options above.</span>
                    </div>
                    ) : (
                      <canvas id="chart-backups" className="h-full w-full p-3 flex flex-row"></canvas>
                    )}
                </div>
              </div>
                           
            </div>

            <div className="flex flex-col justify-between items-center h-full md:w-1/3 w-[35%] overflow-y-auto overflow-hidden rounded-xl p-1">
              <h1 className={`${lexend.className} md:text-xs text-[60%] text-black p-2 rounded-sm w-full text-left`}>Important Dates |</h1> 
              
              <div className="relative w-full h-1/5">
                {/* Background layer */}
                <div className="absolute inset-1 bg-orange-400 rounded-xl shadow-sm opacity-80 z-0 border-gray-200"></div>
                
                {/* Content layer */}
                <div className="relative flex flex-col w-full h-full text-black p-4 rounded-xl shadow-md z-5">
                  <div className="flex items-center justify-center md:w-12 md:h-12 w-10 h-10 bg-white/10 md:rounded-lg p-1 rounded-sm md:mb-4 mb-2">
                    <BsCalendar2Date className="text-white md:text-xl text-xs" />
                  </div>
                  <h3 className={`${lexend.className} md:text-sm text-[60%] font-medium mb-2 text-black/50`}>Last Update</h3>
                  <p className={`${inter.className} md:text-2xl text-xs font-semibold text-white`}>
                    {lastUploadDate}
                  </p>

                  <div className=" w-full flex flex-row items-center justify-end">
                    <MdNavigateNext className="text-white text-xl bg-black p-1 rounded-sm justify-start" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full h-1/5  text-white p-4 rounded-xl shadow-md backdrop-blur-xs bg-white/25">
                <div className="flex items-center justify-center md:w-12 md:h-12 w-10 h-10 bg-black/10 rounded-sm md:rounded-lg p-1 rounded-sm md:mb-4 mb-2 ">
                  <LuCalendarClock className="text-black md:text-xl text-xs" />
                </div>
                <h3 className={`${lexend.className} md:text-sm text-[60%] font-medium mb-2 text-white`}>Next Expected</h3>
                <p className={`${inter.className} md:text-2xl text-xs font-semibold text-black `}>10 Aug, 2025</p>

                <div className=" w-full flex flex-row items-center justify-end">
                  <MdNavigateNext className="text-white text-xl bg-black p-1 rounded-sm justify-start" />
                </div>
              </div>

              <div className = 'bg-white/40 h-3/6 flex flex-col justify-around items-center rounded-xl w-full p-1'>
                <h1 className={`${lexend.className} md:text-sm text-[60%] text-black p-2 rounded-sm `}>Upload Section |</h1>  

                <div className="flex flex-col h-1/5 flex flex-col items-center  bg-white/55 text-center text-white p-2 rounded-xl w-full">
                  <h3 className={`${lexend.className} md:text-sm text-[60%]  mb-2 text-gray-600`}>Set Reminder</h3>

                  <button className="md:w-2/3 md:h-2/3 text-white md:p-2 p-1 rounded-full bg-black flex flex-row items-center justify-between">
                    <div className="flex items-center justify-center bg-white/15 rounded-full w-6 h-6 md:w-8 md:h-8">
                      <TbAlarmPlus className="text-white text-xs md:text-xl" />
                    </div>
                    <p className={`${inter.className} md:text-sm text-[60%] font-semibold`}>Pick Date</p>
                  </button>
                </div>
                
                <div className="relative flex flex-col h-3/5 w-full bg-[url('/images/bgImage.jpg')] bg-cover justify-center items-center rounded-xl p-4 overflow-visible">  
                  <h3 className={`${lexend.className} text-white text-xs truncate h-[20%] flex top-0 justify-center items-center font-medium text-center bg-black/30 px-4 py-1 rounded-full`}>
                    Document Upload Center
                  </h3>
                  {/* <div className='bg-white/90 text-xs text-gray-800 rounded-full px-4 py-2 flex items-center animate-bounce'>
                      <FaArrowDown className="mr-2" /> Click below to upload
                    </div> */}
                  <div className="w-full mt-4 h-[23%]">
                    <button 
                      className="w-full text-white h-full p-2 rounded-full bg-orange-400 flex items-center justify-center hover:bg-orange-500 transition-colors"
                      onClick={() => setShowUploadDialog(true)}
                    >
                      <FiUpload className="mr-2" />
                      <p className={`${inter.className} md:text-sm text-xs font-semibold`}>Upload Files</p>
                    </button>
                    <DocumentUploadForm 
                      open={showUploadDialog} 
                      onClose={() => setShowUploadDialog(false)}
                      onSubmit={handleUploadSubmit}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className='flex flex-col md:w-1/2 md:h-full h-1/2 p-2 border border-gray-200 bg-cover rounded-xl shadow-md relative'>
            {/* Info FAB for small screens at top-right of this main content div */}
            <button
              className="block sm:hidden absolute top-2 right-2 z-40 bg-black text-white rounded-full p-2 shadow-lg focus:outline-none"
              aria-label="Show Info"
              onClick={() => {
                setShowInfoSheet(true);
                setShowMenuSheet(false);
              }}
            >
              <FiInfo className="h-6 w-6" />
            </button>
            {/* Mobile Info Sheet (bottom sheet) for small screens */}
            {showInfoSheet && (
              <div className="sm:hidden">
                <MobileInfoSheet inter={inter} lexend={lexend} onClose={() => setShowInfoSheet(false)} />
                {/* Overlay to close on background click */}
                <div
                  className="fixed inset-0 z-30 bg-black/30"
                  onClick={() => setShowInfoSheet(false)}
                />
              </div>
            )}
            {/* Your main right content here */}
              <div className={`flex flex-col h-full w-full overflow-y-auto overflow-hidden ${inter.className} custom-scrollbar`}>
                <div className="sticky top-0 z-20 w-full bg-gray-900 text-white px-4 py-2 text-center rounded-t-lg font-semibold text-lg shadow">Available Files</div>
                  {/* Search and Sort Controls */}
                  <div className="sticky top-10 z-10 flex flex-row items-center justify-between w-full mb-3 px-2 gap-2 bg-gray-50 pt-2 pb-2 border-b border-gray-200">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900"
                        value={searchTerm || ''}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      className={`ml-2 p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition flex items-center ${sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-500'}`}
                      title="Sort by newest first"
                      onClick={() => setSortOrder('desc')}
                    >
                      <span className="sr-only">Sort by newest</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v-6m0 0l-3 3m3-3l3 3M4 6h16M4 10h16M4 14h10" /></svg>
                    </button>
                    <button
                      className={`ml-1 p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition flex items-center ${sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-500'}`}
                      title="Sort by oldest first"
                      onClick={() => setSortOrder('asc')}
                    >
                      <span className="sr-only">Sort by oldest</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v6m0 0l3-3m-3 3l-3-3M20 18H4M20 14H4M20 10H10" /></svg>
                    </button>
                  </div>
                {/* Uploads Grid Preview */}
                {(() => {
                  const { useState, useEffect } = require('react');
                  const [uploads, setUploads] = useState([]);
                  const [loading, setLoading] = useState(true);
                  const [error, setError] = useState(null);
                 // 'desc' for newest first, 'asc' for oldest first
                  useEffect(() => {
                    setLoading(true);
                    setError(null);
                    import('./api').then(api => {
                      api.getFilteredUploads('VPN', selectedOption)
                        .then(data => {
                          // Sort by created_date descending
                          const sorted = [...data].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                          setUploads(sorted);
                          setLoading(false);
                        })
                        .catch(e => {
                          setError(e.message);
                          setLoading(false);
                        });
                    });
                  }, [selectedOption]);

                  // Filter and sort uploads
                  const filteredUploads = uploads
                    .filter(file =>
                      !searchTerm || (file.file_name || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .sort((a, b) => {
                      const dateA = new Date(a.created_date);
                      const dateB = new Date(b.created_date);
                      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                    });

                  // Helper: get file URL from Django path
                  function getFileUrl(filePath) {
                    if (!filePath) return '';
                    if (filePath.startsWith('http')) return filePath;
                    if (filePath.startsWith('/')) return `http://127.0.0.1:8000${filePath}`;
                    return `http://127.0.0.1:8000/media/${filePath}`;
                  }
                  // Helper: get file type icon or preview
                  // Import icons at the top if not already
                  // import { FaFilePdf, FaFileWord, FaFileAlt } from 'react-icons/fa';
                  function FileThumb({ file }) {
                    const url = getFileUrl(file.file);
                    const type = (file.file_type || '').toLowerCase();
                    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(type)) {
                      return <img src={url} alt={file.file_name} className="object-cover w-40 h-40 rounded-lg border shadow" />;
                    }
                    if (type === "pdf") {
                      return <span className="w-40 h-40 flex items-center justify-center bg-red-50 border rounded-lg text-red-500"><FaFilePdf size={64} /></span>;
                    }
                    if (["docx", "doc"].includes(type)) {
                      return <span className="w-40 h-40 flex items-center justify-center bg-blue-50 border rounded-lg text-blue-500"><FaFileWord size={64} /></span>;
                    }
                    // Default: generic file icon
                    return <span className="w-40 h-40 flex items-center justify-center bg-gray-100 border rounded-lg text-gray-400"><FaFileAlt size={64} /></span>;
                  }

                  if (loading) return <div className="flex flex-col items-center justify-center h-full w-full"><p>Loading uploads...</p></div>;
                  if (error) return <div className="flex flex-col items-center justify-center h-full w-full"><p className="text-red-500">{error}</p></div>;
                  if (!uploads.length) return (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col items-center max-w-xs">
                        <FaInfoCircle className="text-blue-400 mb-3" size={40} />
                        <p className="text-lg font-semibold text-gray-700 mb-1">No uploads found</p>
                        <p className="text-gray-500 text-sm mb-2 text-center">There are currently no files available for your selection.</p>
                        <p className="text-gray-400 text-xs text-center">Try uploading a file or changing your filter options above.</p>
                      </div>
                    </div>
                  );

                  return (
                    <div className="grid grid-cols-2 gap-8 w-full px-4 py-4">
                      {filteredUploads.map(file => (
                        <div key={file.file_id} className="flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-gray-100 rounded-lg transition"
                          onClick={() => setSelectedFile(file)}
                        >
                          <FileThumb file={file} />
                          <div className="mt-2 text-center text-base font-medium truncate w-40" title={file.file_name}>{file.file_name}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
       
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block w-70 bg-gray-50 border border-gray-200">
        {/* Right sidebar content */}
        <div className="space-y-4 w-full h-full p-2 ">
          {/* File metadata details */}
          {selectedFile ? (
            <>
              <div className="flex flex-row space-x-4">
                <div className="w-1/2  p-1 space-y-1 rounded-xl shadow-md bg-white">
                  <h1 className={`${lexend.className} text-sm text-white w-full text-center text-bold p-1 bg-black rounded-lg`}>Status</h1>
                  <div className="w-full h-3/4 items-center flex flex-col-reverse justify-around ">
                    <h6 className={`${inter.className} text-xs text-blue-600 bg-blue-100 rounded-lg p-1.5`}>{selectedFile.signature_status || 'Unsigned'}</h6>
                    <h6 className='text-black text-xs rotate-90'>...</h6>
                    <h1 className={`${inter.className} bg-green-100 rounded-sm p-1.5 text-green-600 text-sm`}>{selectedFile.approval_status || 'Pending'}</h1>
                  </div>
                </div>

                <div className="w-1/2 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-xl p-2">
                  <h2 className={`${inter.className} text-xs font-semibold mb-2 w-full text-center`}>QR Code</h2>
                  <img
                    src={'/images/QRCode.png'}
                    alt="Document QR Code"
                    className="w-32 h-32 object-contain border border-gray-200 rounded-lg shadow-sm bg-gray-50"
                  />
                </div>
              </div>

 

              <div className="w-full mb-4 mt-2 flex flex-row border-b border-gray-300 pb-2 items-center justify-between">
                <h2 className="text-lg font-semibold ml-2">Metadata</h2>
                <p className="text-lg text-black mr-2">{selectedFile.file_id}</p>
              </div>

              <div className="w-full h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
                <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Created By.</h2>
                <div className=" w-full h-3/4 flex flex-row items-center justify-between">
                  <h2 className={`${inter.className} text-sm font-semibold`}>{selectedFile.author || 'Unknown'}</h2>
                  <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 `}>Requester</h2>
                  <FaRegUser className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
                </div>
              </div>

              <div className="w-full h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
                <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Document Name.</h2>
                <div className=" w-full h-3/4 flex flex-row items-center justify-between">
                  <h2 className={`${inter.className} text-sm font-semibold truncate`}>{selectedFile.file_name || ''}</h2>
                </div>
              </div>

              <div className="w-full h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
                <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Upload Date.</h2>
                <div className=" w-full h-3/4 flex flex-row items-center justify-between">
                  <h2 className={`${inter.className} text-sm font-semibold truncate`}>{selectedFile.created_date ? new Date(selectedFile.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</h2>
                  <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 w-1/3`}></h2>
                  <CgCalendarToday className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
                </div>
              </div>

         

              <div className="w-full h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
                <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Document Type.</h2>
                <div className=" w-full h-3/4 flex flex-row items-center justify-between">
                  <h2 className={`${inter.className} text-sm font-semibold truncate`}>{(selectedFile.file_type || '').toUpperCase()}</h2>
                  <h2 className={`${inter.className} text-xs font-semibold text-orange-600 bg-orange-200 rounded-lg p-1.5 w-1/2`}></h2>
                  <TiDocument className="text-orange-600 text-xl p-1 rounded-full h-6 w-6 bg-orange-100" />
                </div>
              </div>

              <div className="w-full h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
                <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Month</h2>
                <div className=" w-full h-3/4 flex flex-row items-center justify-between">
                  <h2 className={`${inter.className} text-sm font-semibold truncate`}>{selectedFile.month || ''}</h2>
                </div>
              </div>

              <div className="w-full h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
                <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>System.</h2>
                <div className=" w-full h-3/4 flex flex-row items-center justify-between">
                  <h2 className={`${inter.className} text-sm font-semibold truncate`}>{selectedFile.system || ''}</h2>
                  <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 w-1/3`}></h2>
                  <BsAppIndicator className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
                </div>
              </div>

              <div className="w-full h-[3.5%] mb-4 mt-2 flex flex-row border-b border-gray-300 pb-2 items-center justify-between">
                <h2 className="text-lg font-semibold ml-2">Actions</h2>
                <p className="text-lg text-black mr-2">...</p>
              </div>

              <div className="w-full h-[17.5%] shadow-md flex flex-col bg-white border border-gray-300 items-center justify-around rounded-xl p-2">
                <div className="w-full h-[50%] flex flex-row items-center justify-around space-x-1 p-1">
                  <div className="w-[35%] h-[100%] p-1 space-y-1 rounded-xl shadow-md justify-center items-center flex flex-col cursor-pointer">
                    <RiEditCircleLine className="text-black text-xl p-1 rounded-full h-6 w-6 bg-black/10" />
                    <h1 className={`${inter.className} text-xs text-black w-[100%] text-center text-bold p-1  `}>Edit</h1>
                  </div>
                  <div className="w-[35%] h-[100%] p-1 space-y-1 rounded-xl shadow-md justify-center items-center flex flex-col">
                    <GrFormNextLink className="text-black text-xl p-1 rounded-full h-6 w-6 bg-black/10" />
                    <h1 className={`${inter.className} text-xs text-black w-[100%] text-center text-bold p-1  `}>Next Doc</h1>
                  </div>
                </div>
                <button className="w-full h-[33%] text-white p-2 rounded-full bg-black flex flex-row items-center justify-center"
                  onClick={() => {
                    if (selectedFile && selectedFile.file) {
                      window.open(getFileUrl(selectedFile.file), '_blank');
                    }
                  }}
                >
                  <MdDownloading className="text-2xl" />
                  <p className={`${inter.className} text-xl font-semibold ml-2`}>Download</p>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <TiDocument className="text-5xl mb-2" />
              <span className="text-lg font-semibold">Select a file to view its details</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Page;