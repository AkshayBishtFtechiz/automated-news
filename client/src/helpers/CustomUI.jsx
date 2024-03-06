import React from "react";
import "../Styles/buttons.css";
import axios from "axios";
import { toast } from "react-toastify";

const CustomUi = (props) => {
  const handleConfirm = async () => {
    await axios
      .delete("http://localhost:5000/api/new-firm-news-wire/delete", {
        data: props.payload,
      })
      .then((response) => {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        props.onClose();
        props.fetchData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div id="react-confirm-alert">
      <div className="react-confirm-alert-overlay">
        <div className="react-confirm-alert">
          <div className="react-confirm-alert-body">
            <h2 className="delete-firm-title">Delete Firm</h2>
            <p className="delete-firm">
              Are you sure you want to delete
              <strong>&nbsp;{props.label}</strong>?
            </p>

            <button className="yes" onClick={handleConfirm}>
              Yes
            </button>

            <button
              className="no"
              onClick={() => {
                props.onClose();
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomUi;
