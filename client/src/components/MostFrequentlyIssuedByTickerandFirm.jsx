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
} from "@mui/material";
import { UseNewsStore } from "../store";
import moment from "moment";

const MostFrequentlyIssuedByTickerandFirm = () => {
  const myStore = UseNewsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const createData = (item) => {
    return {
      serial: item.serial,
      dateTimeIssued: item.dateTimeIssued,
      tickers: item.tickers,
      tickerCount: item.tickerCount,
      firm: item.firms.map((firm, index) => (
        <Chip
        size="small"
          key={index}
          label={firm}
          style={{ marginRight: 5, marginTop: 5, padding: "5px 5px 5px 5px" }}
          className="chip"
        />
      )),
      firmCount: item.firmCount,
    };
  };

  const rows = myStore?.filteredDataofTandF?.length === 0
    ? resultWithSerial.map((item) => createData(item))
    : myStore?.filteredDataofTandF.map((item) => createData(item));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <Card
        title="Issued by Ticker and Firm"
        variant="outlined"
        sx={{ mb: 3 }}
       
      >
        <CardHeader
        title={<p style={{fontFamily: 'Inter', fontSize: "medium", fontWeight: 'bold'}}>{"Issued by Ticker and Firm"}</p>}
        action={
          !isLoading ? (

            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="most-frequent-issue-by-ticker-and-firm-select-small-label">Days</InputLabel>
            <Select
              labelId="most-frequent-issue-by-ticker-and-firm-select-small-label"
              id="most-frequent-issue-by-ticker-and-firm-select-small"
              label="Days"
              onChange={(e) => handleChange(e.target.value)}
              sx={{fontSize: "medium"}}
              defaultValue={""}
            >
              <MenuItem value='5'>5 Days</MenuItem>
              <MenuItem value='15'>15 Days</MenuItem>
              <MenuItem value='30'>30 Days</MenuItem>
            </Select>
          </FormControl>
          ) : (
            ""
          )
        } />

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress sx={{marginBottom: 10}}/>
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{borderTop: '1px solid #e0e0e0'}}>
                <TableRow>
                {columns.map((column) => (
                    <TableCell key={column.id} style={{fontWeight: 'bold'}}>{column.label}</TableCell>
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
            rowsPerPageOptions={[5, 10, 25]}
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

export default MostFrequentlyIssuedByTickerandFirm;