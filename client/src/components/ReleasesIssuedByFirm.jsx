import React, { useState } from "react";
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
  Box,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UseNewsStore } from "../store";
import SearchBar from "@mkyy/mui-search-bar";
import { useMediaQuery } from "@mui/material";

import moment from "moment";

const ReleasesIssuedByFirm = () => {
  const queryKey = "businessWireData";
  const myStore = UseNewsStore();
  // const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("serial");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searched, setSearched] = useState("");
  const [check, setCheck] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const isSmallScreen = useMediaQuery("(max-width:500px)");
  var sequentialData = [];

  const fetchBusinessWireData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/business-wire`
      );
      myStore.setBusinessWireData(response);

      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/pr-news-wire`
      );
      myStore.setPRNewsWireData(response1);
      const response2 = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/news-files`);
      myStore.setNewsFileData(response2);
      const response3 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/globe-news-wire`
      );
      myStore.setGlobeNewsWireData(response3);
      const response4 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/access-wire`
      );
      myStore.setAccessWireData(response4);

      const allNewsData = [
        ...response.data,
        ...response1.data,
        ...response2.data,
        ...response3.data,
        ...response4.data,
      ];

      myStore.setAllNewsData(allNewsData);

      const arr = allNewsData
        .map((items) => items?.payload)
        .sort((a, b) => a.tickerSymbol.localeCompare(b.tickerSymbol));

      myStore.setAllTickers(arr);

      return allNewsData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
    refetchInterval: 20 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  const separatedData = separateFirmTypes(sequentialData);
  // const separatedData = separateFirmTypes(sequentialData);

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

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && sortDirection === "asc";
    setOrderBy(columnId);
    setSortDirection(isAsc ? "desc" : "asc");
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

  function getComparator(order, direction) {
    return direction === "desc"
      ? (a, b) => descendingComparator(a, b, order)
      : (a, b) => -descendingComparator(a, b, order);
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

  const columns = [
    {
      id: "serial",
      label: "Serial No.",
    },
    {
      id: "firmName",
      label: "Firm",
    },
    {
      id: "totalReleases",
      label: "Total Releases",
    },
    {
      id: "filteredServiceIssuedOnData",
      label: "Service Issued on",
    },
    {
      id: "tickers",
      label: "Tickers",
    },
  ];

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

  const createData = (item) => {
    return {
      serial: item.serial,
      firmName: item.firmName,
      totalReleases: item.totalReleases,
      filteredServiceIssuedOnData: item.filteredServiceIssuedOnData.map(
        (serviceIssuedOn, index) => (
          <Chip
            key={index}
            style={{
              marginBottom: 5,
              marginRight: 5,
              padding: "5px 5px 5px 5px",
            }}
            label={serviceIssuedOn}
            size="small"
            className="chip"
          />
        )
      ),
      tickers: item.tickers.map((ticker, index) => (
        <Chip
          key={index}
          style={{
            marginBottom: 5,
            marginRight: 5,
            padding: "5px 5px 5px 5px",
          }}
          label={ticker}
          size="small"
          className="chip"
        />
      )),
    };
  };

  const rows = filteredData.map((item) => createData(item));

  const sortedRows = stableSort(rows, getComparator(orderBy, sortDirection));

  const [finalData, setFinalData] = useState(sortedRows);

  const requestSearch = (searchedVal) => {
    const filteredRows = sortedRows.filter((row) =>
      row.tickers.some((ticker) =>
        ticker.props.label.toLowerCase().includes(searchedVal.toLowerCase())
      )
    );
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
    setFinalData(sortedRows);
    setCheck(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Function to handle expanding/collapsing a row
  const handleExpandRow = (rowKey) => {
    console.log(rowKey);
    setExpandedRows((prevState) => ({
      ...prevState,
      [rowKey]: !prevState[rowKey],
    }));
  };

  // if (
  //   check === true &&
  //   finalData.length <= sortedRows.length &&
  //   finalData.length !== 0
  // ) {
  //   console.log("search data loop");
  // } else if (check === false && finalData.length <= sortedRows.length) {
  //   console.log("sorted rows loop");
  // } else if (
  //   check === true &&
  //   finalData.length === 0 &&
  //   finalData.length <= sortedRows.length
  // ) {
  //   console.log("no data found statement");
  // }

  return (
    <div>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader
          title={
            <p
              style={{
                fontFamily: "Inter",
                fontSize: "medium",
                fontWeight: "bold",
              }}
            >
              {"Issued by Firm"}
            </p>
          }
          action={
            isLoading === false ? (
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
                  <InputLabel id="release-issue-select-small-label">
                    Days
                  </InputLabel>
                  <Select
                    labelId="release-issue-select-small-label"
                    id="release-issue-select-small"
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
                {sortedRows.length > 1 && (
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

        {sortedRows.length < 1 ? (
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
                      sortDirection={
                        orderBy === column.id ? sortDirection : false
                      }
                      hidesorticon={`${false}`}
                    >
                      {column.id !== "tickers" ? (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={
                            orderBy === column.id ? sortDirection : "asc"
                          }
                          onClick={() => handleSort(column.id)}
                          hidesorticon={`${false}`}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {finalData.length !== 0 &&
                check === true &&
                finalData.length <= sortedRows.length ? (
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
                ) : check === false && finalData.length <= sortedRows.length ? (
                  sortedRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.id} hidesorticon={`${false}`}>
                          {column.id === "tickers" && row.tickers.length > 50 ? (
                            <div>
                              {expandedRows[row.serial] ? (
                                <>
                                  {row.tickers}
                                  <Button
                                    size="small"
                                    variant="text"
                                    sx={{ textTransform: "lowercase" }}
                                    onClick={() => handleExpandRow(row.serial)}
                                    disableRipple
                                    disableElevation
                                    disableFocusRipple
                                  >
                                    ...show less
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {row.tickers.slice(0, 50)}
                                  <Button
                                    size="small"
                                    variant="text"
                                    sx={{ textTransform: "lowercase" }}
                                    onClick={() => handleExpandRow(row.serial)}
                                    disableRipple
                                    disableElevation
                                    disableFocusRipple
                                  >
                                    ...show more
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            row[column.id]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    ))
                ) : finalData.length === 0 &&
                  check === true &&
                  finalData.length <= sortedRows.length ? (
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
                ) : null}
              </TableBody>
            </Table>
            <TablePagination
              sx={{ marginBottom: "0px !important" }}
              rowsPerPageOptions={[
                5,
                10,
                25,
                { label: "All", value: sortedRows.length },
              ]}
              component="div"
              // count={
              //    finalData.length
              // }
              count={
                finalData.length !== 0 &&
                check === true &&
                finalData.length <= sortedRows.length
                  ? finalData.length
                  : check === false && finalData.length <= sortedRows.length
                  ? sortedRows.length
                  // : finalData.length
                  : finalData.length
              }
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {console.log(page)}
          </TableContainer>
        )}
      </Card>
    </div>
  );
};

export default ReleasesIssuedByFirm;
