
'use server'

let fileRecords = await fetch('http://127.0.0.1:8000/upload/viewuploads');
let response = await fileRecords.json();

export async function handleSubsidiaries(system, month){

    let monthValue = 0;
    
    try {
        if (response && Array.isArray(response)) {

            for (let i = 0; i < response.length; i++) {

                const item = response[i];
                    if (item.system === system  && item.month === month) {
                        monthValue++;
                    }
                    else {
                        console.log(`no ${system} in ${month} values`)
                    }
                }
            console.log(monthValue)
            return monthValue;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (e) {
        console.error('Error in handleSubsidiaries:', e);

        throw new Error('Failed to process chart data');
    }

}
