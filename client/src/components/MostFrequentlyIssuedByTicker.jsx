import React, { useState, useEffect } from "react";
import { Table, Card, Select, Spin } from "antd";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTicker = () => {
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

  const countTickerOccurrences = (filteredData) => {
    const tickerCounts = {};
    filteredData.forEach((tickerObj) => {
      const { tickerSymbol, dateTimeIssued } = tickerObj;
      tickerCounts[tickerSymbol] = tickerCounts[tickerSymbol] || { count: 0, dates: [] };
      tickerCounts[tickerSymbol].count += 1;
      tickerCounts[tickerSymbol].dates.push(dateTimeIssued);
    });

    return Object.entries(tickerCounts).map(([tickerSymbol, {count, dates}], index) => ({
      serial: index + 1,
      dateTimeIssued: dates.sort().pop(),
      tickers: tickerSymbol,
      tickerCount: count,
    }));
  };

  useEffect(() => {
    if (myStore.allTickers.length > 0) {
      setIsLoading(false);
    }
  }, [myStore.allTickers, setIsLoading, isLoading]);

  const handleChange = async (value) => {
    const dynamicDuration = parseInt(value);

    // Step 1: Filter data by days
    const filteredData = filterDataByDays(myStore.allTickers, dynamicDuration);

    // Step 2: Update the filtered data in the store
    myStore.setTickerFilteredData(filteredData);

    // Step 3: Count occurrences of each ticker in the filtered data
    const tickerCountsArray = countTickerOccurrences(filteredData);

    // Step 4: Update the component state or store with the ticker counts array
    myStore.setTickerCounts(tickerCountsArray);
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
      sortOrder: "ascend",
    },
    {
      title: "Ticker count",
      dataIndex: "tickerCount",
      key: "tickerCount",
    },
  ];

  const data = myStore?.allTickers || [];
  // Create an object to store the occurrence count of each ticker symbol
  const tickerCounts = {};

  data.forEach((tickerObj) => {
    const { tickerSymbol, dateTimeIssued } = tickerObj;
    tickerCounts[tickerSymbol] = tickerCounts[tickerSymbol] || { count: 0, dates: [] };
    tickerCounts[tickerSymbol].count += 1;
    tickerCounts[tickerSymbol].dates.push(dateTimeIssued);
  });
  
  // Convert the counts into an array of objects
  const tickerCountsArray = Object.entries(tickerCounts).map(
    ([tickerSymbol, { count, dates }], index) => ({
      serial: index + 1,
      dateTimeIssued: dates.sort().pop(), // Get the latest dateTimeIssued
      tickers: tickerSymbol,
      tickerCount: count,
    })
  );

  // Sort the data in ascending order based on the "Tickers" column
const sortedTickerCountsArray = tickerCountsArray.slice().sort((a, b) => {
  return a.tickers.localeCompare(b.tickers);
});

  return (
    <div>
      <Card
        title="Issued by Ticker"
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
              myStore.tickerCounts.length === 0
                ? sortedTickerCountsArray
                : myStore.tickerCounts
            }
            sortDirections={["ascend"]}
            pagination={{defaultPageSize: 5}}
            bordered
          />
        )}
      </Card>
    </div>
  );
};

export default MostFrequentlyIssuedByTicker;
