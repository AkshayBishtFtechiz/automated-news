import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  TableSortLabel,
  Box,
} from "@mui/material";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTicker = () => {
  const myStore = UseNewsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("tickers");
  const [order, setOrder] = useState("asc");
  var sequentialData = [];

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
      tickerCounts[tickerSymbol] = tickerCounts[tickerSymbol] || {
        count: 0,
        dates: [],
      };
      tickerCounts[tickerSymbol].count += 1;
      tickerCounts[tickerSymbol].dates.push(dateTimeIssued);
    });

    return Object.entries(tickerCounts).map(
      ([tickerSymbol, { count, dates }], index) => ({
        serial: index + 1,
        dateTimeIssued: dates.sort().pop(),
        tickers: tickerSymbol,
        tickerCount: count,
      })
    );
  };

  // NEW CODE

  if (myStore.businessWireData && myStore.businessWireData.data) {
    sequentialData.push(...myStore.businessWireData.data);
  }

  if (myStore.prNewsWireData && myStore.prNewsWireData.data) {
    sequentialData.push(...myStore.prNewsWireData.data);
  }

  if (myStore.newsFileData && myStore.newsFileData.data) {
    sequentialData.push(...myStore.newsFileData.data);
  }

  if (myStore.globeNewsWireData && myStore.globeNewsWireData.data) {
    sequentialData.push(...myStore.globeNewsWireData.data);
  }

  if (myStore.accessWireData && myStore.accessWireData.data) {
    sequentialData.push(...myStore.accessWireData.data);
  }

  const arr = sequentialData
    .map((items) => items?.payload)
    .sort((a, b) => a.tickerSymbol.localeCompare(b.tickerSymbol));

  useEffect(() => {
    if (myStore.allTickers.length > 0) {
      setIsLoading(false);
    }
  }, [myStore.allTickers, setIsLoading, isLoading]);

  const handleChange = async (value) => {
    const dynamicDuration = parseInt(value);

    // Step 1: Filter data by days
    const filteredData = filterDataByDays(arr, dynamicDuration);

    // Step 2: Count occurrences of each ticker in the filtered data
    const tickerCountsArray = countTickerOccurrences(filteredData);

    // Step 3: Update the filtered data in the store
    myStore.setTickerFilteredData(tickerCountsArray);

    // Reset pagination to the first page when changing filters
    setPage(0);
  };

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const createSortHandler = (columnId) => () => {
    handleSort(columnId);
  };

  const columns = [
    {
      id: "serial",
      label: "Serial No.",
    },
    {
      id: "dateTimeIssued",
      label: "Date",
    },
    {
      id: "tickers",
      label: "Tickers",
    },
    {
      id: "tickerCount",
      label: "Ticker count",
    },
  ];

  const data = arr || [];
  // Create an object to store the occurrence count of each ticker symbol
  const tickerCounts = {};

  data.forEach((tickerObj) => {
    const { tickerSymbol, dateTimeIssued } = tickerObj;
    tickerCounts[tickerSymbol] = tickerCounts[tickerSymbol] || {
      count: 0,
      dates: [],
    };
    tickerCounts[tickerSymbol].count += 1;
    tickerCounts[tickerSymbol].dates.push(dateTimeIssued);
  });

  // Convert the counts into an array of objects
  const tickerCountsArray = Object.entries(tickerCounts).map(
    ([tickerSymbol, { count, dates }], index) => ({
      serial: index + 1,
      dateTimeIssued: dates.sort().pop(),
      tickers: tickerSymbol,
      tickerCount: count,
    })
  );

  // Sort the data based on the current sorting order and column
  const sortedTickerCountsArray = tickerCountsArray.slice().sort((a, b) => {
    const isAsc = order === "asc";
    const valueA = String(a[orderBy]);
    const valueB = String(b[orderBy]);
    return isAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  const createData = (item) => {
    return {
      serial: item.serial,
      dateTimeIssued: item.dateTimeIssued,
      tickers: item.tickers,
      tickerCount: item.tickerCount,
    };
  };

  const rows =
    myStore?.filteredTickerData?.length === 0
      ? sortedTickerCountsArray.map((item) => createData(item))
      : myStore?.filteredTickerData.map((item) => createData(item));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <Card title="Issued by Ticker" variant="outlined" sx={{ mb: 3 }}>
        <CardHeader
          title={
            <p
              style={{
                fontFamily: "Inter",
                fontSize: "medium",
                fontWeight: "bold",
              }}
            >
              {"Issued by Ticker"}
            </p>
          }
          action={
            !isLoading ? (
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="most-frequent-issue-by-ticker-select-small-label">
                  Days
                </InputLabel>
                <Select
                  labelId="most-frequent-issue-by-ticker-select-small-label"
                  id="most-frequent-issue-by-ticker-select-small"
                  label="Days"
                  onChange={(e) => handleChange(e.target.value)}
                  sx={{ fontSize: "medium" }}
                  defaultValue={""}
                >
                  <MenuItem value="5">5 Days</MenuItem>
                  <MenuItem value="15">15 Days</MenuItem>
                  <MenuItem value="30">30 Days</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Box>
                {rows.length > 1 && (
                  <CircularProgress
                    sx={{
                      width: "24px !important",
                      height: "24px !important",
                      padding: "15px 15px !important",
                    }}
                  />
                )}
              </Box>
            )
          }
        />

        {rows.length < 1 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress sx={{ marginBottom: 10 }} />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ borderTop: "1px solid #e0e0e0" }}>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} style={{ fontWeight: "bold" }}>
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={createSortHandler(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.serial}>
                      {columns.map((column) => (
                        <TableCell key={column.id}>{row[column.id]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              sx={{ marginBottom: "0px !important" }}
              rowsPerPageOptions={[5, 10, 25, { label: "All", value: rows.length}]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Card>
    </div>
  );
};

export default MostFrequentlyIssuedByTicker;
