import React, { useState } from 'react';

function AccountInfo({ nextStep, handleChange, values }) {
  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState('');

  const validate = () => {
    const newErrors = {};

    if (!values.name) newErrors.name = "Name is required";
    if (!values.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!values.phone) newErrors.phone = "Phone is required";
    // If coming from Google, skip password validation in Account step
    const isGoogle = values._fromGoogle;
    if (!isGoogle) {
      if (!values.password) {
        newErrors.password = "Password is required";
      } else if (values.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirm Password is required";
      } else if (values.password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input 
          type="text" 
          placeholder="Name" 
          onChange={(e) => handleChange('name', e.target.value)} 
          value={values.name} 
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => handleChange('email', e.target.value)} 
          value={values.email} 
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input 
          type="text" 
          placeholder="Phone" 
          onChange={(e) => handleChange('phone', e.target.value)} 
          value={values.phone} 
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      {!values._fromGoogle && (
      <div className="flex space-x-4">
        <div className="w-1/2 space-y-1" >
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => handleChange('password', e.target.value)} 
            value={values.password}  
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        <div className="w-1/2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input 
            type="password" 
            placeholder="Confirm Password" 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            value={confirmPassword} 
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>
      )}

      <button type="submit" className="w-full p-2 bg-black text-white rounded-md">
        Next
      </button>
    </form>
  );
}

export default AccountInfo;
