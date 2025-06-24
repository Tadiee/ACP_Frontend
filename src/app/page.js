'use client'
import React , {useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { lexend, inter } from '../../public/fonts';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
const images = [
    "/Images/image1.jpg",
    "/Images/image2.jpg",
    // "/Images/image3.jpg",
    "/Images/image4.jpg",
    "/Images/image5.jpg",
    "/Images/image6.jpg",
    "/Images/image7.jpg",
];

// Fade state for preview image
let fadeTimeout = null;


const SignInComponent = ({}) => {

    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

  //     // Handle changes in the form fields
  const handleRoleChange = (event) => setRole(event.target.value);
  const handleUsernameChange = (event) => setUsername(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

    const handleChange = (event) => {
        setRole(event.target.value);
    };

    const route = useRouter()
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error'

    async function handleSubmit(event) {
        event.preventDefault();
        
        const LOGIN_URL  = 'api/login'
        try {
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role })
            }); 

            if (response.ok && role == 'Approver' ) {
                setSnackbarMessage('Login successful! Redirecting to your home...');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setTimeout(() => route.replace('/approver'), 1500);
            } 
            else if(response.ok && role === "Requestor"){
                setSnackbarMessage('Login successful! Redirecting to your home...');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setTimeout(() => route.replace('/requestor'), 1500);
            }
            else if(response.ok) {
                setSnackbarMessage('Login successful! Redirecting to your home...');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setTimeout(() => route.replace('/'), 1500);
            } else {
                setSnackbarMessage('Login failed: Invalid credentials or role.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } catch (err) {
            setSnackbarMessage('Network or server error. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }

    const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') return;
      setSnackbarOpen(false);
    }

        //Corousel
        const [currentImageIndex, setCurrentImageIndex] = useState(0);

        const [fadeIn, setFadeIn] = useState(true);
        useEffect(() => {
            const interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 10000); // Change image every 10 seconds

            return () => clearInterval(interval);
        }, []);

        // Fade effect for preview image
        useEffect(() => {
            setFadeIn(false);
            fadeTimeout && clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => setFadeIn(true), 100);
            return () => fadeTimeout && clearTimeout(fadeTimeout);
        }, [currentImageIndex]);

  return (

        <div className ="flex flex-row  w-screen h-screen space-x-3 justify-between items-center" > 

            {/* Left Side - Form */}
            <div className="w-full h-full md:w-1/2 flex flex-col justify-center items-center bg-white p-5 rounded-lg relative">

              <h1 className={`${inter.className} text-6xl font-bold mt-12`}>Hi there!</h1>
              <p className={`${lexend.className} text-xs  mb-8`}>Welcome to Access Control Portal. User Login</p>
            
              <form className="flex flex-col w-full h-[50%] justify-center items-center self-center p-5 " onSubmit={handleSubmit}>

                  {/* Role */}
                  <div className="flex flex-row mb-6 space-x-3 justify-between items-center w-[50%] border border-gray-50 p-2 rounded-lg ">
                      <InputLabel id="demo-simple-select-label" className={`${inter.className} text-xs text-black tracking-wider`}>Role</InputLabel>

                      <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={role}
                      label="Role"
                      onChange={handleRoleChange}
                      required
                      sx={{ justifyContent: 'center'}}
                      name='role'
                      className={`${inter.className} text-xs`}
                      >

                      <MenuItem value={"Approver"} className={`${inter.className} text-xs`}>Head of Department</MenuItem>
                      <MenuItem value={"Requestor"} className={`${inter.className} text-xs`}>Access Control Officer</MenuItem>
                      </Select>                
                  </div> 

                  {/* Username */}
                  <div className="mb-6 w-[50%] p-2 rounded-lg ">
                      <TextField  label="Username" name='username' variant="outlined" sx={{width: '100%'}} required onChange={handleUsernameChange} />
                  </div>

                  {/* Password */}
                  <div className="mb-1 w-[50%] p-2 rounded-lg">
                      <TextField  label="Password" name='password' variant="outlined" sx={{width: '100%'}} required  type='password' className='text-xs' onChange={handlePasswordChange} />
                  </div>

                  <a href='#' className={`${lexend.className} text-xs text-blue-500 ml-1/5 mb-6`}>Forgot Password?</a>

                  {/* Submit Button: Show only if all fields are filled */}
                  {role && username && password && (
                    <div className="w-1/4 flex items-center justify-between">
                      <button
                        className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type='submit'>
                        Login
                      </button>
                    </div>
                  )}
              </form>

              {/* Logo and Heading */}
              <div className="flex flex-row justify-center items-center space-x-1 w-full">
                <Image src="/images/reallogo.png" alt="Access Control Logo" width={70} height={70} className="object-contain" />
                <span className={`${lexend.className} text-xl font-bold text-black tracking-wide`}>Access Control Portal</span>
              </div>

              {/* Snackbar for login result */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={3500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </div>

            {/* Right Side - Image */}
            <div
              className="w-full md:w-1/2 h-full overflow-hidden bg-cover bg-center relative transition-all duration-1000"
              style={{ backgroundImage: `url(${images[currentImageIndex]})`, transition: 'background-image 1s ease-in-out' }}
            >
              {/* Full blurred overlay */}
              <div className="absolute inset-0 w-full h-full backdrop-blur-lg z-10" />
              {/* Centered small image preview on top of blur */}
              <div className="absolute inset-0 flex items-center justify-center z-20 h-full w-full">
                <div className="rounded-xl flex items-center justify-center w-[3/4] h-[3/4]">
                  <div
                    className={`transition-opacity duration-1000 w-full h-full rounded-xl ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  >
                    <Image
                      src={images[currentImageIndex]}
                      alt={`Preview ${currentImageIndex+1}`}
                      width={500}
                      height={500}
                      className="object-cover rounded-xl w-full h-full"
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

        </div>
  );
};

export default SignInComponent;