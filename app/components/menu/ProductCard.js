"use client";
import Link from "next/link";
import { useState } from "react";
const ProductCard = ({
  image,
  hoverImage,
  name,
  subtitle,
  price,
  rate,
  id,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className=' relative overflow-hidden group transition shadow-lg'>
      <div
        className=' rounded overflow-hidden '
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          className='w-full h-96 object-cover cursor-pointer'
          src={isHovered ? hoverImage : image}
          alt={name}
          onMouseEnter={handleMouseEnter}
        />
        <div className='px-6 py-4'>
          <Link
            href={`/${id}`}
            className='font-bold text-base mb-2 cursor-pointer hover:text-primary line-clamp-2 '
          >
            {name}
          </Link>
          <p className='text-gray-600 text-sm mt-2 line-clamp-2'>{subtitle}</p>
        </div>
        <div className='px-6 py-4 flex justify-between'>
          <p className='text-gray-900 font-semibold text-base'>{price}</p>
          <p className='flex gap-2 items-center mr-2 text-sm'>
            <i className='ri-star-fill text-yellow-400'></i>
            <span className='font-semibold'>5</span>
          </p>
        </div>
      </div>
      <div className='absolute top-6  md:-right-11 group-hover:right-8 md:group-hover:right-3 p-2 flex flex-col items-center justify-center gap-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300'>
        <button>
          <div className='h-8 w-8 md:h-12 md:w-12 flex justify-center items-center text-white bg-primary'>
            <i className='ri-shopping-cart-2-line text-sm md:text-xl '></i>
          </div>
        </button>
        <Link
          href={`/${id}`}
          className='bg-white h-8 w-8 md:h-12 md:w-12 flex justify-center items-center text-black drop-shadow-xl'
        >
          <i className='ri-eye-fill text-sm md:text-xl'></i>
        </Link>
      </div>
      <span className='absolute top-0 left-0 m-2 md:m-4 bg-white border  px-3 py-1 text-center text-xs font-medium text-red-600'>
        39% OFF
      </span>
    </div>
  );
};

export default ProductCard;
