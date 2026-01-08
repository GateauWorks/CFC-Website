"use client";

import cn from "classnames";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Props = {
  title: string;
  src: string;
  slug?: string;
  hero?: boolean;
};

const CoverImage = ({ title, src, slug, hero = false }: Props) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // If there's an error or no src, show a placeholder
  if (!src || imageError) {
    return (
      <div className="sm:mx-0">
        <div 
          className={cn("bg-gray-200 flex items-center justify-center text-gray-500", {
            "h-64 md:h-80": !hero,
            "h-[500px] md:h-[600px] lg:h-[800px]": hero,
          })}
        >
          <div className="text-center">
            <p className="text-sm">No image available</p>
            {src && <p className="text-xs mt-1">Failed to load: {src}</p>}
          </div>
        </div>
      </div>
    );
  }

  const image = (
    <div className="relative">
      <Image
        src={src}
        alt={`Cover Image for ${title}`}
        className={cn("shadow-sm w-full object-cover transition-opacity", {
          "hover:shadow-lg transition-shadow duration-200": slug,
          "h-64 md:h-80": !hero,
          "h-[500px] md:h-[600px] lg:h-[800px]": hero,
          "opacity-0": !imageLoaded,
          "opacity-100": imageLoaded,
        })}
        width={1300}
        height={630}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
        }}
        unoptimized={src.includes('supabase.co')} // Disable optimization for Supabase images temporarily
      />
      {!imageLoaded && (
        <div className={cn("absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center", {
          "h-64 md:h-80": !hero,
          "h-[500px] md:h-[600px] lg:h-[800px]": hero,
        })}>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
