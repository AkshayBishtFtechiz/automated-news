import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card } from "antd";
import { Select } from "antd";
import { Typography, Spin } from "antd";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTickerandFirm = () => {
  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };
  const { Paragraph, Text } = Typography;
  const [isLoading, setIsLoading] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions);
  const brandColor1 = "#5B8FF9";

  const myStore = UseNewsStore();

  useEffect(() => {
    if (myStore.NASDAQData.length > 0) {
      setIsLoading(false);
    }
  }, [myStore.NASDAQData, setIsLoading, isLoading]);

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

  const filterDataByDays = (separatedData, days) => {
    const currentDate = moment();

    const filteredData = {};

    Object.keys(separatedData).forEach((firmName) => {
      filteredData[firmName] = {
        firmLength: 0, // Initialize firm length
      };

      Object.keys(separatedData[firmName]).forEach((tickerSymbol) => {
        if (tickerSymbol !== "firmLength") {
          const filteredPayloads = separatedData[firmName][tickerSymbol].filter(
            (payload) => {
              const issuedDate = moment(
                payload.dateTimeIssued,
                "MMMM DD, YYYY"
              );
              const differenceInDays = currentDate.diff(issuedDate, "days");

              return differenceInDays <= days;
            }
          );

          // Update firmLength based on the total length of payloads
          filteredData[firmName][tickerSymbol] = filteredPayloads;
          filteredData[firmName].firmLength += filteredPayloads.length;
        }
      });
    });

    return filteredData;
  };

  const handleChange = async (value) => {
    const dynamicDuration = parseInt(value);

    const filteredByDays = filterDataByDays(separatedData, dynamicDuration);

    myStore.setFilteredDataTandF(filteredByDays);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="custom-tooltip">
          <div className="mb-0">
            <span>
              <Paragraph className="fw-bold" style={{ fontSize: 14 }}>
                Firm Issued:{" "}
                <Text className="fw-normal" style={{ fontSize: 14 }}>
                  {label}
                </Text>
              </Paragraph>
            </span>
          </div>
          <div className="mt-0">
            <span>
              <Paragraph className="fw-bold">
                Total Tickers:{" "}
                <Text className="fw-normal">
                  {dataPoint.payload.firm_value}
                </Text>
              </Paragraph>
            </span>

            <span>
              <Paragraph className="fw-bold">
                NASDAQ:{" "}
                <Text className="fw-normal">{dataPoint.payload.nasdaq}</Text>
              </Paragraph>
            </span>

            <span>
              <Paragraph className="fw-bold">
                NYSE:{" "}
                <Text className="fw-normal">{dataPoint.payload.nyse}</Text>
              </Paragraph>
            </span>

            <span>
              <Paragraph className="fw-bold">
                OTCBB:{" "}
                <Text className="fw-normal">{dataPoint.payload.otcbb}</Text>
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

  const separateFirmTypes = (data) => {
    const firmData = {};

    data.forEach((entry) => {
      const firmName = entry.firm;
      const tickerSymbol = entry.payload.tickerSymbol;

      // Using firmName as the first level key
      if (!firmData[firmName]) {
        firmData[firmName] = {
          [tickerSymbol]: [],
          firmLength: 0, // Initialize firm length
        };
      }

      // Using tickerSymbol as the second level key
      if (!firmData[firmName][tickerSymbol]) {
        firmData[firmName][tickerSymbol] = [];
      }

      // Pushing the payload to the corresponding array
      firmData[firmName][tickerSymbol].push(entry.payload);
      firmData[firmName].firmLength += 1; // Increment firm length
    });

    // Update firmLength to be the total length of payloads across all ticker symbols
    Object.keys(firmData).forEach((firmName) => {
      let totalLength = 0;
      Object.keys(firmData[firmName]).forEach((tickerSymbol) => {
        if (tickerSymbol !== "firmLength") {
          totalLength += firmData[firmName][tickerSymbol].length;
        }
      });
      firmData[firmName].firmLength = totalLength;
    });

    return firmData;
  };

  const separatedData = separateFirmTypes(myStore.allNewsData);

  const ColumnData = [
    {
      type: "Berger\nMontague",
      firm_value:
        myStore.filteredDataofTandF["Berger Montague"] === undefined
          ? separatedData["Berger Montague"]?.firmLength
          : myStore.filteredDataofTandF["Berger Montague"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Berger Montague"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Berger Montague"]?.NASDAQ?.length
          : separatedData["Berger Montague"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Berger Montague"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Berger Montague"]?.NYSE?.length
          : separatedData["Berger Montague"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Berger Montague"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Berger Montague"]?.OTCBB?.length
          : separatedData["Berger Montague"]?.OTCBB?.length || 0,
    },
    {
      type: "Bernstein\nLiebhard",
      firm_value:
        myStore.filteredDataofTandF["Bernstein Liebhard"] === undefined
          ? separatedData["Bernstein Liebhard"]?.firmLength
          : myStore.filteredDataofTandF["Bernstein Liebhard"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Bernstein Liebhard"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Bernstein Liebhard"]?.NASDAQ?.length
          : separatedData["Bernstein Liebhard"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Bernstein Liebhard"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Bernstein Liebhard"]?.NYSE?.length
          : separatedData["Bernstein Liebhard"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Bernstein Liebhard"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Bernstein Liebhard"]?.OTCBB?.length
          : separatedData["Bernstein Liebhard"]?.OTCBB?.length || 0,
    },
    {
      type: "Bronstein,\nGewirtz",
      firm_value:
        myStore.filteredDataofTandF["Bronstein, Gewirtz"] === undefined
          ? separatedData["Bronstein, Gewirtz"]?.firmLength
          : myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.NASDAQ?.length
          : separatedData["Bronstein, Gewirtz"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.NYSE?.length
          : separatedData["Bronstein, Gewirtz"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Bronstein, Gewirtz"]?.OTCBB?.length
          : separatedData["Bronstein, Gewirtz"]?.OTCBB?.length || 0,
    },
    {
      type: "Faruqi\n&\nFaruqi",
      firm_value:
        myStore.filteredDataofTandF["Faruqi & Faruqi"] === undefined
          ? separatedData["Faruqi & Faruqi"]?.firmLength
          : myStore.filteredDataofTandF["Faruqi & Faruqi"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Faruqi & Faruqi"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Faruqi & Faruqi"]?.NASDAQ?.length
          : separatedData["Faruqi & Faruqi"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Faruqi & Faruqi"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Faruqi & Faruqi"]?.NYSE?.length
          : separatedData["Faruqi & Faruqi"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Faruqi & Faruqi"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Faruqi & Faruqi"]?.OTCBB?.length
          : separatedData["Faruqi & Faruqi"]?.OTCBB?.length || 0,
    },
    {
      type: "Glancy",
      firm_value:
        myStore.filteredDataofTandF["Glancy"] === undefined
          ? separatedData["Glancy"]?.firmLength
          : myStore.filteredDataofTandF["Glancy"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Glancy"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Glancy"]?.NASDAQ?.length
          : separatedData["Glancy"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Glancy"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Glancy"]?.NYSE?.length
          : separatedData["Glancy"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Glancy"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Glancy"]?.OTCBB?.length
          : separatedData["Glancy"]?.OTCBB?.length || 0,
    },
    {
      type: "Grabar\nLaw\nOffice",
      firm_value:
        myStore.filteredDataofTandF["Graber"] === undefined
          ? separatedData["Graber"]?.firmLength
          : myStore.filteredDataofTandF["Graber"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Graber"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Graber"]?.NASDAQ?.length
          : separatedData["Graber"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Graber"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Graber"]?.NYSE?.length
          : separatedData["Graber"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Graber"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Graber"]?.OTCBB?.length
          : separatedData["Graber"]?.OTCBB?.length || 0,
    },
    {
      type: "Hagens\n Berman \n Sobol\n Shapiro",
      firm_value:
        myStore.filteredDataofTandF["Hagens Berman"] === undefined
          ? separatedData["Hagens Berman"]?.firmLength
          : myStore.filteredDataofTandF["Hagens Berman"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Hagens Berman"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Hagens Berman"]?.NASDAQ?.length
          : separatedData["Hagens Berman"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Hagens Berman"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Hagens Berman"]?.NYSE?.length
          : separatedData["Hagens Berman"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Hagens Berman"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Hagens Berman"]?.OTCBB?.length
          : separatedData["Hagens Berman"]?.OTCBB?.length || 0,
    },
    {
      type: "Kessler\nTopaz \nMeltzer \n&Check",
      firm_value:
        myStore.filteredDataofTandF["Kessler Topaz"] === undefined
          ? separatedData["Kessler Topaz"]?.firmLength
          : myStore.filteredDataofTandF["Kessler Topaz"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Kessler Topaz"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Kessler Topaz"]?.NASDAQ?.length
          : separatedData["Kessler Topaz"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Kessler Topaz"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Kessler Topaz"]?.NYSE?.length
          : separatedData["Kessler Topaz"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Kessler Topaz"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Kessler Topaz"]?.OTCBB?.length
          : separatedData["Kessler Topaz"]?.OTCBB?.length || 0,
    },
    {
      type: "Pomerantz \nLLP",
      firm_value:
        myStore.filteredDataofTandF["Pomerantz"] === undefined
          ? separatedData["Pomerantz"]?.firmLength
          : myStore.filteredDataofTandF["Pomerantz"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Pomerantz"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Pomerantz"]?.NASDAQ?.length
          : separatedData["Pomerantz"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Pomerantz"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Pomerantz"]?.NYSE?.length
          : separatedData["Pomerantz"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Pomerantz"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Pomerantz"]?.OTCBB?.length
          : separatedData["Pomerantz"]?.OTCBB?.length || 0,
    },
    {
      type: "Rigrodsky\n Law",
      firm_value:
        myStore.filteredDataofTandF["Rigrodsky"] === undefined
          ? separatedData["Rigrodsky"]?.firmLength
          : myStore.filteredDataofTandF["Rigrodsky"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Rigrodsky"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Rigrodsky"]?.NASDAQ?.length
          : separatedData["Rigrodsky"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Rigrodsky"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Rigrodsky"]?.NYSE?.length
          : separatedData["Rigrodsky"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Rigrodsky"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Rigrodsky"]?.OTCBB?.length
          : separatedData["Rigrodsky"]?.OTCBB?.length || 0,
    },
    {
      type: "Schall\nLaw\n Firm",
      firm_value:
        myStore.filteredDataofTandF["Schall"] === undefined
          ? separatedData["Schall"]?.firmLength
          : myStore.filteredDataofTandF["Schall"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Schall"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Schall"]?.NASDAQ?.length
          : separatedData["Schall"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Schall"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Schall"]?.NYSE?.length
          : separatedData["Schall"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Schall"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Schall"]?.OTCBB?.length
          : separatedData["Schall"]?.OTCBB?.length || 0,
    },
    {
      type: "Rosen",
      firm_value:
        myStore.filteredDataofTandF["Rosen"] === undefined
          ? separatedData["Rosen"]?.firmLength
          : myStore.filteredDataofTandF["Rosen"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Rosen"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Rosen"]?.NASDAQ?.length
          : separatedData["Rosen"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Rosen"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Rosen"]?.NYSE?.length
          : separatedData["Rosen"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Rosen"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Rosen"]?.OTCBB?.length
          : separatedData["Rosen"]?.OTCBB?.length || 0,
    },
    {
      type: "Levi\n&\nKorsinsky",
      firm_value:
        myStore.filteredDataofTandF["Levi & Korsinsky"] === undefined
          ? separatedData["Levi & Korsinsky"]?.firmLength
          : myStore.filteredDataofTandF["Levi & Korsinsky"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Levi & Korsinsky"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Levi & Korsinsky"]?.NASDAQ?.length
          : separatedData["Levi & Korsinsky"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Levi & Korsinsky"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Levi & Korsinsky"]?.NYSE?.length
          : separatedData["Levi & Korsinsky"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Levi & Korsinsky"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Levi & Korsinsky"]?.OTCBB?.length
          : separatedData["Levi & Korsinsky"]?.OTCBB?.length || 0,
    },
    {
      type: "Kaskela\n Law",
      firm_value:
        myStore.filteredDataofTandF["Kaskela"] === undefined
          ? separatedData["Kaskela"]?.firmLength
          : myStore.filteredDataofTandF["Kaskela"]?.firmLength,
      nasdaq:
        myStore.filteredDataofTandF["Kaskela"]?.NASDAQ !== undefined
          ? myStore.filteredDataofTandF["Kaskela"]?.NASDAQ?.length
          : separatedData["Kaskela"]?.NASDAQ?.length || 0,
      nyse:
        myStore.filteredDataofTandF["Kaskela"]?.NYSE !== undefined
          ? myStore.filteredDataofTandF["Kaskela"]?.NYSE?.length
          : separatedData["Kaskela"]?.NYSE?.length || 0,
      otcbb:
        myStore.filteredDataofTandF["Kaskela"]?.OTCBB !== undefined
          ? myStore.filteredDataofTandF["Kaskela"]?.OTCBB?.length
          : separatedData["Kaskela"]?.OTCBB?.length || 0,
    },
  ];

  return (
    <div>
      <Card
        title="Issued by Ticker & Firm"
        bordered={false}
        className="mb-3"
        extra={
          !isLoading ? (
            <Select
              placeholder="Days"
              style={{
                width: 120,
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
              // height={100}
              margin={{ top: 5, right: 30, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                tick={<CustomXAxisTick />}
                fontSize="small"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="firm_value" fill={brandColor1} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default MostFrequentlyIssuedByTickerandFirm;
