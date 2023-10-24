// import React, { useEffect, useState } from "react";
// import "./TabControl.scss";

// const fakeData = [
//   {
//     name: "Cabinet",
//     lstModule: [
//       "./assets/images/BD-MODUL1-CABINET-GLB/BD-MODUL1-1-CABINET.glb",
//       "./assets/images/BD-MODUL1-CABINET-GLB/BD-MODUL1-2-CABINET.glb",
//       "./assets/images/BD-MODUL1-CABINET-GLB/BD-MODUL1-3-CABINET.glb",
//       "./assets/images/BD-MODUL1-CABINET-GLB/BD-MODUL1-4-CABINET.glb",
//       "./assets/images/BD-MODUL1-CABINET-GLB/BD-MODUL1-5-CABINET.glb",
//       "./assets/images/BD-MODUL1-CABINET-GLB/BD-MODUL1-6-CABINET.glb",
//     ],
//   },
//   {
//     name: "Door",
//     lstModule: [
//       "./assets/images/textures/wood_texture1.png",
//       "./assets/images/textures/wood_texture2.png",
//     ],
//   },
// ];

// export default function TabControl({ data, designUnit, currentIndex }) {
//   const [tabActive, setTabActive] = useState(0);

//   const handleChangeTab = (index) => {
//     setTabActive(index);
//   };

//   useEffect(() => {
//     setTabActive(currentIndex + 1);
//   }, [currentIndex]);

//   return (
//     <div className="tabControl">
//       <div className="tabControlPane col-12 d-flex flex-row">
//         {fakeData?.map((item, id) => {
//           return (
//             <div
//               key={id}
//               onClick={() => handleChangeTab(id + 1)}
//               className={
//                 tabActive === id + 1
//                   ? "tabControlIndex tabControlIndex-active"
//                   : "tabControlIndex"
//               }
//             >
//               {item.name}
//             </div>
//           );
//         })}
//       </div>

//       <div className="tabControlContent">
//         {data[tabActive - 1]?.lstModule.map((item,id)=>{
//           return(

//           )
//         })}
//       </div>
//     </div>
//   );
// }
