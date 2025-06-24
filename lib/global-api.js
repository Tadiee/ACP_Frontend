"use server"

export async function handleCharts(system) {
    const monthsValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    try {
        const fileRecords = await fetch('http://127.0.0.1:8000/upload/viewuploads');
        const response = await fileRecords.json();

        if (response && Array.isArray(response)) {
            for (let j = 0; j < months.length; j++) {
                const currentMonth = months[j];

                for (let i = 0; i < response.length; i++) {
                    const item = response[i];
                    if (system === item.system && item.month === currentMonth) {
                        monthsValues[j]++;
                    }
                }
            }
            return monthsValues;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (e) {
        console.error('Error in handleCharts:', e);
        throw new Error('Failed to process chart data');
    }
}

// Accept a second argument: fileName (the selected option)
export async function handleFileNameCharts(system, fileName) {
    const monthsValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    try {
        const fileRecords = await fetch('http://127.0.0.1:8000/upload/viewuploads');
        const response = await fileRecords.json();

        if (response && Array.isArray(response)) {
            for (let j = 0; j < months.length; j++) {
                const currentMonth = months[j];

                for (let i = 0; i < response.length; i++) {
                    const item = response[i];
                    if (
                        system === item.system &&
                        item.month === currentMonth &&
                        (!fileName || item.file_name === fileName)
                    ) {
                        monthsValues[j]++;
                    }
                }
            }
            return monthsValues;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (e) {
        console.error('Error in handleCharts:', e);
        throw new Error('Failed to process chart data');
    }
}