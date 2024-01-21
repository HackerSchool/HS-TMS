import React from "react";
import MoreOptionsBtn from "./MoreOptionsBtn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function Reminder({ reminder, openEditModal, openDeleteModal, hideOptions = false }) {
  return (
    <div className="reminder">
      <div className="date-title-container">
        <div className="date-flag">{reminder.date}</div>
        <h2>{reminder.title}</h2>
        {!hideOptions && (
          <MoreOptionsBtn
            className="reminder-more-options"
            options={[
              {
                icon: <EditIcon />,
                name: "Edit",
                callback: () => openEditModal(reminder),
              },
              {
                icon: <DeleteIcon />,
                name: "Delete",
                callback: () => openDeleteModal(reminder),
              },
            ]}
          />
        )}
      </div>

      <div className="desc">{reminder.description}</div>
    </div>
  );
}

export default Reminder;
