import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardHeader,
  Button,
  Paper,
  Box,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Typography,
  TablePagination,
  TableSortLabel,
  Tooltip,
  CircularProgress,
} from "@mui/material";
// import { ReactComponent as EditIcon } from "../Icons/Edit.svg";
import { ReactComponent as DeleteIcon } from "../Icons/Delete.svg";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "../Styles/buttons.css";
import CustomUi from "../helpers/CustomUI";
import { UseNewsStore } from "../store";

const AddNewFirms = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState("firmName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const myStore = UseNewsStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // SORTING LOGIC HERE
  function descendingComparator(a, b, orderBy) {
    if (orderBy === "serial") {
      return a.serial - b.serial; // Compare using the 'serial' property
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && sortDirection === "asc";
    setOrderBy(columnId);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  // SORTING LOGIC ENDS HERE

  // PAGINATION LOGIC HERE
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = stableSort(data, getComparator(sortDirection, orderBy));

  // Extract data for the current page and rowsPerPage
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  // PAGINATION LOGIC ENDS HERE

  const handleClickOpen = () => {
    setValue("");
    setOpen(true);
    reset();
  };

  const handleClose = () => {
    setOpen(false);
  };

  // GET API FOR FETCHING ALL FIRMS
  const fetchFirms = async () => {
    var arr = [];
    await axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/new-firm-news-wire-getdetails`)
      .then((response, index) => {
        response.data.map((item, index) => {
          return arr.push(Object.assign(item, { serial: index + 1 }));
        });
        setData(arr);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  // FIRM ARRAY FOR ALL FIRMS
  const firmArray = [
    { firmName: "Berger Montague-7427", label: "Berger Montague" },
    { firmName: "Bernstein Liebhard-6535", label: "Bernstein Liebhard" },
    { firmName: "Bronstein, Gewirtz-7130", label: "Bronstein, Gewirtz" },
    { firmName: "Faruqi & Faruqi-6455", label: "Faruqi & Faruqi" },
    { firmName: "Grabar-8797", label: "Grabar" },
    { firmName: "Hagens Berman-7059", label: "Hagens Berman" },
    { firmName: "Kessler Topaz-7699", label: "Kessler Topaz" },
    { firmName: "Pomerantz-7611", label: "Pomerantz" },
    { firmName: "Rigrodsky-8569", label: "Rigrodsky" },
    { firmName: "Schall-6640", label: "Schall" },
    { firmName: "Kaskela-7815", label: "Kaskela" },
    { firmName: "Glancy-9378", label: "Glancy" },
    { firmName: "Levi & Korsinsky-7091", label: "Levi & Korsinsky" },

    // NEWLY ADDED FIRMS LIST
    {
      firmName: "Robbins Geller Rudman Dowd LLP-8150",
      label: "Robbins Geller",
    },
    { firmName: "Saxena white-0", label: "Saxena white" },
    {
      firmName: "Scott & Scott Attorneys at Law LLP-8957",
      label: "Scott & Scott",
    },
    { firmName: "Robbins LLP-7239", label: "Robbins LLP" },
    { firmName: "Bernstein Litowitz-0", label: "Bernstein Litowitz" },
    { firmName: "Kahn Swick Foti LLC-7442", label: "Kahn Swick" },
    { firmName: "Abraham Fruchter-0", label: "Abraham Fruchter" },
    { firmName: "Entwistle-0", label: "Entwistle" },
    { firmName: "Holzer Holzer LLC-7426", label: "Holzer & Holzer" },
    {
      firmName: "The Law Offices of Frank R. Cruz-9419",
      label: "Frank R. Cruz",
    },
    { firmName: "Portnoy Law-7179", label: "Portnoy Law Firm" },
    { firmName: "Kirby McInerney LLP-9576", label: "Kirby McInerney" },
    {
      firmName: "Law Offices of Howard G. Smith-9420",
      label: "Howard G. Smith",
    },
    { firmName: "Bragar Eagel-0", label: "Bragar Eagel" },
  ];

  // FILTERED ITEMS OF ARRAY IF THE VALUE IS SELECTED FROM SELECT
  const firmNamesToRemove = data.map((item) => item.label);
  const filteredFirmArray = firmArray.filter(
    (item) => !firmNamesToRemove.includes(item.label)
  );


  // TEST
  const testAPICall = async() => {
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
  }

  // POST API FOR ADDING NEW FIRMS
  const submitData = async (data) => {
    setLoading(true);
    const selectedValue = data.firmName;
    let [firmName, label] = selectedValue.split("#");
    const finalData = firmName;
    const removedStrData = finalData.replace(/'/g, "");
    let id;

    // Check if the string ends with "-0"
    if (removedStrData.endsWith("-0")) {
      firmName = removedStrData.slice(0, -2);
      id = removedStrData.slice(-1);
    } else {
      firmName = removedStrData.slice(0, -5);
      id = removedStrData.slice(-4);
    }

    const payload = {
      firmName: firmName,
      label: label,
      index: Number(id),
      flag: true,
    };

    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/new-firm-news-wire`, payload)
      .then((response) => {
        if (response.data[0].message !== undefined) {
          toast.error(response.data[0].message, {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          });
          handleClose();
          
        } else {
          toast.success("Firm has been added successfully.", {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          });
          setLoading(false);
          handleClose();
          fetchFirms();
          testAPICall();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // DELETE API FOR DELETING A FIRM WITH AN CONFIRM ALERT CONFIGURATION

  const deleteFirms = async (_id, firmName, label) => {
    const payload = {
      _id: _id,
    };

    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomUi
            onClose={onClose}
            fetchData={fetchFirms}
            payload={payload}
            label={label}
          />
        );
      },
    });
  };

  return (
    <div>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <CardHeader
            title={
              <p
                style={{
                  fontFamily: "Inter",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                {"Add firms"}
              </p>
            }
          />
          <Box sx={{ paddingRight: 3 }}>
            <Tooltip title="Add new firm" arrow placement="bottom">
              <Button
                variant="contained"
                size="small"
                sx={{
                  fontWeight: "600",
                  fontFamily: "Inter",
                }}
                onClick={handleClickOpen}
              >
                Add new firms
              </Button>
            </Tooltip>
          </Box>
        </Box>
        {/* MAIN TABLE STARTS FROM HERE */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ borderTop: "1px solid #e0e0e0" }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "serial"}
                    direction={orderBy === "serial" ? sortDirection : "asc"}
                    sx={{ fontWeight: "bold" }}
                    onClick={() => handleSort("serial")}
                  >
                    Serial No.
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "firmName"}
                    direction={orderBy === "firmName" ? sortDirection : "asc"}
                    sx={{ fontWeight: "bold" }}
                    onClick={() => handleSort("firmName")}
                  >
                    Firm
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <TableSortLabel hideSortIcon={true}>Action</TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={row._id}
                  // sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.serial}</TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>
                    <div className="d-flex">
                      <Tooltip title="Delete firm" arrow placement="right">
                        <DeleteIcon
                          className="iconHover delete-icon"
                          onClick={() => deleteFirms(row._id, row.firmName, row.label)}
                        />
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: data.length },
            ]}
            sx={{ marginBottom: "0px !important" }}
            component="div"
            colSpan={3}
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={!data.length || data.length <= 0 ? 0 : page}
            // page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* MAIN TABLE ENDS HERE */}

        {/* MODAL FOR ADDING FIRM */}

        <Dialog open={open} onClose={handleClose}>
          <form onSubmit={handleSubmit(submitData)}>
            <DialogContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <DialogTitle
                  sx={{
                    paddingLeft: 0,
                    fontFamily: "Inter",
                    fontWeight: 500,
                    paddingTop: 0,
                  }}
                >
                  Add new firm
                </DialogTitle>
                <IconButton
                  className="close"
                  sx={{
                    background: "#f5365c",
                    borderRadius: "50%",
                    alignItems: "center",
                    height: "26px",
                    width: "26px",
                  }}
                  onClick={handleClose}
                >
                  <CloseIcon
                    sx={{
                      height: "20px",
                      width: "20px",
                      color: "white !important",
                      fontWeight: "bold",
                    }}
                  />
                </IconButton>
              </Box>

              <FormControl fullWidth sx={{ marginTop: "5px" }}>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "500",
                    fontFamily: "Inter",
                    paddingBottom: "4px",
                  }}
                >
                  Firms
                </Typography>

                <Select
                  displayEmpty
                  labelId="firms-select-label"
                  id="firmName"
                  size="small"
                  name="firmName"
                  value={value}
                  defaultValue=""
                  {...register("firmName", {
                    required: {
                      value: true,
                      message: "Select atleast 1 firm!",
                    },
                  })}
                  onChange={(e) => setValue(e.target.value)}
                  required
                >
                  {filteredFirmArray.length === 0 ? (
                    <MenuItem disabled value="">
                      <em>No firms left to add</em>
                    </MenuItem>
                  ) : (
                    <MenuItem value="">
                      <em>Select Firm</em>
                    </MenuItem>
                  )}
                  {/* {filteredFirmArray.map((item, index) => (
                    <MenuItem
                      key={index}
                      value={`${item.firmName}#${item.label}`}
                    >
                      {item.label}
                    </MenuItem>
                  ))} */}

                  {filteredFirmArray.map((element, index) => (
                    <MenuItem
                    value={`${element.firmName}#${element.label}`}
                      key={index}
                    >
                      {Object.values(element)[1]}
                    </MenuItem>
                  ))}

                  {/* {filteredFirmArray.map((element, index) => (
                    <MenuItem value={element.label} key={index}>
                      {element.label}
                    </MenuItem>
                  ))} */}
                </Select>


                {errors.firms && (
                  <Typography variant="caption" color="red">
                    {errors.firms.message}
                  </Typography>
                )}
              </FormControl>
            </DialogContent>
            <DialogActions
              sx={{
                mb: 2,
                textAlign: "center",
                display: "block",
                fontWeight: "600",
                fontFamily: "Inter",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  fontWeight: "600",
                  fontFamily: "Inter",
                }}
                disabled={loading === true ? true : false}
              >
                {loading === true ? (
                  <>
                    <CircularProgress color="primary" size={20} />
                    <span style={{ fontFamily: "Inter" }}>
                      &nbsp;&nbsp;Loading
                    </span>
                  </>
                ) : (
                  "Add"
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* MODAL FOR ADDING FIRM */}
      </Card>
      <ToastContainer autoClose={3000} limit={1} theme="light" />
    </div>
  );
};

export default AddNewFirms;
