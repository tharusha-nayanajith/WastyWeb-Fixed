import React, { useState } from 'react';

function Verification({ prevStep, handleChange, handleSubmit }) {
  const [errors, setErrors] = useState({});

  const validateFile = (file) => {
    if (!file) return 'File is required';
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) return 'Only JPEG and PNG are allowed';
    if (file.size > maxSize) return 'File size must be 5MB or less';
    return '';
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">NIC ID Image</label>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            const err = validateFile(file);
            setErrors((prev) => ({ ...prev, nicIdImage: err }));
            if (!err) handleChange('nicIdImage', file);
          }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nicIdImage && <p className="text-sm text-red-600">{errors.nicIdImage}</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Address Verification Document</label>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            const err = validateFile(file);
            setErrors((prev) => ({ ...prev, addressVerificationDoc: err }));
            if (!err) handleChange('addressVerificationDoc', file);
          }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.addressVerificationDoc && <p className="text-sm text-red-600">{errors.addressVerificationDoc}</p>}
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-full py-2 px-4 text-black border border-black rounded-lg hover:bg-gray-100 transition"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-full py-2 px-4 text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          disabled={Boolean(errors.nicIdImage || errors.addressVerificationDoc)}
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export default Verification;
