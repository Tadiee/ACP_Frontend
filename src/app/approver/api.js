'use server'

let fileRecords = await fetch('http://127.0.0.1:8000/upload/viewuploads');
let response = await fileRecords.json();

export async function handleLastUpload(system) {
    let lastUpload = '01/01/2025';
    let tempDate = null;
    
    try {
        for (let i = 0; i < response.length; i++){
            const item = response[i];

            if (system === item.system){
                tempDate = item.created_date

                if (tempDate > lastUpload){
                    lastUpload = tempDate
                }
            }
        }
        
        return lastUpload;
    } catch (e) {
        console.error('Error in handleLastUpload:', e);
        throw new Error('Failed to process last upload');
    }
}


export async function handleRecentUploads () {
    let recentUploads = []

    try {
        if (response){
            for (let i = 0; i < response.length; i++){
                const item = response[i];
                recentUploads.push(item);
            }

            return recentUploads.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        } else {
            return 'Error in getting from server'
        }

    } catch(e){
        console.error('Error in handleLastUpload:', e);
        throw new Error('Failed to process last upload');

    }
}

export async function handleNumInsights(system){

    let totalUploads = 0
    let totalSigned = 0
    let totalMissing = 0
    let tempInfo = []

    try {
         for (let i = 0; i < response.length; i++){
            const item = response[i];

            if (system === item.system){
                tempInfo.push(item)
            }
         }

         totalUploads = tempInfo.length

         for (let i = 0; i < tempInfo.length; i++){
            const item = tempInfo[i];

            if (item.signature_status === 'Signed'){
                totalSigned++
            }
         }

         // missing to be calculated later

         return {
            totalUploads,
            totalSigned,
            totalMissing
         }
         
        
    }
    catch(e){
        console.error('Error in handleNumInsights:', e);
        throw new Error('Failed to process num insights');
    }
    
}



export async function handleComments(file_id) {
    if (!file_id) {
        console.warn('No file_id provided to fetch comments');
        return [];
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/comment/viewcomment?file_id=${file_id}`);
        const responseData = await response.json();
        
        if (!response.ok) {
            if (response.status === 404) {
                return [];
            }
            console.log(responseData.detail || 'Failed to fetch comments');
        }
        
        return responseData ? [responseData] : [];
        
    } catch (error) {
        console.error('Error in handleComments:', error);
    }
}

export async function updateDocumentStatus(file_id, documentData, status) {
    try {
        if (!documentData) {
            return { success: false, error: 'Document data is required' };
        }

        const updateData = {
            file_name: documentData.file_name || '',
            system: documentData.system || '',
            author: documentData.author || '',
            qrcode: documentData.qrcode || '',
            month: documentData.month || '',
            signature_status: documentData.signature_status || '',
            approval_status: status // 'Approved' or 'Rejected'
        };

        const response = await fetch(`http://127.0.0.1:8000/upload/editfile?f_id=${file_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Failed to approve document' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error approving document:', error);
        return { success: false, error: error.message || 'Network error occurred' };
    }
}

export async function addComment(file_id, commentText, isApprover = true, approverName = 'approver_user', requesterName = 'requester_user') {
    if (!file_id || !commentText.trim()) {
        console.warn('Missing required fields for comment');
        return { success: false, error: 'Missing required fields' };
    }

    try {
        // Initialize with empty arrays for both comment types
        const commentData = {
            file_id: file_id,
            comment: {
                approver_comments: [],  
                requester_comments: []
            },
            approver: isApprover ? approverName : '',
            requester: !isApprover ? requesterName : ''
        };

        // Add the new comment to the appropriate array
        const newComment = {
            text: commentText,
            timestamp: new Date().toISOString()
        };

        if (isApprover) {
            commentData.comment.approver_comments.push(newComment);
        } else {
            commentData.comment.requester_comments.push(newComment);
        }

        const response = await fetch(`http://127.0.0.1:8000/comment/addcomment?comment=${commentData}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to add comment');
        }

        return { success: true };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: error.message };
    }
}

