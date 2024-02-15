import React from "react";
import MoreOptionsBtn from "./MoreOptionsBtn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function Reminder({ reminder, openEditModal, openDeleteModal, hideOptions = false }) {
  const oneDayInMs = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  // reminder is overdue if the day difference between today and the reminder date is greater than 0
  const overdue = Math.floor((new Date() - new Date(reminder.date)) / oneDayInMs) > 0;

  return (
    <div className={`reminder ${overdue ? "overdue" : ""}`}>
      <div className="date-title-container">
        <div className="date-flag">{reminder.date + (overdue ? " (OVERDUE)" : "")}</div>
        <h2>{reminder.title}</h2>
        {!hideOptions && (
          <div className="reminder-more-options">
            <MoreOptionsBtn
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
          </div>
        )}
      </div>

      {reminder.description && <div className="desc">{reminder.description}</div>}
    </div>
  );
}

export default Reminder;
