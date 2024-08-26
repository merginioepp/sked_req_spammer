import RequestManager from './requestManager.js';
import req_arr from './requests.js';
import courts from './courts.js';

req_arr.forEach(req => {
    try {
        const bodyMatch = req.match(/"body":\s*"({.*?})"/);
        // Parse the body to extract the booking information

        const bodyString = bodyMatch[1].replace(/\\\"/g, '"');
        const bodyObj = JSON.parse(bodyString);

        // Destructure the properties from the booking object
        const { booking } = bodyObj;

        // Destructure the properties directly
        const { start, end, spaces } = booking;
        const timeslotText = formatDateForFilename(start, end);

        const courtNames = spaces.map(id => {
            const court = courts.find(v => v.id === id);
            return court ? court.name : "NO_NAME"; // Return NO_NAME if no match is found
        });

        // Create and start a new RequestManager instance for each request
        const requestManager = new RequestManager(req, courtNames.join(', '), timeslotText);
        requestManager.start();  

    } catch (error) {
        console.error('Error parsing JSON body:', error);
    }
});


function formatDateForFilename(startDate, endDate) {
    const _startDate = new Date(startDate);
    const _endDate = new Date(endDate);

    // Extract components
    const year = _startDate.getFullYear();
    const month = String(_startDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(_startDate.getDate()).padStart(2, '0');
    
    // Construct the filename part
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${getCourtTime(_startDate)}_TO_${getCourtTime(_endDate)}`;
  
    return `${formattedDate}_${formattedTime}`;    
}

function getCourtTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12 || 12; // Convert to 12-hour format, 0 becomes 12

    return `${hours}-${minutes}${ampm}`;
}
