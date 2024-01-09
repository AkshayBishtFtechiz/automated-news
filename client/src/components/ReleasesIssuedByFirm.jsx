import React from "react";
import { Table, Card, Select, Spin, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UseNewsStore } from "../store";
import moment from "moment";

const ReleasesIssuedByFirm = () => {
  const queryKey = "businessWireData";
  const myStore = UseNewsStore();

  const fetchBusinessWireData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/business-wire");
      const response1 = await axios.get("http://localhost:5000/pr-news-wire");
      const response2 = await axios.get("http://localhost:5000/news-files");
      const response3 = await axios.get(
        "http://localhost:5000/globe-news-wire"
      );

      const allNewsData = [
        ...response.data,
        ...response1.data,
        ...response2.data,
        ...response3.data,
      ];

      const arr = allNewsData
        .map((items) => items?.payload)
        .sort((a, b) => a.tickerSymbol.localeCompare(b.tickerSymbol));

      myStore.setAllTickers(arr);
      myStore.setAllNewsData(allNewsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const separateFirmTypes = (data) => {
    const firmData = {
      firms: [], // Array to store firm names
    };

    data.forEach((entry) => {
      const firmName = entry.firm;
      if (!firmData[firmName]) {
        firmData[firmName] = [];
      }
      firmData[firmName].push(entry.payload);

      // Add firm name to the 'firms' array if not already present
      if (!firmData.firms.includes(firmName)) {
        firmData.firms.push(firmName);
      }
    });

    return firmData;
  };

  // Use useQuery hook to handle data fetching and caching
  const { isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchBusinessWireData,
    refetchInterval: 1200000,
  });

  const separatedData = separateFirmTypes(myStore.allNewsData);

  const filterDataByDays = (separatedData, days) => {
    const currentDate = moment();
    const filteredData = {};

    Object.keys(separatedData).forEach((firmName) => {
      const filteredPayloads = separatedData[firmName].filter((payload) => {
        const issuedDate = moment(payload.dateTimeIssued, "MMMM DD, YYYY");
        const differenceInDays = currentDate.diff(issuedDate, "days");

        return differenceInDays <= days;
      });

      if (filteredPayloads.length > 0) {
        filteredData[firmName] = filteredPayloads;
      } else {
        // Add missing firm with value 0
        filteredData[firmName] = [];
      }
    });

    // Check for missing firms in separatedData
    const missingFirms = Object.keys(separatedData).filter(
      (firmName) => !filteredData.hasOwnProperty(firmName)
    );

    // Populate missing firms with value 0
    missingFirms.forEach((missingFirm) => {
      filteredData[missingFirm] = [];
    });

    return filteredData;
  };

  const handleChange = async (value) => {
    // Example usage for filtering last 5 days
    const filteredData = [];

    // Use the dynamically obtained value as the duration
    const dynamicDuration = parseInt(value);

    // Filter data for the specified duration
    const filteredByDays = filterDataByDays(separatedData, dynamicDuration);

    // Push the filtered data to the single array in the store
    filteredData.push(filteredByDays);

    // Update the single array in the store
    myStore.setFilteredData(filteredData[0]);
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      key: "serial",
    },
    {
      title: "Firm",
      dataIndex: "firmName",
      key: "firmName",
    },
    {
      title: "Total Releases",
      dataIndex: "totalReleases",
      key: "totalReleases",
    },
    {
      title: "Service Issued on",
      dataIndex: "filteredServiceIssuedOnData",
      key: "filteredServiceIssuedOnData",
      render: (_, { filteredServiceIssuedOnData }) => (
        <>
          {filteredServiceIssuedOnData.map((item, index) => (
            <Tag key={index} style={{marginBottom: 5}}>
              {item}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Tickers",
      dataIndex: "tickers",
      key: "tickers",
      render: (_, { tickers }) => (
        <>
          {tickers.map((item, index) => (
            <Tag key={index} color={getTagColor(item)} style={{marginBottom: 5}} >
             {item}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  function getTagColor(ticker) {
    const colors = ["red", "blue", "green", "orange", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
  }

  const data = Object.entries(separatedData).map(
    ([firmName, firmData], index) => {
      const totalReleases =
        myStore.filteredData[firmName] !== undefined
          ? myStore.filteredData[firmName]?.length
          : firmData.length;

      const filteredfirmData = firmData.slice(0);
      const filteredTickerData =
        myStore.filteredData[firmName] !== undefined
          ? myStore.filteredData[firmName].map((item) => item.tickerSymbol)
          : filteredfirmData.map((items) => items.tickerSymbol);
      const filteredServiceIssuedOnData =
        myStore.filteredData[firmName] !== undefined
          ? myStore.filteredData[firmName].map((item) => item.serviceIssuedOn)
          : filteredfirmData.map((items) => items.serviceIssuedOn);
      const data = [...new Set(filteredServiceIssuedOnData)];

      return {
        serial: index,
        key: firmName,
        firmName,
        totalReleases,
        tickers: filteredTickerData,
        filteredServiceIssuedOnData: data,
      };
    }
  );
  const filteredData = data.slice(1);

  return (
    <div>
      <Card
        title="Issued by Firm"
        bordered={false}
        className="mb-3"
        extra={
          !isLoading ? (
          <Select
            placeholder="Days"
            style={{
              width: 100,
            }}
            onChange={handleChange}
            options={[
              {
                value: "5",
                label: "5 Days",
              },
              {
                value: "15",
                label: "15 Days",
              },
              {
                value: "30",
                label: "30 Days",
              },
            ]}
          />
          ) : (
            ""
          )
        }
      >
        {isLoading ? (
          <div className="text-center">
           <Spin />
          </div>
        ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ defaultPageSize: 5 }}
          bordered
        />
        )}
      </Card>
    </div>
  );
};

export default ReleasesIssuedByFirm;
