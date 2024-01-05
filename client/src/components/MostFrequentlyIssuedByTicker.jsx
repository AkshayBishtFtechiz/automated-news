// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import { Card } from "antd";
// import { Select } from "antd";
// import { Typography, Spin } from "antd";
// import { UseNewsStore } from "../store";
// import moment from "moment";

// const MostFrequentlyIssuedByTicker = () => {
//   const { Paragraph, Text } = Typography;
//   const [isLoading, setIsLoading] = useState(true);
//   // const paletteSemanticRed = "#F4664A";
//   const brandColor = "#5B8FF9";

//   const myStore = UseNewsStore();

//   useEffect(() => {
//     if (myStore.NASDAQData.length > 0) {
//       setIsLoading(false);
//     }
//   }, [myStore.NASDAQData, setIsLoading, isLoading]);

//   let tickerSymbols = myStore.NASDAQData.map(
//     (item) => item.payload.tickerSymbol
//   );
//   // let uniqueTickerSymbols = [...new Set(tickerSymbols)];

//   let tickerSymbols1 = myStore.NYSEData.map(
//     (item) => item.payload.tickerSymbol
//   );
//   // let uniqueTickerSymbols1 = [...new Set(tickerSymbols1)];

//   let tickerSymbols2 = myStore.OTCBBData.map(
//     (item) => item.payload.tickerSymbol
//   );
//   // let uniqueTickerSymbol2 = [...new Set(tickerSymbols2)];

//   console.log("NASDAQ TICKER SYMBOLS:", tickerSymbols);
//   console.log("NYSE TICKER SYMBOLS:", tickerSymbols1);
//   console.log("OTCBB TICKER SYMBOLS:", tickerSymbols2);

//   const ColumnData = [
//     {
//       type: "NASDAQ",
//       value:
//         myStore?.filteredNASDAQData?.length !== 0
//           ? myStore?.filteredNASDAQData?.length
//           : myStore?.NASDAQData?.length,
//       ticker:
//         myStore?.filteredNASDAQData?.length !== 0
//           ? myStore.filteredNASDAQData.map((item) => {
//               return item.payload.tickerSymbol;
//             })
//           : myStore?.NASDAQData?.length,
//     },
//     {
//       type: "OTCBB",
//       value:
//         myStore?.filteredOTCBBData?.length !== 0
//           ? myStore?.filteredOTCBBData?.length
//           : myStore?.OTCBBData?.length,
//       ticker: tickerSymbols1,
//     },
//     {
//       type: "NYSE",
//       value:
//         myStore?.filteredNYSEData?.length !== 0
//           ? myStore?.filteredNYSEData?.length
//           : myStore?.NYSEData?.length,
//       ticker: tickerSymbols2,
//     },
//   ];

//   const handleChange = async (value) => {
//     setIsLoading(false);
//     // Filter data based on the selected number of days
//     const currentDate = moment();
//     const filterDate = currentDate.subtract(value, "days");

//     const filteredData = myStore?.NASDAQData?.filter((item) => {
//       const itemDate = moment(
//         item.payload.dateTimeIssued,
//         "MMM DD, YYYY, HH:mm A"
//       );
//       return itemDate.isSameOrAfter(filterDate, "day");
//     });

//     const filteredData1 = myStore?.OTCBBData?.filter((item) => {
//       const itemDate = moment(
//         item.payload.dateTimeIssued,
//         "MMM DD, YYYY, HH:mm A"
//       );
//       return itemDate.isSameOrAfter(filterDate, "day");
//     });

//     const filteredData2 = myStore?.NYSEData?.filter((item) => {
//       const itemDate = moment(
//         item.payload.dateTimeIssued,
//         "MMM DD, YYYY, HH:mm A"
//       );
//       return itemDate.isSameOrAfter(filterDate, "day");
//     });

