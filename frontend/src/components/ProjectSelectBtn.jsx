import React, { useState, useEffect } from "react";
import DropdownBtn from "./DropdownBtn";
import HandymanIcon from "@mui/icons-material/Handyman";

export default function ProjectSelectBtn({
  projectList,
  projectsLoading,
  transactionsLoading,
  updateProjectID,
  defaultIdx,
}) {
  const [options, setOptions] = useState([{ name: "loading..." }]);

  const onProjectSelection = chosenOption => {
    updateProjectID(chosenOption.id);
  };

  useEffect(() => {
    if (projectsLoading) return;

    const activeProjects = projectList.filter(proj => proj.active);
    if (activeProjects.length > 0) {
      setOptions(activeProjects);
    } else {
      // set id to -1 to signal the ProjectLineChart that there are no
      // projects, so it knows no transactions will be fetched
      setOptions([{ name: "No projects", id: -1 }]);
    }
  }, [projectList, projectsLoading]);

  return (
    <DropdownBtn
      icon={<HandymanIcon />}
      options={options}
      onOptionSelection={onProjectSelection}
      defaultIndex={defaultIdx}
      loading={transactionsLoading}
    />
  );
}
