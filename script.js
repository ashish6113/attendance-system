const cameraFeed = document.getElementById('camera-feed');
const photoCanvas = document.getElementById('photo-canvas');
const startCameraBtn = document.getElementById('start-camera-btn');
const takePhotoBtn = document.getElementById('take-photo-btn');
const addToServerBtn = document.getElementById('add-to-server-btn');
const startAttendanceBtn = document.getElementById('start-attendance-btn');
const stopAttendanceBtn = document.getElementById('stop-attendance-btn');
const downloadAttendanceBtn = document.getElementById('download-attendance-btn');
const statusMessage = document.getElementById('status-message');

let videoStream = null;
let userName = '';
let attendanceData = []; // Array to store attendance records

// Function to start the camera
async function startCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraFeed.srcObject = videoStream;
        
        // Wait for the video to load before enabling photo button
        cameraFeed.onloadedmetadata = () => {
            takePhotoBtn.disabled = false;
            startAttendanceBtn.disabled = false;
        };
        
        startCameraBtn.disabled = true;
        statusMessage.textContent = 'Status: Camera is on. You can now take a photo.';

    } catch (err) {
        console.error("Error accessing camera: ", err);
        statusMessage.textContent = 'Status: Error accessing camera.';
    }
}

// Function to stop the camera
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        cameraFeed.srcObject = null;
        
        // Disable buttons when camera is off
        takePhotoBtn.disabled = true;
        addToServerBtn.disabled = true;
        startAttendanceBtn.disabled = true;
        stopAttendanceBtn.disabled = true;
        downloadAttendanceBtn.disabled = false;
        startCameraBtn.disabled = false;
        statusMessage.textContent = 'Status: Camera is off.';
    }
}

// Function to take a photo from the video feed
function takePhoto() {
    if (!videoStream) {
        statusMessage.textContent = 'Status: Camera is not running.';
        return;
    }

    // Prompt for the user's name before taking the photo
    const personName = prompt("Please enter the name of the person:");
    if (!personName || personName.trim() === '') {
        statusMessage.textContent = 'Status: Name is required to take a photo.';
        return;
    }
    userName = personName.trim();

    const context = photoCanvas.getContext('2d');
    photoCanvas.width = cameraFeed.videoWidth;
    photoCanvas.height = cameraFeed.videoHeight;
    context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
    
    statusMessage.textContent = `Status: Photo of ${userName} captured. Ready to upload.`;
    addToServerBtn.disabled = false;
}

// Function to add a photo to the server (placeholder)
function addToServer() {
    if (!userName) {
        statusMessage.textContent = 'Status: No photo to add. Please take a photo first.';
        return;
    }

    // Get the photo data from the canvas
    const imageData = photoCanvas.toDataURL('image/jpeg', 0.9);
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = imageData;
    downloadLink.download = `${userName.toLowerCase().replace(/\s/g, '_')}-${Date.now()}.jpeg`;
    
    // Simulate a click to download the file
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Add a record to the attendance data
    const timestamp = new Date().toLocaleString();
    attendanceData.push({
        name: userName,
        photoFileName: downloadLink.download,
        timestamp: timestamp
    });

    console.log(`Photo for ${userName} saved.`);
    statusMessage.textContent = `Status: Photo for ${userName} saved to your device.`;

    // Reset the username and disable the button for the next photo
    userName = '';
    addToServerBtn.disabled = true;
}

// Function to start attendance
function startAttendance() {
    statusMessage.textContent = 'Status: Attendance mode started. Matching faces...';
    startAttendanceBtn.disabled = true;
    stopAttendanceBtn.disabled = false;
    downloadAttendanceBtn.disabled = true;
    // You would add your real-time face detection loop here
}

// Function to download the attendance data as a CSV
function downloadAttendance() {
    if (attendanceData.length === 0) {
        alert("No attendance data to download.");
        return;
    }

    const headers = ["Name", "Photo File Name", "Timestamp"];
    const csvRows = [
        headers.join(','),
        ...attendanceData.map(row => `${row.name},${row.photoFileName},${row.timestamp}`)
    ];
    const csvString = csvRows.join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `attendance-${Date.now()}.csv`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    statusMessage.textContent = 'Status: Attendance data downloaded.';
}

// Event listeners for buttons
startCameraBtn.addEventListener('click', startCamera);
takePhotoBtn.addEventListener('click', takePhoto);
addToServerBtn.addEventListener('click', addToServer);
startAttendanceBtn.addEventListener('click', startAttendance);
stopAttendanceBtn.addEventListener('click', stopCamera);
downloadAttendanceBtn.addEventListener('click', downloadAttendance);