import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountInfo from '../../components/customer/AccountInfo';
import AddressInfo from '../../components/customer/AddressInfo';
import Verification from '../../components/customer/Verification';
import Logo from '../../images/logo.png'
import axios from 'axios';
import GoogleLoginButton from '../../components/GoogleLoginButton';

function Registration() {
  const navigate = useNavigate();
  const [googlePrefill, setGooglePrefill] = useState({ fromGoogle: false });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: { line1: '', line2: '', city: '', state: '', postalCode: '' },
    nicIdImage: null,
    addressVerificationDoc: null,
  });

  useEffect(() => {
    // If redirected with prefill (e.g., from Google), parse query params
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const email = params.get('email');
    const from = params.get('from');
    if (from === 'google') {
      setGooglePrefill({ fromGoogle: true });
    }
    setFormData((prev) => ({
      ...prev,
      name: name || prev.name,
      email: email || prev.email,
    }));
  }, []);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (input, value) => {
    if (input.startsWith('address.')) {
      const addressField = input.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [input]: value });
    }
  };

  const handleSubmit = () => {
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('password', formData.password);
    
    Object.keys(formData.address).forEach((key) => {
      form.append(`address.${key}`, formData.address[key]);
    });
    
    form.append('nicIdImage', formData.nicIdImage);
    form.append('addressVerificationDoc', formData.addressVerificationDoc);
  
    axios.post('http://localhost:9500/customer/register', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      console.log(response.data);
      alert('Registration successful');
      navigate('/customer/login');
    })
    .catch((error) => {
      console.error("Error submitting form:", error);
      alert('Registration failed');
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AccountInfo nextStep={nextStep} handleChange={handleChange} values={{...formData, _fromGoogle: googlePrefill.fromGoogle}} />;
      case 2:
        return <AddressInfo nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
      case 3:
        return <Verification prevStep={prevStep} handleChange={handleChange} handleSubmit={handleSubmit} values={formData} />;
      default:
        return <AccountInfo nextStep={nextStep} handleChange={handleChange} values={formData} />;
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-md mt-10">
      <div>

        {/* Logo */}
      <img src={Logo} alt="Logo" className="w-52 mb-4" />

      {/* Optional: Register with Google (prefills name/email) */}
      <GoogleLoginButton
        onSuccess={(data)=>{
          // If user already exists, this will log them in. Redirect to dashboard.
          const { token, userId } = data || {};
          if (token) {
            localStorage.setItem('token', token);
            if (userId) localStorage.setItem('customerId', userId);
            navigate('/customer/dashboard');
          }
        }}
        onError={(e)=>{
          const status = e?.response?.status;
          const suggested = e?.response?.data?.suggestedPayload;
          if (status === 404 && suggested) {
            setGooglePrefill({ fromGoogle: true });
            setFormData((prev)=>({
              ...prev,
              name: suggested.fullName || prev.name,
              email: suggested.email || prev.email,
            }));
          }
        }}
      />

{/* Title and Description */}
<h1 className="text-2xl font-semibold text-gray-800 mb-1">Registration</h1>
<p className="text-gray-600 mb-6">Please complete all steps to create your account</p>
        <h2 className="sr-only">Steps</h2>

        <div>
          <div className="overflow-hidden rounded-full bg-gray-200">
            {/* Progress Bar - Adjust width based on step */}
            <div
  className="h-2 rounded-full bg-black"
  style={{ width: `${((step - 1) / 2) * 100}%` }}
></div>

          </div>

          <ol className="mt-4 grid grid-cols-3 text-sm font-medium text-gray-500">
            <li className={`flex items-center justify-start ${step >= 1 ? 'text-black' : ''}`}>
              <span className="hidden sm:inline"> Account Info </span>
              <svg
                className="ml-2 size-6 sm:size-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </li>

            <li className={`flex items-center justify-center ${step >= 2 ? 'text-black' : ''}`}>
              <span className="hidden sm:inline"> Address Info </span>
              <svg
                className="ml-2 size-6 sm:size-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </li>

            <li className={`flex items-center justify-end ${step >= 3 ? 'text-black' : ''}`}>
              <span className="hidden sm:inline"> Verification </span>
              <svg
                className="ml-2 size-6 sm:size-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </li>
          </ol>
        </div>
      </div>

      {/* Render Step Components */}
      <div className="mt-8">
        {renderStep()}
      </div>
    </div>
  );
}

export default Registration;
