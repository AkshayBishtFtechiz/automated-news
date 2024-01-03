import React, { useEffect, useState } from "react";
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
import { Typography, Spin } from "antd";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTicker = () => {
  const { Paragraph, Text } = Typography;
  const [isLoading, setIsLoading] = useState(true);
  // const paletteSemanticRed = "#F4664A";
  const brandColor = "#5B8FF9";

  const myStore = UseNewsStore();

  useEffect(() => {
    if (myStore.NASDAQData.length > 0) {
      setIsLoading(false);
    }
  }, [myStore.NASDAQData, setIsLoading, isLoading]);

  const ColumnData = [
    {
      type: "NASDAQ",
      value:
        myStore?.filteredNASDAQData?.length !== 0
          ? myStore?.filteredNASDAQData?.length
          : myStore?.NASDAQData?.length,
    },
    {
      type: "OTCBB",
      value:
        myStore?.filteredOTCBBData?.length !== 0
          ? myStore?.filteredOTCBBData?.length
          : myStore?.OTCBBData?.length,
    },
    {
      type: "NYSE",
      value:
        myStore?.filteredNYSEData?.length !== 0
          ? myStore?.filteredNYSEData?.length
          : myStore?.NYSEData?.length,
    },
  ];

  const handleChange = async (value) => {
    setIsLoading(false);
    // Filter data based on the selected number of days
    const currentDate = moment();
    const filterDate = currentDate.subtract(value, "days");

    const filteredData = myStore?.NASDAQData?.filter((item) => {
      const itemDate = moment(
        item.payload.dateTimeIssued,
        "MMM DD, YYYY, HH:mm A"
      );
      return itemDate.isSameOrAfter(filterDate, "day");
    });

    const filteredData1 = myStore?.OTCBBData?.filter((item) => {
      const itemDate = moment(
        item.payload.dateTimeIssued,
        "MMM DD, YYYY, HH:mm A"
      );
      return itemDate.isSameOrAfter(filterDate, "day");
    });

    const filteredData2 = myStore?.NYSEData?.filter((item) => {
      const itemDate = moment(
        item.payload.dateTimeIssued,
        "MMM DD, YYYY, HH:mm A"
      );
      return itemDate.isSameOrAfter(filterDate, "day");
    });

    myStore?.setFilteredNASDAQ(filteredData);
    myStore?.setFilteredOTCBB(filteredData1);
    myStore?.setFilteredNYSE(filteredData2);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="custom-tooltip">
          <div className="mb-0">
            <span>
              <Paragraph className="fw-bold" style={{ fontSize: 14 }}>
                Ticker Issued:{" "}
                <Text className="fw-normal" style={{ fontSize: 14 }}>
                  {label}
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
        title="Issued by Ticker"
        bordered={false}
        className="mb-3"
        extra={
          !isLoading ? (
            <Select
              // defaultValue="lucy"
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
          <ResponsiveContainer width="100%" height="100%" aspect={1}>
            <BarChart
              data={ColumnData}
              // height={250}
              margin={{ top: 5, right: 10, bottom: 20, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                tick={<CustomXAxisTick />}
                fontSize="small"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {/* <Legend /> */}
              <Bar dataKey="value" fill={brandColor} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default MostFrequentlyIssuedByTicker;