//     myStore?.setFilteredNASDAQ(filteredData);
//     myStore?.setFilteredOTCBB(filteredData1);
//     myStore?.setFilteredNYSE(filteredData2);
//   };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const dataPoint = payload[0];
//       console.log(dataPoint);
//       return (
//         <div className="custom-tooltip">
//           <div className="mb-0">
//             <span>
//               <Paragraph className="fw-bold" style={{ fontSize: 14 }}>
//                 Ticker Issued:{" "}
//                 <Text className="fw-normal" style={{ fontSize: 14 }}>
//                   {label}
//                 </Text>
//               </Paragraph>
//             </span>

//             <span>
//               <Paragraph className="fw-bold">
//                 Total Releases:{" "}
//                 <Text className="fw-normal">{dataPoint.value}</Text>
//               </Paragraph>
//             </span>
//           </div>

//           {/* <div className="mt-0">
//             <ul className="d-inline">
//               {dataPoint.payload.ticker.map((items) => (
//                 <li>{items}</li>
//               ))}
//             </ul>
//           </div> */}
//           <div className="mt-0 tooltip-scrollable">
//   <ul className="ticker-list">
//     {dataPoint.payload.ticker.map((items, index) => (
//       <li key={index}>{items}</li>
//     ))}
//   </ul>
// </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomXAxisTick = ({ x, y, payload }) => {
//     const lines = payload.value.split("\n");
//     return (
//       <g transform={`translate(${x},${y})`}>
//         {lines.map((line, index) => (
//           <text
//             key={index}
//             x={0}
//             y={index * 12}
//             dy={16}
//             textAnchor="middle"
//             fill="#666"
//           >
//             {line}
//           </text>
//         ))}
//       </g>
//     );
//   };

//   return (
//     <div>
//       <Card
//         title="Issued by Ticker"
//         bordered={false}
//         className="mb-3"
//         extra={
//           !isLoading ? (
//             <Select
//               // defaultValue="lucy"
//               placeholder="Days"
//               style={{
//                 width: 100,
//               }}
//               onChange={handleChange}
//               options={[
//                 {
//                   value: 5,
//                   label: "5 Days",
//                 },
//                 {
//                   value: 15,
//                   label: "15 Days",
//                 },
//                 {
//                   value: 30,
//                   label: "30 Days",
//                 },
//               ]}
//             />
//           ) : (
//             ""
//           )
//         }
//       >
//         {isLoading ? (
//           <div className="text-center">
//             <Spin />
//           </div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%" aspect={1}>
//             <BarChart
//               data={ColumnData}
//               // height={250}
//               margin={{ top: 5, right: 10, bottom: 20, left: -20 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis
//                 dataKey="type"
//                 tick={<CustomXAxisTick />}
//                 fontSize="small"
//               />
//               <YAxis />
//               <Tooltip content={<CustomTooltip />} />
//               {/* <Legend /> */}
//               <Bar dataKey="value" fill={brandColor} />
//             </BarChart>
//           </ResponsiveContainer>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default MostFrequentlyIssuedByTicker;

