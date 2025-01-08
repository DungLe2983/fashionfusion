"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@mui/material";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  //promotion state
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionData, setPromotionData] = useState();
  const [promotionLabel, setPromotionLabel] = useState(false);
  const [promotionPrice, setPromotionPrice] = useState(0);
  const [isApplied, setIsApplied] = useState(false);

  const session = useSession();
  const { status } = session;
  const userEmail = session.data?.session.user.email;
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userData, setUserData] = useState();

  const [showImage, setShowImage] = useState(false);

  const handleRadioChange = (e) => {
    setShowImage(!showImage);
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`/api/cart-item/${userEmail}`);
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const data = await response.json();
      console.log("data", data);
      setCartItems(data);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  };

  async function getUser(email) {
    try {
      const res = await fetch(`/api/users/${email}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const user = await res.json();
        console.log(user);
        if (user) {
          setUserData(user);
        } else {
          console.error("User not found or response is empty.");
        }
      } else {
        console.error("Error fetching user:", res.statusText);
      }
    } catch (error) {
      console.error("Error in fetch:", error);
    }
  }

  //Handle promotion start
  const handleInputChange = (e) => {
    setPromotionCode(e.target.value);
  };

  const handleApplyClick = async () => {
    try {
      const response = await fetch("/api/promotion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promotionCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setPromotionData(data.promotion);
        toast.success(data.message);
        setPromotionLabel(true);
        setIsApplied(true);
      } else {
        toast.error(data.message);
        setPromotionLabel(false);
      }
    } catch (error) {
      console.error("Error in fetch:", error);
    }
  };

  const handleRemovePromotion = () => {
    setPromotionCode("");
    setIsApplied(false);
    setPromotionLabel(false);
    setPromotionPrice(0);
    setPromotionData();
  };
  //Handle promotion end

  useEffect(() => {
    if (userEmail) {
      fetchCartItems();
      getUser(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    const calculateTotalPrice = () => {
      const total = cartItems.reduce((sum, item) => {
        return sum + item.product_item_id.price * item.item_quantity;
      }, 0);

      // Kiểm tra xem có khuyến mãi không
      if (promotionData) {
        const { percent, price_promotion } = promotionData;

        if (percent && percent > 0) {
          setPromotionPrice(total * (percent / 100));
        }
        // Hoặc nếu có giá khuyến mãi
        else if (price_promotion && price_promotion > 0) {
          setPromotionPrice(price_promotion);
        }
      }

      setTotalPrice(total);
    };

    if (cartItems.length > 0) {
      calculateTotalPrice();
    } else {
      setTotalPrice(0);
    }
  }, [cartItems, promotionData]);

  function isVietnamesePhoneNumberValid(number) {
    return /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/.test(number);
  }

  const handlePhoneNumberChange = (e) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);

    // Kiểm tra số điện thoại
    if (!isVietnamesePhoneNumberValid(newPhoneNumber)) {
      setError("Số điện thoại không hợp lệ.");
    } else {
      setError("");
    }
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
  };

  async function handleCreateOrder() {
    if (!userData._id || !phoneNumber || !address) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      // alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const res = await fetch(`/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cartItems[0].cart_id,
          userId: userData._id,
          detail_id: [],
          phone: phoneNumber,
          address: address,
          note: note,
          total: totalPrice + 30000 - promotionPrice,
          promotionCode: promotionCode,
        }),
      });

      if (!res.ok) {
        // console.log("fail to fetch post order", res);
        toast.error("Mã khuyến mãi đã hết lượt sử dụng");
        throw new Error(`HTTP error status: ${res.status}`);
      } else {
        const data = await res.json();
        console.log("data", data);
        window.location.href = "/checkout/success";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // check authenticated
  if (status === "loading") {
    return "Loading....";
  }

  if (status === "unauthenticated") {
    return redirect("/login");
  }

  return (
    <div>
      <div>
        <div className='flex flex-col items-center  bg-white py-4 sm:flex-row px-14'>
          <a href='#' className='text-2xl font-bold text-gray-800'>
            Thông tin vận chuyển
          </a>
        </div>
        <div className='grid px-2 md:px-10 lg:grid-cols-2 '>
          {/* Bên trái */}
          <div className='mt-10 bg-gray-50 px-4 pt-8 lg:mt-0'>
            <p className='text-xl font-medium'>Thông tin chi tiết</p>
            <p className='text-gray-400'>
              Hoàn thành thông tin liên hệ của bạn
            </p>
            <div className=''>
              <label
                for='email'
                className='mt-4 mb-2 block text-sm font-medium'
              >
                Email
              </label>
              <div className='relative'>
                <input
                  type='text'
                  id='email'
                  name='email'
                  required
                  className='w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:z-10 focus:border-gray-500 focus:ring-gray-500'
                  value={session.data?.session.user.email}
                  disabled={true}
                />
                <div className='pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3'>
                  <i className='ri-mail-send-line'></i>
                </div>
              </div>
              <label
                for='Username'
                className='mt-4 mb-2 block text-sm font-medium'
              >
                Họ và tên
              </label>
              <div className='relative'>
                <input
                  type='text'
                  id='Username'
                  name='Username'
                  required
                  className='w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm uppercase shadow-sm outline-none focus:z-10 focus:border-gray-500 focus:ring-gray-500'
                  value={session.data?.session.user.name}
                  disabled={true}
                />
                <div className='pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3'>
                  <i className='ri-id-card-line'></i>
                </div>
              </div>

              <label
                for='UserPhone'
                className='mt-4 mb-2 block text-sm font-medium'
              >
                Số điện thoại
              </label>
              <div className='relative'>
                <div className=''>
                  <input
                    id='UserPhone'
                    name='UserPhone'
                    list='phone-list'
                    required
                    className='w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm uppercase shadow-sm outline-none focus:z-10 focus:border-gray-500 focus:ring-gray-500'
                    onChange={handlePhoneNumberChange}
                    autoComplete='off'
                  />

                  <datalist id='phone-list'>
                    <option value={userData?.phoneNumber} />
                  </datalist>

                  <div className='pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3'>
                    <i className='ri-phone-line'></i>
                  </div>
                </div>
              </div>
              {error && (
                <span className='text-red-500 text-xs mt-1'>{error}</span>
              )}

              <label
                for='billing-address'
                className='mt-4 mb-2 block text-sm font-medium'
              >
                Địa chỉ giao hàng
              </label>
              <div className='flex flex-col sm:flex-row'>
                <div className='relative flex-shrink-0 w-full'>
                  <input
                    type='text'
                    id='billing-address'
                    list='address-list'
                    name='billing-address'
                    onChange={handleAddressChange}
                    required
                    className='w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:z-10 focus:border-gray-500 focus:ring-gray-500'
                    autoComplete='off'
                  />

                  <datalist id='address-list'>
                    {userData?.address.map((address) => (
                      <option key={address} value={address} />
                    ))}
                  </datalist>

                  <div className='pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3'>
                    <i class='ri-home-8-line'></i>
                  </div>
                </div>
              </div>
              <label
                for='billing-note'
                className='mt-4 mb-2 block text-sm font-medium'
              >
                Ghi chú
              </label>
              <div className='flex flex-col sm:flex-row'>
                <div className='relative flex-shrink-0 w-full'>
                  <input
                    type='text'
                    id='billing-note'
                    name='billing-note'
                    onChange={handleNoteChange}
                    className='w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:z-10 focus:border-gray-500 focus:ring-gray-500'
                    placeholder='Ví dụ: Giao hàng giờ hành chính'
                  />
                  <div className='pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3'>
                    <i className='ri-sticky-note-line'></i>
                  </div>
                </div>
              </div>

              <label
                for='promotion'
                className='mt-4 mb-2 block text-sm font-medium'
              >
                Mã khuyễn mãi
              </label>
              <div className='flex flex-col sm:flex-row'>
                <div className='relative flex-shrink-0 w-full'>
                  <input
                    type='text'
                    id='promotion'
                    name='promotion'
                    className='w-full rounded-md border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:z-10 focus:border-gray-500 focus:ring-gray-500'
                    placeholder='Ví dụ: HOTDEAL24'
                    onChange={handleInputChange}
                    value={promotionCode}
                    disabled={isApplied}
                  />
                  <div className='pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3'>
                    <i className='ri-discount-percent-line'></i>
                  </div>
                  {!isApplied && promotionCode && (
                    <div className='absolute inset-y-0 right-0 flex items-center px-3'>
                      <button
                        className='text-primary z-[999] hover:text-red-500 text-sm cursor-pointer'
                        onClick={handleApplyClick}
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}

                  {isApplied && (
                    <div className='absolute inset-y-0 right-0 flex items-center px-3'>
                      <button
                        className='text-red-500 z-[999] hover:text-red-700 text-sm cursor-pointer'
                        onClick={handleRemovePromotion}
                      >
                        ✖
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className='mt-6 border-t border-b py-2'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-gray-900'>Tạm tính</p>
                  <p className='font-semibold text-gray-900'>
                    {totalPrice.toLocaleString()}đ
                  </p>
                </div>

                {promotionLabel && (
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-red-500'>Giảm giá</p>
                    <p className='font-semibold text-red-500'>
                      - {promotionPrice.toLocaleString()}đ
                    </p>
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-gray-900'>
                    Phí giao hàng
                  </p>
                  <p className='font-semibold text-gray-900'>30.000 ₫</p>
                </div>
              </div>
              <div className='mt-6 flex items-center justify-between'>
                <p className='text-sm font-medium text-gray-900'>Tổng</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {(totalPrice - promotionPrice + 30000).toLocaleString()}đ
                </p>
              </div>
            </div>

            <div className='flex justify-center'>
              <button
                className={`w-full bg-primary text-center rounded-md mt-6 text-white py-3 font-bold ${
                  error ? "pointer-events-none bg-[#75a195]" : ""
                }`}
                onClick={() => {
                  handleCreateOrder();
                }}
              >
                Đặt hàng
              </button>
            </div>
          </div>

          {/* Bên phải */}
          <div className='px-4 pt-8'>
            <p className='text-xl font-medium'>Tóm tắt đơn hàng</p>
            <p className='text-gray-400'>
              Hãy kiểm tra kỹ thông tin của đơn hàng
            </p>

            <div className='mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6'>
              {cartItems.map((item) => (
                <div className='flex flex-col rounded-lg bg-white sm:flex-row'>
                  <img
                    className='m-2 h-28 w-28 rounded-md border object-cover object-center'
                    src={item.product_item_id.product_id.image[0]}
                    alt=''
                  />
                  <div className='flex w-full flex-col px-4 py-4 justify-between'>
                    <span className='font-semibold text-sm'>
                      {item.product_item_id.product_id.name}
                    </span>
                    <div className='flex gap-4 mt-3 items-center '>
                      <span className='float-right text-gray-400 text-sm'>
                        {item.product_item_id.color_id.name} /{" "}
                        {item.product_item_id.size_id.name}
                      </span>
                      <div className='flex items-center gap-0'>
                        <input
                          id='first_product'
                          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm block h-6 w-8  text-center appearance-none'
                          required
                          disabled
                          value={item.item_quantity}
                        />
                      </div>
                    </div>
                    <p className='text-lg font-bold'>
                      {(
                        item.product_item_id.price * item.item_quantity
                      ).toLocaleString()}{" "}
                      đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className='mt-8 text-lg font-medium'>Phương thức thanh toán</p>
            <form className='mt-5 grid gap-2'>
              <div className='relative'>
                <input
                  className='peer hidden'
                  type='radio'
                  id='hideRadio'
                  name='imageToggle'
                  value='hide'
                  onChange={handleRadioChange}
                  checked={!showImage}
                />
                <span className='peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white'></span>
                <label
                  className='peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4'
                  htmlFor='hideRadio'
                >
                  <div className='flex items-center'>
                    <i className='ri-truck-line text-4xl text-primary'></i>
                    <div className='ml-5'>
                      <span className='mt-2 font-semibold'>COD</span>
                      <p className='text-slate-500 text-sm leading-6'>
                        Thanh toán khi nhận hàng
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              <div className='relative'>
                <input
                  className='peer hidden'
                  type='radio'
                  id='showRadio'
                  name='imageToggle'
                  value='show'
                  onChange={handleRadioChange}
                  checked={showImage}
                />
                <span className='peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white'></span>
                <label
                  className='peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4'
                  htmlFor='showRadio'
                >
                  <div className='flex items-center'>
                    <i className='ri-wallet-3-line text-4xl text-primary'></i>
                    <div className='ml-5'>
                      <span className='mt-2 font-semibold'>Online Payment</span>
                      <p className='text-slate-500 text-sm leading-6'>
                        Thanh toán Online
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              <div>
                <div className={`mt-4 ${showImage ? "block" : "hidden"}`}>
                  <img
                    src={"/qrmomo.jpg"}
                    className='w-full h-full mt-16'
                    alt='Flowbite Logo'
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
