import React from 'react';

function Reminder({ date, title, desc }) {
    return (
        <div className="reminder">
            <div className="date-title-container">
                <div className="date-flag">{date}</div>
                <h2>{title}</h2>
            </div>

            <div className="desc">{desc}</div>
        </div>
    );
}

export default Reminder;