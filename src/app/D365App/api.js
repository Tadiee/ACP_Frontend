const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Uploads a file to the server
 * @param {File} file - The file to upload
 * @param {Object} fileData - Additional file metadata
 * @param {string} fileData.system - The system name
 * @param {string} fileData.documentName - Name of the document
 * @param {string} fileData.month - Selected month
 * @param {string} fileData.fileType - File type/extension
 * @param {string} fileData.author - Author of the document
 * @returns {Promise<Object>} - Response from the server
 */
export const uploadFile = async (file, { system, documentName, month, author = 'System', fileType }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', documentName);
    formData.append('system', system);
    formData.append('author', author);
    formData.append('signature_status', 'Not signed');
    formData.append('approval_status', 'Pending');
    formData.append('qrcode', '');
    formData.append('month', month);
    formData.append('file_type', fileType);
      
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const res = await fetch(`${baseUrl}/upload/upload`, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      throw new Error(err.message || 'Failed to upload file');
    }
    return res.json();
  };
/**
 * Fetches all uploaded files
 * @returns {Promise<Array>} - List of uploaded files
 */
// export const getUploadedFiles = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/files`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       credentials: 'include',
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch files');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching files:', error);
//     throw error;
//   }
// };

/**
 * Fetch a single file by file_id (f_id)
 * @param {number} f_id - File ID to fetch
 * @returns {Promise<Object>} - File data or error message
 */
// export const getFileById = async (f_id) => {
//   try {
//     const response = await fetch(`http://127.0.0.1:8000/upload/viewoneupload?f_id=${encodeURIComponent(f_id)}`, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//       },
//       credentials: 'include',
//     });
//     if (!response.ok) {
//       const err = await response.json().catch(() => ({}));
//       throw new Error(err.message || 'Failed to fetch file');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching file by id:', error);
//     throw error;
//   }
// };

/**
 * Fetch uploads filtered by system and file_name (selectedOption)
 * @param {string} system - System to filter by
 * @param {string} selectedOption - File name to filter by (optional)
 * @returns {Promise<Array>} - Filtered uploads
 */
export const getFilteredUploads = async (system, selectedOption) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/upload/viewuploads', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch uploads');
    }
    const data = await response.json();
    // Normalize for case-insensitive match
    function normalize(str) {
      return (str || '').toLowerCase().trim();
    }
    return data.filter(item =>
      normalize(item.system) === normalize(system) &&
      (!selectedOption || normalize(item.file_name) === normalize(selectedOption))
    );
  } catch (error) {
    console.error('Error fetching filtered uploads:', error);
    throw error;
  }
};

/**
 * Deletes an uploaded file
 * @param {string} fileId - ID of the file to delete
 * @returns {Promise<Object>} - Response from the server
 */
export const deleteFile = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};



