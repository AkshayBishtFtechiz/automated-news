import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "antd";
import { Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Typography, Spin } from "antd";
import { UseNewsStore } from "../store";
import moment from "moment";

const ReleasesIssuedByFirm = () => {
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  const { Paragraph, Text } = Typography;
  const queryKey = "businessWireData";
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions);
  // const paletteSemanticRed = "#F4664A";
  const brandColor = "#5B8FF9";
  const nyseNews = [];
  const nasdaqNews = [];
  const otcbbNews = [];

  const myStore = UseNewsStore();

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchBusinessWireData = async () => {
    const response = await axios.get("http://localhost:5000/business-wire");
    const response1 = await axios.get("http://localhost:5000/pr-news-wire");
    const response2 = await axios.get("http://localhost:5000/news-files");
    const response3 = await axios.get("http://localhost:5000/globe-news-wire");

    const allNewsData = [
      ...response.data,
      ...response1.data,
      ...response2.data,
      ...response3.data,
    ];

    if (allNewsData.length > 0) {
      allNewsData?.map((items) => {
        const tickerSymbol = items?.payload?.tickerSymbol;
        if (tickerSymbol === "NYSE") {
          nyseNews.push(items);
          myStore.setNYSEData(nyseNews);
        } else if (tickerSymbol === "NASDAQ") {
          nasdaqNews.push(items);
          myStore.setNASDAQData(nasdaqNews);
        } else if (tickerSymbol === "OTCBB") {
          otcbbNews.push(items);
          myStore.setOTCBBData(otcbbNews);
        }
        return null;
      });
    }
    myStore.setAllNewsData(allNewsData);
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

  const ColumnData = [
    {
      type: "Berger\nMontague",
      value:
        myStore.filteredData["Berger Montague"] === undefined
          ? separatedData["Berger Montague"]?.length
          : myStore.filteredData["Berger Montague"].length,
      label: separatedData.firms[10],
    },
    {
      type: "Bern-\nstein\nLieb-\nhard",
      value:
        myStore.filteredData["Bernstein Liebhard"] === undefined
          ? separatedData["Bernstein Liebhard"]?.length
          : myStore.filteredData["Bernstein Liebhard"].length,
      label: separatedData.firms[0],
    },
    {
      type: "Bronstein,\nGewirtz",
      value:
        myStore.filteredData["Bronstein, Gewirtz"] === undefined
          ? separatedData["Bronstein, Gewirtz"]?.length
          : myStore.filteredData["Bronstein, Gewirtz"].length,
      label: separatedData.firms[1],
    },
    {
      type: "Faruqi\n&\nFaruqi",
      value:
        myStore.filteredData["Faruqi & Faruqi"] === undefined
          ? separatedData["Faruqi & Faruqi"]?.length
          : myStore.filteredData["Faruqi & Faruqi"].length,
      label: separatedData.firms[2],
    },
    {
      type: "Grabar\nLaw\nOffice",
      value:
        myStore.filteredData["Grabar"] === undefined
          ? separatedData["Grabar"]?.length
          : myStore.filteredData["Grabar"].length,
      label: separatedData.firms[3],
    },
    {
      type: "Glancy",
      value:
        myStore.filteredData["Glancy"] === undefined
          ? separatedData["Glancy"]?.length
          : myStore.filteredData["Glancy"].length,
      label: separatedData.firms[13],
    },
    {
      type: "Hagens\n Berman",
      value:
        myStore.filteredData["Hagens Berman"] === undefined
          ? separatedData["Hagens Berman"]?.length
          : myStore.filteredData["Hagens Berman"].length,
      label: separatedData.firms[11],
    },
    {
      type: "Kessler\nTopaz \nMeltzer\n&\nChe-\nck",
      value:
        myStore.filteredData["Kessler Topaz"] === undefined
          ? separatedData["Kessler Topaz"]?.length
          : myStore.filteredData["Kessler Topaz"].length,
      label: separatedData.firms[4],
    },
    {
      type: "Pome-\nrantz\nLLP",
      value:
        myStore.filteredData["Pomerantz"] === undefined
          ? separatedData["Pomerantz"]?.length
          : myStore.filteredData["Pomerantz"].length,
      label: separatedData.firms[12],
    },
    {
      type: "Rigrodsky\n Law",
      value:
        myStore.filteredData["Rigrodsky"] === undefined
          ? separatedData["Rigrodsky"]?.length
          : myStore.filteredData["Rigrodsky"].length,
      label: separatedData.firms[5],
    },
    {
      type: "Schall\nLaw\n Firm",
      value:
        myStore.filteredData["Schall"] === undefined
          ? separatedData["Schall"]?.length
          : myStore.filteredData["Schall"].length,
      label: separatedData.firms[6],
    },
    {
      type: "Rosen",
      value:
        myStore.filteredData["Rosen"] === undefined
          ? separatedData["Rosen"]?.length
          : myStore.filteredData["Rosen"].length,
      label: separatedData.firms[9],
    },
    {
      type: "Levi\n&\nKors-\ninsky",
      value:
        myStore.filteredData["Levi & Korsinsky"] === undefined
          ? separatedData["Levi & Korsinsky"]?.length
          : myStore.filteredData["Levi & Korsinsky"].length,
      label: separatedData.firms[8],
    },
    {
      type: "Kaskela\n Law",
      value:
        myStore.filteredData["Kaskela"] === undefined
          ? separatedData["Kaskela"]?.length
          : myStore.filteredData["Kaskela"].length,
      label: separatedData.firms[7],
    },
  ];

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="custom-tooltip">
          <div className="mb-0">
            <span>
              <Paragraph className="fw-bold" style={{ fontSize: 14 }}>
                Firm :{" "}
                <Text className="fw-normal" style={{ fontSize: 14 }}>
                  {dataPoint.payload.label}
                </Text>
              </Paragraph>
            </span>
          </div>
          <div className="mt-0">
            <span>
              <Paragraph className="fw-bold">
                Total Releases:{" "}
                <Text className="fw-normal">{dataPoint.value}</Text>
              </Paragraph>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    const lines = payload.value.split("\n");
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={index * 12}
            dy={16}
            textAnchor="middle"
            fill="#666"
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

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
          <ResponsiveContainer
            width="100%"
            height="100%"
            aspect={windowDimensions.width < 600 ? 1 : 3}
          >
            <BarChart
              data={ColumnData}
              margin={{ top: 0, right: 10, bottom: 20, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                tick={<CustomXAxisTick />}
                // fontSize={10}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={brandColor} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default ReleasesIssuedByFirm;
