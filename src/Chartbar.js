import React from 'react';

function Chartbar(props) {
    const barstyle = {
        height: props.amount/1000000 + 'px'
    }
    return (
        <>
            <div className="chart-bar">
                { props.amount }
                <div className="bar" style={barstyle}></div>
                { props.name }
            </div>
        </>
    );
}

export default Chartbar;