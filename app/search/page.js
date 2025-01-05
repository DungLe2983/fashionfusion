"use client";

// import React, { Suspense, useEffect, useState } from 'react';
// import NotFoundResult from '../components/menu/NotFoundResult';
// import ProductCard from '../components/menu/ProductCard';
// import { useSearchParams } from 'next/navigation';

// const SearchPage = () => {
//   const [products, setProducts] = useState([]);
//   const [decodedQuery, setDecodedQuery] = useState('');
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const query = searchParams.get('query');
//     setDecodedQuery(decodeURIComponent(query || ''));
//   }, [searchParams]);

//   async function getSearchProducts(input) {
//     try {
//       const res = await fetch(`/api/products/search?query=${input}`);
//       if (res.ok) {
//         const data = await res.json();
//         if (data) {
//           setProducts(data);
//         } else {
//           console.error('User not found or response is empty.');
//         }
//       } else {
//         console.error('Error fetching user:', res.statusText);
//       }
//     } catch (error) {
//       console.error('Fail fetch', error.message);
//     }
//   }

//   useEffect(() => {
//     if (decodedQuery) {
//       getSearchProducts(decodedQuery);
//     }
//   }, [decodedQuery]);

//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <div>
//         {products?.length === 0 ? (
//           <NotFoundResult searchInput={decodedQuery} />
//         ) : (
//           <>
//             <p className='text-xl font-semibold text-gray-800 my-10'>
//               Kết quả từ khóa "{decodedQuery}"
//             </p>
//             <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-[20px] gap-y-10'>
//               {products?.map((product, index) => {
//                 const productItems = product.product_item_id;
//                 let minPrice = 1;

//                 if (productItems || Array.isArray(productItems)) {
//                   minPrice = Math.min(
//                     ...productItems.map((item) => item.price)
//                   );
//                 }

//                 return (
//                   <ProductCard
//                     key={index}
//                     image={product.image}
//                     hoverImage={product.image}
//                     name={product.name}
//                     subtitle={
//                       product.description.length > 20
//                         ? `${product.description.substring(0, 70)}...`
//                         : product.description
//                     }
//                     price={
//                       <span>
//                         {minPrice === Infinity
//                           ? '0₫'
//                           : `${minPrice.toLocaleString()} ₫`}
//                       </span>
//                     }
//                     rate={'5'}
//                     id={product._id}
//                   />
//                 );
//               })}
//             </div>
//           </>
//         )}
//       </div>
//     </Suspense>
//   );
// };

// export default SearchPage;

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NotFoundResult from "../components/menu/NotFoundResult";
import ProductCard from "../components/menu/ProductCard";

const SearchPage = () => {
  //get search query
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const query = searchParams.get("query");
    if (query) {
      setSearchQuery(decodeURIComponent(query));
      getSearchProducts(decodeURIComponent(query));
    }
  }, [searchParams]);

  async function getSearchProducts(input) {
    try {
      const res = await fetch(`/api/products/search?query=${input}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProducts(data);
        } else {
          console.error("User not found or response is empty.");
        }
      } else {
        console.error("Error fetching user:", res.statusText);
      }
    } catch (error) {
      console.error("Fail fetch", error.message);
      setProducts([]);
    }
  }

  // useEffect(() => {
  //   if (searchQuery) {
  //     getSearchProducts(searchQuery);
  //   }
  // }, [searchQuery]);

  return (
    <div>
      {products?.length === 0 ? (
        <NotFoundResult searchInput={searchQuery} />
      ) : (
        <>
          <p className="text-xl font-semibold text-gray-800 my-10">
            Kết quả từ khóa "{searchQuery}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-[20px] gap-y-10">
            {products?.map((product, index) => {
              const productItems = product.product_item_id;
              let minPrice = 1;

              if (productItems || Array.isArray(productItems)) {
                minPrice = Math.min(...productItems.map((item) => item.price));
              }

              return (
                <ProductCard
                  key={index}
                  image={product.image}
                  hoverImage={product.image}
                  name={product.name}
                  subtitle={
                    product.description.length > 20
                      ? `${product.description.substring(0, 70)}...`
                      : product.description
                  }
                  price={
                    <span>
                      {minPrice === Infinity
                        ? "0₫"
                        : `${minPrice.toLocaleString()} ₫`}
                    </span>
                  }
                  rate={"5"}
                  id={product._id}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