import React, { useState, useEffect } from "react";
import { Table, Card, Select, Spin, Typography, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTicker = () => {
  const { Paragraph, Text } = Typography;
  const queryKey = "businessWireData";
  const brandColor = "#5B8FF9";
  const myStore = UseNewsStore();
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (myStore.NASDAQData.length > 0) {
      setIsLoading(false);
    }
  }, [myStore.NASDAQData, setIsLoading, isLoading]);

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

  // const test = Object.entries(separatedData).map(([firmName, firmData]) => {
  //   return [...firmData];
  // })

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
      title: "Tickers",
      dataIndex: "tickers",
      key: "tickers",
      render: (_, { tickers }) => (
        <div>
          {console.log(tickers)}
          {tickers.map((ticker, index) => (
            <span key={index}>{ticker.tickerSymbol}</span>
          ))}
        </div>
      ),
    },
    {
      title: "Ticker count",
      dataIndex: "tickerCount",
      key: "tickerCount",
      render: (_, { tickerCount }) => (
        <div>
          {tickerCount.map((count, index) => (
            <span key={index}>{count.count}</span>
          ))}
        </div>
      ),
    },
    // {
    //   title: "Tickers",
    //   dataIndex: "tickers",
    //   key: "tickers",
    //   render: (_, { tickers }) => (
    //     <>
    //       {tickers.map((item, index) => (
    //         <Tag key={index} color={getTagColor(item)}>
    //           {item}
    //         </Tag>
    //       ))}
    //     </>
    //   ),
    // },
  ];

  function getTagColor(ticker) {
    // You can implement your logic to assign different colors based on tickers
    // For example, you can use a switch statement, if-else conditions, or a mapping function
    // Here's a simple example using random colors for demonstration purposes:
    const colors = ["red", "blue", "green", "orange", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
  }

  // const data = Object.keys(separatedData).map((firmName) => ({
  //   key: firmName,
  //   firmName,
  //   totalReleases: myStore.allNewsData[firmName]?.length || 0,
  // }));

  // const data = Object.entries(separatedData).map(
  //   ([firmName, firmData], index) => {
  //     // const totalReleases = firmData === undefined
  //     //   ? myStore.filteredData[firmName]?.length || 0
  //     //   : firmData.length || 0;

  //     const totalReleases =
  //       myStore.filteredData[firmName] !== undefined
  //         ? myStore.filteredData[firmName]?.length
  //         : firmData.length;

  //     const filteredfirmData = firmData.slice(0);
  //     const filteredTickerData =
  //       myStore.filteredData[firmName] !== undefined
  //         ? myStore.filteredData[firmName].map((item) => item.tickerSymbol)
  //         : filteredfirmData.map((items) => items.tickerSymbol);
  //     // console.log(myStore.filteredData[firmName].map((item) => item.tickerSymbol));
  //     // console.log("Store Data: ",myStore.filteredData[firmName]);
  //     return {
  //       serial: index,
  //       key: firmName,
  //       firmName,
  //       totalReleases,
  //       tickers: filteredTickerData,
  //     };
  //   }
  // );

  const data = myStore?.allTickers?.map((item, index) => {
    // Calculate ticker counts
    const tickerCounts = myStore?.allTickers?.reduce((countMap, tickerItem) => {
      const { tickerSymbol } = tickerItem;
      countMap[tickerSymbol] = (countMap[tickerSymbol] || 0) + 1;
      return countMap;
    }, {});
  
    // Output the results
    // console.log(tickerCounts);
  
    // Convert the counts into an array of objects
    const tickerCountsArray = Object.keys(tickerCounts).map(tickerSymbol => ({
      tickerSymbol,
      count: tickerCounts[tickerSymbol],
    }));

    // console.log(tickerCountsArray);
  
    // Return the result for each item
    return {
      serial: index,
      tickers: tickerCountsArray,
      tickerCount: tickerCountsArray,
      // Add other properties from the 'item' object if needed
    };
  });

  const filteredData = data.slice(1);

  // console.log('DATA', filteredData);

  return (
    <div>
      <Card
        title="Issued by Ticker"
        bordered={false}
        className="mb-3"
        extra={
          // !isLoading ? (
          <Select
            placeholder="Days"
            style={{
              width: 100,
            }}
            onChange={handleChange}
            options={[
              {
                value: 5,
                label: "5 Days",
              },
              {
                value: 15,
                label: "15 Days",
              },
              {
                value: 30,
                label: "30 Days",
              },
            ]}
          />
          // ) : (
          // ""
          // )
        }
      >
        {/* {isLoading ? (
          <div className="text-center">
            <Spin />
          </div>
        ) : ( */}
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          bordered
        />
        {/* )} */}
      </Card>
    </div>
  );
};

export default MostFrequentlyIssuedByTicker;
