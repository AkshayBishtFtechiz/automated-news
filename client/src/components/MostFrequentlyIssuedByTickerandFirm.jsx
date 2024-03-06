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
  Chip,
  TablePagination,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  TableSortLabel,
  Avatar,
  Box,
  useMediaQuery,
} from "@mui/material";
import { UseNewsStore } from "../store";
import moment from "moment";
import SearchBar from "@mkyy/mui-search-bar";

const MostFrequentlyIssuedByTickerandFirm = () => {
  const myStore = UseNewsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tickerFirmOrderBy, setTickerFirmOrderBy] = useState("tickers");
  const [tickerFirmSortDirection, setTickerFirmSortDirection] = useState("asc");
  const [searched, setSearched] = useState("");
  const [check, setCheck] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:500px)");
  var sequentialData = [];

  const filterDataByDays = (data, days) => {
    const currentDate = moment();
    return data.filter((item) => {
      const issuedDate = moment(item.dateTimeIssued, "MMMM DD, YYYY");
      const differenceInDays = currentDate.diff(issuedDate, "days");
      return differenceInDays <= days;
    });
  };

  const filterDataByDays1 = (data, days) => {
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
        tickerCount: count,
        dateTimeIssued: dates.sort().pop(),
        tickers: tickerSymbol,
      })
    );
  };

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

    // Step 2: Filter data by days for TickerCount
    const filteredData1 = filterDataByDays1(
      myStore.allTickers,
      dynamicDuration
    );

    // Step 3: Count occurrences of each ticker in the filtered data
    const tickerCountsArray = countTickerOccurrences(filteredData1);

    // MERGE LOGIC HERE
    // Create a dictionary to map tickers to tickerCount from data1
    const tickerCountMap = tickerCountsArray.reduce((map, item) => {
      map[item.tickers] = item.tickerCount;
      return map;
    }, {});

    // Merge data2 with tickerCount from data1
    const mergedData = filteredData.map((item) => {
      const tickerCount = tickerCountMap[item.tickers] || 0;
      return { ...item, tickerCount };
    });

    // Step 4: Updating State
    myStore.setFilteredDataTandF(mergedData);

    // Reset pagination to the first page when changing filters
    setPage(0);
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
    {
      id: "firm",
      label: "Firm",
    },
    {
      id: "firmCount",
      label: "Firm Count",
    },
  ];

  // Create an object to store the occurrence count of each ticker symbol
  const data = sequentialData || [];
  const tickerCounts = {};
  const firmsByTicker = {}; // Use an object to store firms by ticker symbol

  data.forEach((tickerObj) => {
    const { tickerSymbol, dateTimeIssued } = tickerObj.payload;
    tickerCounts[tickerSymbol] = tickerCounts[tickerSymbol] || {
      count: 0,
      dates: [],
    };
    tickerCounts[tickerSymbol].count += 1;
    tickerCounts[tickerSymbol].dates.push(dateTimeIssued);
  });

  // Convert the counts into an array of objects
  const tickerCountsArray1 = Object.entries(tickerCounts).map(
    ([tickerSymbol, { count, dates }], index) => ({
      serial: index + 1,
      dateTimeIssued: dates.sort().pop(),
      tickers: tickerSymbol,
      tickerCount: count,
    })
  );

  // Count occurrences of each ticker symbol and store firms
  sequentialData?.forEach((tickerObj) => {
    const { tickerSymbol, dateTimeIssued } = tickerObj.payload;
    const { firm } = tickerObj;
    const issuedDate = moment(dateTimeIssued, "MMMM DD, YYYY");
    const currentDate = moment();
    const differenceInDays = currentDate.diff(issuedDate, "days");
    firmsByTicker[tickerSymbol] = firmsByTicker[tickerSymbol] || [];
    firmsByTicker[tickerSymbol].push(firm);
    if (
      differenceInDays <= 5 ||
      differenceInDays <= 15 ||
      differenceInDays <= 30
    ) {
      tickerCounts[tickerSymbol] = (tickerCounts[tickerSymbol] || 0) + 1;
    }
  });

  const tickerCountsArray = Object.keys(tickerCounts).map((tickerSymbol) => {
    const dateTimeIssuedArray = sequentialData
      .filter((tickerObj) => tickerObj.payload.tickerSymbol === tickerSymbol)
      .map((tickerObj) =>
        moment(tickerObj.payload.dateTimeIssued, "MMMM DD, YYYY").valueOf()
      );

    function countOccurrences(arr) {
      const occurrences = {};
      arr?.forEach((item) => {
        occurrences[item] = (occurrences[item] || 0) + 1;
      });
      return occurrences;
    }
    const inputArray = firmsByTicker[tickerSymbol];
    const occurrences = countOccurrences(inputArray);

    return {
      tickers: tickerSymbol,
      tickerCount: 0,
      firms: [...new Set(firmsByTicker[tickerSymbol])],
      extra: Object.entries(occurrences).map((items) => {
        return items;
      }),
      firmCount: firmsByTicker[tickerSymbol]?.length,
      dateTimeIssued: moment(Math.max(...dateTimeIssuedArray)).format(
        "MMMM DD, YYYY"
      ),
    };
  });

  // Logic for filtering and merging tickercount
  const tickerCountMap = tickerCountsArray1.reduce((map, item) => {
    map[item.tickers] = item.tickerCount;
    return map;
  }, {});

  // Merge data2 with tickerCount from tickerCountsArray1
  const mergedData = tickerCountsArray.map((item) => {
    const tickerCount = tickerCountMap[item.tickers] || 0;
    return { ...item, tickerCount };
  });

  // Sort the ticker data in ascending order based on the "Tickers" column
  const sortedTickerCountsArray = mergedData.slice().sort((a, b) => {
    return a.tickers.localeCompare(b.tickers);
  });

  // Add serial numbers based on the sorted order
  const resultWithSerial = sortedTickerCountsArray.map((item, index) => ({
    serial: index + 1,
    ...item,
  }));

  const createData = (item) => {
    return {
      serial: item.serial,
      dateTimeIssued: item.dateTimeIssued,
      tickers: item.tickers,
      tickerCount: item.tickerCount,
      firm: item.extra.map((firm, index) => (
        <>
          <Chip
            size="small"
            key={`${firm[0]}-${index}`}
            label={firm[0]}
            style={{
              marginRight: 5,
              marginTop: 5,
              padding: "5px 5px 5px 5px",
              flexDirection: "row-reverse",
              alignItems: "center",
            }}
            className="chip"
            avatar={
              <Avatar
                sx={{
                  margin: "0px !important",
                  color: "white !important",
                  fontWeight: "bold",
                  fontSize: "11px !important",
                }}
              >
                {firm[1]}
              </Avatar>
            }
          />
        </>
      )),
      firmCount: item.firmCount,
    };
  };

  const rows =
    myStore?.filteredDataofTandF?.length === 0
      ? resultWithSerial?.map((item) => createData(item))
      : myStore?.filteredDataofTandF.map((item) => createData(item));

  const handleTickerFirmSort = (columnId) => {
    const isAsc =
      tickerFirmOrderBy === columnId && tickerFirmSortDirection === "asc";
    setTickerFirmOrderBy(columnId);
    setTickerFirmSortDirection(isAsc ? "desc" : "asc");
  };

  const tickerFirmSortedRows = stableSort(
    rows,
    getTickerFirmComparator(tickerFirmOrderBy, tickerFirmSortDirection)
  );

  const [finalData, setFinalData] = useState(tickerFirmSortedRows);

  const requestSearch = (searchedVal) => {
    const filteredRows = tickerFirmSortedRows.filter((row) => {
      return row.tickers.toLowerCase().includes(searchedVal.toLowerCase());
    });
    setFinalData(filteredRows);
    setCheck(true);

    if (searchedVal.length === 0) {
      setFinalData([]);
      setCheck(false);
    } else {
      setFinalData(filteredRows);
    }
  };

  const cancelSearch = () => {
    setSearched(true);
    setFinalData(tickerFirmSortedRows);
    setCheck(false);
  };

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getTickerFirmComparator(order, direction) {
    return direction === "desc"
      ? (a, b) => descendingComparator(a, b, order)
      : (a, b) => -descendingComparator(a, b, order);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <Card title="Issued by Ticker and Firm" variant="outlined" sx={{ mb: 3 }}>
        <CardHeader
          title={
            <p
              style={{
                fontFamily: "Inter",
                fontSize: "medium",
                fontWeight: "bold",
              }}
            >
              {"Issued by Ticker and Firm"}
            </p>
          }
          action={
            !isLoading && !myStore.isLoading ? (
              <div
                style={{
                  display: isSmallScreen ? "block" : "flex",
                  alignItems: "center",
                }}
              >
                <SearchBar
                  value={searched}
                  onChange={(searchVal) => requestSearch(searchVal)}
                  onCancelResearch={cancelSearch}
                  style={{
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    margin: isSmallScreen ? "6px" : "0px",
                  }}
                />
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="most-frequent-issue-by-ticker-and-firm-select-small-label">
                    Days
                  </InputLabel>
                  <Select
                    labelId="most-frequent-issue-by-ticker-and-firm-select-small-label"
                    id="most-frequent-issue-by-ticker-and-firm-select-small"
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
              </div>
            ) : (
              <Box>
                {tickerFirmSortedRows.length > 1 && myStore.isLoading && (
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

        {tickerFirmSortedRows.length < 1  && myStore.isLoading ? (
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
                    <TableCell
                      key={column.id}
                      style={{ fontWeight: "bold" }}
                      hidesorticon={`${false}`}
                    >
                      <TableSortLabel
                        key={column.id}
                        active={tickerFirmOrderBy === column.id}
                        direction={
                          tickerFirmOrderBy === column.id
                            ? tickerFirmSortDirection
                            : "asc"
                        }
                        onClick={() => handleTickerFirmSort(column.id)}
                        hidesorticon={`${false}`}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {/* {finalData.length !== 0 &&
                check === true &&
                finalData.length <= tickerFirmSortedRows.length ? (
                  finalData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.serial}>
                        {columns.map((column) => (
                          <TableCell key={column.id} hidesorticon={`${false}`}>
                            {row[column.id]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : check === false && finalData.length <= tickerFirmSortedRows.length ? (
                  tickerFirmSortedRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.serial}>
                        {columns.map((column) => (
                          <TableCell key={column.id} hidesorticon={`${false}`}>
                            {row[column.id]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : finalData.length === 0 &&
                  check === true &&
                  finalData.length <= tickerFirmSortedRows.length ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src="nodata.png"
                          alt="No Data"
                          className="noDataImg"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null} */}

                {finalData.length !== 0 &&
                check === true &&
                finalData.length <= tickerFirmSortedRows.length ? (
                  finalData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.serial}>
                      {columns.map((column) => (
                        <TableCell key={column.id} hidesorticon={`${false}`}>
                          {row[column.id]}
                        </TableCell>
                      ))}
                    </TableRow>                    
                    ))
                ) : check === false &&
                  finalData.length <= tickerFirmSortedRows.length ? (
                  tickerFirmSortedRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.serial}>
                        {" "}
                        {/* Ensure each TableRow has a unique key */}
                        {columns.map((column) => (
                          <TableCell key={column.id} hidesorticon={`${false}`}>
                            {row[column.id]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : finalData.length === 0 &&
                  check === true &&
                  finalData.length <= tickerFirmSortedRows.length ? (
                  <TableRow key="no-data">
                    {" "}
                    {/* Use a unique key for special cases */}
                    <TableCell colSpan={columns.length} align="center">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src="nodata.png"
                          alt="No Data"
                          className="noDataImg"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[
                5,
                10,
                25,
                { label: "All", value: tickerFirmSortedRows.length },
              ]}
              component="div"
              count={
                finalData.length !== 0 &&
                check === true &&
                finalData.length <= tickerFirmSortedRows.length
                  ? finalData.length
                  : check === false &&
                    finalData.length <= tickerFirmSortedRows.length
                  ? tickerFirmSortedRows.length
                  : finalData.length
              }
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

export default MostFrequentlyIssuedByTickerandFirm;
