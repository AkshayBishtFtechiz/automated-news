import React from "react";
import ReleasesIssuedByFirm from "./ReleasesIssuedByFirm";
import MostFrequentlyIssuedByTicker from "./MostFrequentlyIssuedByTicker";
import MostFrequentlyIssuedByTickerandFirm from "./MostFrequentlyIssuedByTickerandFirm";
import { Container } from "@mui/material";

const Layout = () => {
  return (
    <>
      <div>
        <h4 align="center" style={{ marginBottom: "30px", marginTop: "30px" }}>
          Automated News
        </h4>
      </div>
      <Container>
        <ReleasesIssuedByFirm />
        <MostFrequentlyIssuedByTicker />
        <MostFrequentlyIssuedByTickerandFirm />
      </Container>
    </>
  );
};

export default Layout;
