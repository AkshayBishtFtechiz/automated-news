import React, { useState, useEffect } from "react";
import { Table, Card, Select, Spin, Tag } from "antd";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTickerandFirm = () => {
  const myStore = UseNewsStore();
  const [isLoading, setIsLoading] = useState(true);

  const filterDataByDays = (data, days) => {
    const currentDate = moment();
    return data.filter((item) => {
      const issuedDate = moment(item.dateTimeIssued, "MMMM DD, YYYY");
      const differenceInDays = currentDate.diff(issuedDate, "days");
      return differenceInDays <= days;
    });
  };

  useEffect(() => {
    if (myStore.allNewsData.length > 0) {
      setIsLoading(false);
    }
  }, [myStore.allNewsData, setIsLoading, isLoading]);

  const handleChange = async (value) => {
    const dynamicDuration = parseInt(value);

    // Step 1: Filter data by days
    const filteredData = await filterDataByDays(
      resultWithSerial,
      dynamicDuration
    );

    filteredData.forEach((item, index) => {
      item.serial = index + 1;
    });

    // Step 2: Updating State
    myStore.setFilteredDataTandF(filteredData);
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      key: "serial",
    },
    {
      title: "Date",
      dataIndex: "dateTimeIssued",
      key: "dateTimeIssued",
    },
    {
      title: "Tickers",
      dataIndex: "tickers",
      key: "tickers",
      defaultSortOrder: "ascend",
    },
    {
      title: "Ticker count",
      dataIndex: "tickerCount",
      key: "tickerCount",
    },
    {
      title: "Firm",
      dataIndex: "firm",
      key: "firm",

      render: (_, { firms }) => (
        <>
          {firms.map((item, index) => (
            <Tag key={index} color={getTagColor(item)}>
              {item}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Firm Count",
      dataIndex: "firmCount",
      key: "firmCount",
    },
  ];

  function getTagColor(ticker) {
    const colors = ["red", "blue", "green", "orange", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
  }

  // Create an object to store the occurrence count of each ticker symbol
  const tickerCounts = {};
  const firmsByTicker = {}; // Use an object to store firms by ticker symbol

  // Count occurrences of each ticker symbol and store firms
  myStore.allNewsData.forEach((tickerObj) => {
    const { tickerSymbol } = tickerObj.payload;
    const { firm } = tickerObj;
    firmsByTicker[tickerSymbol] = firmsByTicker[tickerSymbol] || [];
    firmsByTicker[tickerSymbol].push(firm);

    // You can still count occurrences if needed
    tickerCounts[tickerSymbol] = (tickerCounts[tickerSymbol] || 0) + 1;
  });

  // Convert the counts into an array of objects for tickers (if needed)
  const tickerCountsArray = Object.keys(tickerCounts).map((tickerSymbol) => {
    const dateTimeIssuedArray = myStore.allNewsData
      .filter((tickerObj) => tickerObj.payload.tickerSymbol === tickerSymbol)
      .map((tickerObj) =>
        moment(tickerObj.payload.dateTimeIssued, "MMMM DD, YYYY").valueOf()
      );

    return {
      tickers: tickerSymbol,
      tickerCount: tickerCounts[tickerSymbol],
      firms: [...new Set(firmsByTicker[tickerSymbol])], // Include the list of firms
      firmCount: firmsByTicker[tickerSymbol].length,
      dateTimeIssued: moment(Math.max(...dateTimeIssuedArray)).format(
        "MMMM DD, YYYY"
      ),
    };
  });

  // Sort the ticker data in ascending order based on the "Tickers" column
  const sortedTickerCountsArray = tickerCountsArray.slice().sort((a, b) => {
    return a.tickers.localeCompare(b.tickers);
  });

  // Add serial numbers based on the sorted order
  const resultWithSerial = sortedTickerCountsArray.map((item, index) => ({
    serial: index + 1,
    ...item,
  }));

  return (
    <div>
      <Card
        title="Issued by Ticker and Firm"
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
            dataSource={
              myStore?.filteredDataofTandF?.length === 0
                ? resultWithSerial
                : myStore?.filteredDataofTandF
            }
            sortDirections={["ascend"]}
            pagination={{ defaultPageSize: 5 }}
            bordered
          />
        )}
      </Card>
    </div>
  );
};

export default MostFrequentlyIssuedByTickerandFirm;
