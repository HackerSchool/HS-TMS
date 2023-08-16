import React from 'react';

function DashboardCard({ headingText = "", mainText, subText = "", icon, green = false, bolderMain = false, smallerMain = false }) {
    return (
        <div className={`dashboard-card ${green && "green"}`}>
            <div className={`dashboard-card-text ${subText && "align-top"}`}>
                <div className="dashboard-card-heading">{headingText}</div>
                <div className={`dashboard-card-main ${bolderMain && "bolder"} ${smallerMain && "smaller"}`}>
                    {mainText}
                    <div className="dashboard-card-sub">{subText}</div>
                </div>
            </div>
            
            <div className="dashboard-card-icon">
                {icon}
            </div>
        </div>
    );
}

export default DashboardCard;