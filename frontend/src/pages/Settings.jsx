import React, { useCallback, useEffect, useState } from "react";
import "../styles/Settings.css";
import axios_instance from "../Axios";
import { showErrorMsg, showSuccessMsg } from "../Alerts";
import UsersTable from "../components/UsersTable";
import ConfirmationModal from "../components/ConfirmationModal";
import NewUserBtn from "../components/NewUserBtn";

function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [fetchUsers, setFetchUsers] = useState(true);

  useEffect(() => {
    if (fetchUsers) {
      setUsersLoading(true);

      axios_instance
        .get("users")
        .then(res => {
          if (res.status === 200) return res.data;
          throw new Error();
        })
        .then(data => setUsers(data))
        .catch(err => {
          if (err.handledByMiddleware) return;

          let msg = "Couldn't fetch users";
          if (err.reqTimedOut) msg += ". Request timed out";
          else if (err.response)
            msg += `. ${("" + err.response.status)[0] === "4" ? "Bad client request" : "Internal server error"}`;

          showErrorMsg(msg);
        })
        .finally(() => setUsersLoading(false));

      setFetchUsers(false);
    }
  }, [fetchUsers]);

  const refetchUsers = useCallback(() => setFetchUsers(true));

  // User Deletion
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState();

  function onDeleteCancelation() {
    setOpenConfirmationModal(false);
  }

  function onDeleteConfirmation() {
    axios_instance
      .delete(`users/${userToDelete.username}`)
      .then(res => {
        if (res.status === 204) {
          showSuccessMsg("User no longer allowed");
          refetchUsers();
        } else throw new Error();
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = `Couldn't revoke ${userToDelete.username}'s access`;
        if (err.reqTimedOut) msg += ". Request timed out";
        else if (err.response) {
          const status = String(err.response.status);
          if (status.startsWith("4")) {
            msg += ". Bad client request";
          } else if (status.startsWith("5")) {
            msg += ". Internal server error";
            refetchUsers();
          }
        }

        showErrorMsg(msg);
      });

    setOpenConfirmationModal(false);
  }

  function getUserDeletionText() {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <b>Name:</b> {userToDelete.name} <br />
        <b>Username:</b> {userToDelete.username} <br />
        <b>Status:</b> {userToDelete.active ? "Active" : "Pending activation"} <br />
      </div>
    );
  }

  // Callback passed to the table to open a user's delete modal
  const launchConfirmationModal = useCallback(user => {
    setUserToDelete(user);
    setOpenConfirmationModal(true);
  });

  return (
    <section className="page" id="SettingsPage">
      <header>
        <h1>Settings</h1>
      </header>

      <div className="content-container">
        <div className="content">
          <div className="settings-category">
            <div className="settings-category-title-container">
              <h2>Authorized users</h2>
              <NewUserBtn refetch={refetchUsers} />
            </div>

            <div className="setting">
              <UsersTable
                data={users}
                loading={usersLoading}
                openDeleteModal={launchConfirmationModal}
              />
            </div>
          </div>
        </div>
      </div>

      {userToDelete && (
        <ConfirmationModal
          open={openConfirmationModal}
          title="Do you wish to revoke the access from the following user?"
          content={getUserDeletionText()}
          onCancel={onDeleteCancelation}
          onConfirm={onDeleteConfirmation}
        />
      )}
    </section>
  );
}

export default SettingsPage;
