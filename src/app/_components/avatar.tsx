"use client";

import { useState } from 'react';

type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name, picture }: Props) => {
  const [imageError, setImageError] = useState(false);

  // Debug: Log the picture src
  console.log("Avatar picture src:", picture);

  return (
    <div className="flex items-center">
      {!imageError ? (
        <img 
          src={picture} 
          className="w-12 h-12 rounded-full mr-4 object-cover" 
          alt={name}
          onError={(e) => {
            console.error("Avatar image failed to load:", picture, e);
            setImageError(true);
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full mr-4 bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="text-xl font-bold">{name}</div>
    </div>
  );
};

export default Avatar;
