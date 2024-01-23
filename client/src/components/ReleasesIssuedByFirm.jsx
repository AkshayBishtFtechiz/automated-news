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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UseNewsStore } from "../store";
import moment from "moment";

const ReleasesIssuedByFirm = () => {
  const queryKey = "businessWireData";
  const myStore = UseNewsStore();
  // const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("serial");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchBusinessWireData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/business-wire");
      const response1 = await axios.get("http://localhost:5000/api/pr-news-wire");
      const response2 = await axios.get("http://localhost:5000/api/news-files");
      const response3 = await axios.get(
        "http://localhost:5000/api/globe-news-wire"
      );
      const response4 = await axios.get("http://localhost:5000/api/access-wire")

      const allNewsData = [
        ...response.data,
        ...response1.data,
        ...response2.data,
        ...response3.data,
        ...response4.data
      ];

      const arr = allNewsData
        .map((items) => items?.payload)
        .sort((a, b) => a.tickerSymbol.localeCompare(b.tickerSymbol));

      myStore.setAllTickers(arr);
      myStore.setAllNewsData(allNewsData);

      return allNewsData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
          <Chip key={index} style={{ marginBottom: 5, marginRight: 5, padding: "5px 5px 5px 5px" }} label={serviceIssuedOn} size="small" className="chip"/>
        )
      ),
      tickers: item.tickers.map((ticker, index) => (
        <Chip
          key={index}
          style={{ marginBottom: 5, marginRight: 5,  padding: "5px 5px 5px 5px"}}
          label={ticker}
          size="small"
          className="chip"
        />
      )),
    };
  };

  const rows = filteredData.map((item) => createData(item));

  const sortedRows = stableSort(rows, getComparator(orderBy, sortDirection));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  return (
    <div>
      <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        title={<p style={{fontFamily: 'Inter', fontSize: "medium", fontWeight: 'bold'}}>{"Issued by Firm"}</p>}
        action={
          isLoading === false ? (
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="release-issue-select-small-label">Days</InputLabel>
            <Select
              labelId="release-issue-select-small-label"
              id="release-issue-select-small"
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
            <CircularProgress sx={{marginBottom: 10}} />
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
                    sortDirection={orderBy === column.id ? sortDirection : false}
                    hidesorticon={`${false}`}
                  >
                    {column.id !== "tickers" ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? sortDirection : "asc"}
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
              {sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.serial}>
                    {columns.map((column) => (
                      <TableCell key={column.id} hidesorticon={`${false}`}>
                        {row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            sx={{ marginBottom: "0px !important" }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sortedRows.length}
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

export default ReleasesIssuedByFirm;
