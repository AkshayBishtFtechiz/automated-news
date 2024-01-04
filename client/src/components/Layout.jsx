import React from "react";
import ReleasesIssuedByFirm from "./ReleasesIssuedByFirm";
import MostFrequentlyIssuedByTicker from "./MostFrequentlyIssuedByTicker";
import { Typography } from "antd";
import MostFrequentlyIssuedByTickerandFirm from "./MostFrequentlyIssuedByTickerandFirm";

const Layout = () => {
  const { Title } = Typography;
  return (
    <>
      <div className="mt-3">
        <Typography>
          <Title align="center">Automated News</Title>
        </Typography>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-9 col-lg-9 col-xs-12">
            <ReleasesIssuedByFirm />
          </div>
          <div className="col-md-3 col-lg-3 col-xs-12">
            <MostFrequentlyIssuedByTicker />
          </div>
         
        </div>
        <div className="row mb-5">
        <div className="col-lg-12 col-md-12 col-xs-12 mx-auto mt-4">
            <MostFrequentlyIssuedByTickerandFirm />
          </div>
        </div>
        
      </div>
    </>
  );
};

export default Layout;
