import React, { useEffect, useState } from "react";
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CButton,
  CModalFooter,
  CRow,
  CCol,
  CFormGroup,
  CLabel,
  CSelect,
  CInputCheckbox,
  CCollapse,
} from "@coreui/react";
import { GrDocumentUpload } from "react-icons/gr";
import Dropdown from "./dropdown";
import "./import-document.scss";

function ImportDocument(props) {
  const { open, setOpen, rows = null, sheet = [], setAddress } = props;
  const [accordion, setAccordion] = useState(1);
  const [ignoreRow, setIgnoreRow] = useState(false);
  const [appendToCurrentList, setAppendToCurrentList] = useState(false);
  const [firstAsStartAddress, setFirstAsStartAddress] = useState(false);
  const [lastAsEndAddress, setLastAsEndAddress] = useState(false);
  const [returnToStartAddress, setReturnToStartAddress] = useState(false);
  const [generatedRows, setGeneratedRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Array(9).fill(0));

  const headers = (rows && rows.length && Object.keys(rows[0])) || [];

  const setDropdownType = (index, type) => {
    let selItems = Object.assign([], selectedItems);
    selItems[index] = type;

    let newRows = [];
    generatedRows.map((row, i) => {
      const obj = {};
      selItems.map((item, j) => {
        if (item === 1)
          obj["title"] = (obj["title"] || "") + rows[i][headers[j]] + " ";

        if (item === 2)
          obj["address"] = (obj["address"] || "") + rows[i][headers[j]] + " ";

        if (item === 3)
          obj["service_time"] =
            (obj["service_time"] || "") + rows[i][headers[j]] + " ";

        if (item === 4)
          obj["order_size"] =
            (obj["order_size"] || "") + rows[i][headers[j]] + " ";

        if (item === 5)
          obj["territory"] =
            (obj["territory"] || "") + rows[i][headers[j]] + " ";
      });

      newRows.push(obj);
    });

    setSelectedItems(selItems);
    setGeneratedRows(newRows);
  };

  useEffect(() => {
    setGeneratedRows([...rows]);
  }, [rows]);

  let resultRows = generatedRows;
  if (resultRows && resultRows.length) {
    if (ignoreRow) {
      resultRows = resultRows.slice(1);
    } else {
      resultRows = resultRows;
    }

    if (firstAsStartAddress) {
      resultRows[0].type = "H";
      resultRows.map((row, index) => {
        if (index >= 1) {
          row.type = index;
        }
      });
    } else {
      resultRows.map((row, index) => {
        row.type = index + 1;
      });
    }

    if (returnToStartAddress && !lastAsEndAddress) {
      const firstRow = resultRows[0];
      resultRows = [...resultRows, firstRow];
      resultRows[resultRows.length - 1].type = "E";
    } else if (lastAsEndAddress) {
      resultRows[resultRows.length - 1].type = "E";
    }
  }

  const importNow = () => {
    setAddress(resultRows);
    setOpen(false);
  };

  return (
    <CModal
      className="import-document"
      show={open}
      onClose={() => setOpen(!open)}
      size="xl"
    >
      <CModalHeader closeButton>
        <CModalTitle className="d-flex align-items-center">
          <GrDocumentUpload className="my-auto mr-2 h4" />
          Import Document
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow>
          <CCol md="4">
            <CFormGroup>
              <CLabel htmlFor="sheet">Select a sheet</CLabel>
              <CSelect custom name="sheet" id="sheet">
                {sheet.map((s) => {
                  return <option value={s}>{s}</option>;
                })}
              </CSelect>
            </CFormGroup>
          </CCol>
          <CCol
            md="8"
            className="d-flex justify-content-end align-items-center"
          >
            <CFormGroup variant="custom-checkbox" inline>
              <CInputCheckbox
                custom
                id="ignore-row"
                name="ignore_row"
                checked={ignoreRow}
                onChange={(e) => {
                  setIgnoreRow(e.target.checked);
                }}
              />
              <CLabel variant="custom-checkbox" htmlFor="ignore-row">
                Ignore first row
              </CLabel>
            </CFormGroup>
            <CFormGroup variant="custom-checkbox" inline>
              <CInputCheckbox
                custom
                id="append-to-current-list"
                name="append_to_current_list"
                checked={appendToCurrentList}
                onChange={(e) => {
                  setAppendToCurrentList(e.target.checked);
                }}
              />
              <CLabel
                variant="custom-checkbox"
                htmlFor="append-to-current-list"
              >
                Append to curent list
              </CLabel>
            </CFormGroup>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md="12" className="d-flex justify-content-end">
            <CFormGroup variant="custom-checkbox" inline>
              <CInputCheckbox
                custom
                id="first-as-start-address"
                name="first_as_start_address"
                checked={firstAsStartAddress}
                onChange={(e) => {
                  setFirstAsStartAddress(e.target.checked);
                }}
              />
              <CLabel
                variant="custom-checkbox"
                htmlFor="first-as-start-address"
              >
                Set first as start address
              </CLabel>
            </CFormGroup>
            <CFormGroup variant="custom-checkbox" inline>
              <CInputCheckbox
                custom
                id="last-as-end-address"
                name="last_as_end_address"
                checked={lastAsEndAddress}
                onChange={(e) => {
                  setLastAsEndAddress(e.target.checked);
                }}
              />
              <CLabel variant="custom-checkbox" htmlFor="last-as-end-address">
                Set last as end address
              </CLabel>
            </CFormGroup>
            <CFormGroup variant="custom-checkbox" inline>
              <CInputCheckbox
                custom
                id="return-to-start-address"
                name="return_to_end_address"
                checked={returnToStartAddress}
                onChange={(e) => {
                  setReturnToStartAddress(e.target.checked);
                }}
              />
              <CLabel
                variant="custom-checkbox"
                htmlFor="return-to-start-address"
              >
                Return to start address
              </CLabel>
            </CFormGroup>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol>
            <CButton
              block
              color="link"
              className="text-left m-0 p-0"
              onClick={() => setAccordion(accordion === 0 ? null : 0)}
            >
              <h5 className="m-0 p-0">
                Pick the correct option, above each column:
              </h5>
            </CButton>
            <CCollapse show={accordion === 0}>
              <CRow>
                <CCol md="6">
                  Address - House#, Street, City, Zip code, State etc.
                </CCol>
                <CCol md="6">
                  Ignore - Irrelevant info that will be excluded (like fax #).
                </CCol>
              </CRow>
              <CRow>
                <CCol md="6">
                  Title - Customer name, Store name, Notes etc.
                </CCol>
                <CCol md="6">
                  Filter-in/out - Rows with values will be included/excluded.
                </CCol>
              </CRow>
              <CRow>
                <CCol md="6">
                  Territory - Values that define geographical area grouping.
                </CCol>
                <CCol md="6">
                  Comments - Instructions or other information.
                </CCol>
              </CRow>
              <CRow>
                <CCol md="6">
                  Service Time - Pause at a specific location (in minutes).
                </CCol>
              </CRow>
            </CCollapse>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol>
            <table className="table table-bordered pre-render-table">
              <thead>
                <tr>
                  {rows &&
                    rows.length &&
                    Object.keys(rows[0]).map((item, index) => {
                      if (item !== "type")
                        return (
                          <th scope="col" className="p-0">
                            <Dropdown
                              selectedItem={selectedItems[index]}
                              setDropdownType={(type) =>
                                setDropdownType(index, type)
                              }
                            />
                          </th>
                        );
                    })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  return (
                    <tr>
                      {Object.keys(row).map((cell) => {
                        if (cell !== "type") return <td>{row[cell]}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <p>Review the results preview and select import now.</p>
            <table className="table table-bordered table-light eliminated-table">
              <thead>
                <tr>
                  <th className="th-type" scope="col">
                    Type
                  </th>
                  <th className="th-title" scope="col">
                    Title
                  </th>
                  <th className="th-address" scope="col">
                    Address
                  </th>
                  <th className="th-service-time" scope="col">
                    Service time
                  </th>
                  <th className="th-order-size" scope="col">
                    Order Size
                  </th>
                  <th className="th-territory" scope="col">
                    Territory
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map((row) => {
                  return (
                    <tr>
                      <td className="td-type">{row["type"]}</td>
                      <td className="td-title">{row["title"]}</td>
                      <td className="td-address">{row["address"]}</td>
                      <td className="td-service-time">{row["service_time"]}</td>
                      <td className="td-order-size">{row["order_size"]}</td>
                      <td className="td-territory">{row["territory"]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={importNow}>
          Import Now
        </CButton>{" "}
        <CButton color="secondary" onClick={() => setOpen(!open)}>
          Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  );
}

export default ImportDocument;
