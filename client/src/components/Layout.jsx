import React, { useEffect, useState } from "react";
import ReleasesIssuedByFirm from "./ReleasesIssuedByFirm";
import MostFrequentlyIssuedByTicker from "./MostFrequentlyIssuedByTicker";
import MostFrequentlyIssuedByTickerandFirm from "./MostFrequentlyIssuedByTickerandFirm";
import AddNewFirms from "./AddNewFirms";
import Snackbar from "@mui/material/Snackbar";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import "../Styles/online.css";

import { Container } from "@mui/material";

const Layout = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => { 
      setIsOnline(true);
      setOpen(true);
    }
    const handleOffline = () => {
      setIsOnline(false);
      setOpen(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleClose = () => {
    setTimeout(() => {
        setOpen(false);
    }, 2000);
  }


  return (
    <>
      <div>
        <h1 align="center" style={{ marginBottom: "30px", marginTop: "30px" }}>
          Automated News
        </h1>
      </div>
      <Container>
        <ReleasesIssuedByFirm />
        <MostFrequentlyIssuedByTicker />
        <MostFrequentlyIssuedByTickerandFirm />
        <AddNewFirms />
        {isOnline ? (
          <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={
            <div className="parentDiv">
              <div className="dot" />
              <div className="connectMessage">Connection established!</div>
            </div>
          }
          key="online"
        />
        ): (
          <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={
            <div className="disconnectDiv">
              <div>
              <WifiOffIcon />
            </div>
            <div className="disconnectMessage"> You are offline</div>
            </div>
          }
          key="offline"
        />
        )}
      </Container>
    </>
  );
};

export default Layout;

// online - #14a800
