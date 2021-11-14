import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.scss";
import { gql, useQuery, useMutation } from "@apollo/client";
import client from "../apollo-client";
import { useState, useEffect, useMemo } from "react";
import { useTable, usePagination } from "react-table";

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
};

function Table({ columns, data, updateMyData, skipPageReset }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      updateMyData,
    },
    usePagination
  );

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => (
                <th key={i} {...column.getHeaderProps()}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={i} {...row.getRowProps()}>
                {row.cells.map((cell, index) => {
                  return (
                    <td key={index} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const GET_USERS = gql`
  query GetUsers {
    users {
      name
      id
      lastname
      phone
      email
      date_of_birth
    }
  }
`;

const DELETE_USER = gql`
  mutation Delete_users_by_pk($deleteUsersByPkId: Int!) {
    delete_users_by_pk(id: $deleteUsersByPkId) {
      id
    }
  }
`;

const INSERT_USER = gql`
  mutation Insert_users_one($object: users_insert_input!) {
    insert_users_one(object: $object) {
      id
    }
  }
`;

const UPDATE_USER = gql`
  mutation Update_users_by_pk(
    $pkColumns: users_pk_columns_input!
    $set: users_set_input
  ) {
    update_users_by_pk(pk_columns: $pkColumns, _set: $set) {
      phone
      name
      lastname
      id
      email
      date_of_birth
    }
  }
`;

const ADD_USER = gql`
  mutation Insert_users_one($object: users_insert_input!) {
    insert_users_one(object: $object) {
      date_of_birth
      email
      id
      lastname
      name
      phone
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_USERS);
  const [deleteUser] = useMutation(DELETE_USER);
  const [insertUser] = useMutation(INSERT_USER);
  const [updateOneUser] = useMutation(UPDATE_USER);
  const [addUser] = useMutation(ADD_USER);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    if (data) {
      setUserData(data.users);
    }
  }, [data]);

  useEffect(() => {
    setSkipPageReset(false);
  }, [userData]);

  const columns = useMemo(
    () => [
      {
        Header: "Users Table",
        columns: [
          {
            Header: "Action",
            accessor: "action",
            Cell: ({ cell }) => (
              <button
                value={cell.row.values.id}
                onClick={(e) => {
                  deleteUser({
                    variables: { deleteUsersByPkId: e.target.value },
                  });
                  removeRow(e.target.value);
                }}
              >
                Delete User
              </button>
            ),
          },
          {
            Header: "Name",
            accessor: "name",
          },
          {
            Header: "Lastname",
            accessor: "lastname",
          },
          {
            Header: "Email",
            accessor: "email",
          },
          {
            Header: "Date Of Birth",
            accessor: "date_of_birth",
          },
          {
            Header: "Id",
            accessor: "id",
          },
          {
            Header: "Phone",
            accessor: "phone",
          },
        ],
      },
    ],
    [userData]
  );

  const removeRow = (id) => {
    let temp = [...userData];
    userData.map((val, index) => {
      if (String(val.id) === String(id)) {
        temp.splice(index, 1);
      }
    });
    setUserData(temp);
  }

  const updateMyData = (rowIndex, columnId, value) => {
    setSkipPageReset(true);
    let temp = { ...userData[rowIndex] };
    userData.map((row, index) => {
      if (index === rowIndex) {
        temp = { ...temp, [columnId]: value };
      }
    });
    let arr = [...userData];
    arr[rowIndex] = temp;
    setUserData(arr);

    updateOneUser({
      variables: {
        pkColumns: {
          id: arr[rowIndex].id,
        },
        set: {
          phone: arr[rowIndex].phone,
          name: arr[rowIndex].name,
          lastname: arr[rowIndex].lastname,
          id: arr[rowIndex].id,
          email: arr[rowIndex].email,
          date_of_birth: arr[rowIndex].date_of_birth,
        },
      },
    });
  };

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.TableContainerStyle}>
          <p style={{textAlign: 'center'}}>In order to edit click cells</p>
          <button
            onClick={() => {
              let temp = [...userData];
              let createdUser = {
                date_of_birth: new Date()
                  .toISOString()
                  .replace(/T.*/, "")
                  .split("-")
                  .join("-"),
                email: "",
                id: Math.floor(Math.random() * 1000000001),
                lastname: "",
                name: "",
                phone: "",
              };
              temp.push(createdUser);
              setUserData(temp);
              addUser({
                variables: { object: createdUser },
              });
            }}
            style={{ marginBottom: "12px" }}
          >
            Add New User
          </button>
          <Table
            columns={columns}
            data={userData}
            updateMyData={updateMyData}
            skipPageReset={skipPageReset}
          />
        </div>
      </main>
    </div>
  );
}
