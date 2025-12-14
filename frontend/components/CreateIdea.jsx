import React from 'react';
import { INPUT_SHADOW } from './Shadows';

// Pastikan menerima prop 'currentUser'
const CreateIdea = ({ onTrigger, currentUser }) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 mb-8 shadow-sm border border-gray-100/50">
      <div className="flex gap-4 items-center">
        
        {/* FIX: GUNAKAN AVATAR DARI CURRENT USER (DENGAN FALLBACK) */}
        <img 
            src={currentUser.avatar} 
            alt="User" 
            className="w-12 h-12 rounded-full border border-gray-100 object-cover bg-gray-50"
        />
        
        <button 
            onClick={onTrigger}
            className={`flex-1 text-left bg-gray-50 hover:bg-gray-100 text-gray-400 text-sm rounded-2xl py-3.5 px-6 transition-all duration-200 ${INPUT_SHADOW}`}
        >
            Share your brilliant idea, {currentUser?.handle || 'Guest'}?
        </button>
      </div>
    </div>
  );
};

export default CreateIdea;