import React from "react";
import ReleasesIssuedByFirm from "./ReleasesIssuedByFirm";
import MostFrequentlyIssuedByTicker from "./MostFrequentlyIssuedByTicker";
import MostFrequentlyIssuedByTickerandFirm from "./MostFrequentlyIssuedByTickerandFirm";
import { Container } from "@mui/material";

const Layout = () => {
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
      </Container>
    </>
  );
};

export default Layout;
