import React from 'react';
import WorldMap from "react-svg-worldmap";

const data = [
    { country: "cn", value: 1389618778 }, // china
    { country: "in", value: 1311559204 }, // india
    { country: "us", value: 331883986 }, // united states
    { country: "id", value: 264935824 }, // indonesia
    { country: "pk", value: 210797836 }, // pakistan
    { country: "br", value: 210301591 }, // brazil
    { country: "ng", value: 208679114 }, // nigeria
    { country: "bd", value: 161062905 }, // bangladesh
    { country: "ru", value: 141944641 }, // russia
    { country: "mx", value: 127318112 }, // mexico
];

const getStyle = ({
    // countryValue,
    // countryCode,
    // minValue,
    // maxValue,
    // color,
  }) => ({
    // fill: countryCode === "US" ? "blue" : color,
    // fillOpacity: countryValue
    //   ? 0.1 + (1.5 * (countryValue - minValue)) / (maxValue - minValue)
    //   : 0,
   // fillOpacity : 1,
    //   stroke: "rgb(239, 242, 244)",    
    // fill : "#000",
    //strokeWidth: 1,
    // strokeOpacity: 0.2,
    cursor: "pointer",
});

// const width = Math.min( window.innerWidth) - 1020;
// console.log('with', width)
const SvgWorldMap = () => {
    return (
                    
            <WorldMap
                // color="var(--primary)"
                // title="Top 10 Populous Countries"
                // value-suffix="people"
                // size="responsive"
                size="md"
                
                // width={width}
                // height={100}
                data={data}
                styleFunction={getStyle}
                // style={{ width: '500px', height: '300px' }}
            />
        
    );
};

export default SvgWorldMap;