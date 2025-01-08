import React from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Address = ({ address, onChange, email, onDeleteSuccess }) => {
  if (!address) {
    return null;
  }

  async function handleDelete(email, address) {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "Bạn có chắc chắn xóa địa chỉ này ra khỏi danh sách địa chỉ không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`/api/users/${email}/addresses`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ address: address }),
            });
            if (res.ok) {
              Swal.fire({
                title: "Deleted!",
                text: "Xóa địa chỉ thành công!",
                icon: "success",
              });
              onDeleteSuccess(address);
            } else {
              toast.error("Delete Adress failed");
            }
          } catch (ex) {
            console.log(ex);
          }
        }
      });
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <div className='flex justify-between mt-4'>
        <p className=' font-medium text-gray-600 text-xs md:text-base'>
          {address}
        </p>

        <div className='flex gap-2  text-primary text-xs md:text-sm '>
          <button
            className='pr-2 hover:text-hoverColor '
            onClick={onChange}
          ></button>
          <button
            className=' hover:text-red-500'
            onClick={() => {
              handleDelete(email, address);
            }}
          >
            Xóa
          </button>
        </div>
      </div>
      <hr className='mt-4 mb-8' />
    </>
  );
};

export default Address;
