import { useContext, useEffect, useRef, useState } from "react";
import { KitchenContext } from "../Design/Design";
// import { VirtualContext } from "../Virtual/Virtual";
import { toast } from "react-hot-toast";
import {
  calculatePrice,
  cloneModuleGLTF,
  getPrice,
  handleChangeTexture,
  handleDeleteTexture,
} from "../../utils/function";
import { Accordion } from "react-bootstrap";
import {
  getListMaterial,
  getListTexture,
  getModuleDetail,
  getSubModuleDetail,
} from "../../utils/getData";
import "./MainOption.scss";

export default function SubOption({ data }) {
  const {
    display,
    isLoading,
    stepDetail,
    stepEditDetail,
    lstMaterial,
    lstTexture,
    TypeModule,

    indexSub,
    setIndexSub,

    mainModule,
    setMainModule,
    subModule,
    setSubModule,
    subNull,
    checkReload,
    setCheckReload,
    setLstSub,
    baseLstSub,
    setBaseLstSub,
    infoTab,
    setInfoTab,
    baseInfoTab,
    setBaseInfoTab,

    lstTab,
    setLstTab,
    baseLstTab,
    setBaseLstTab,
    tabOption,
    setTabOption,
    lstSub,

    trademark,
    trademarkRef,
    subRecommended,
    setSubRecommended,

    kitchen,

    currentIndex,
    currentStep,
  } = useContext(KitchenContext);

  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);
  const [listTexture, setListTexture] = useState();
  const [moduleDetail, setModuleDetail] = useState();
  const [submoduleDetail, setSubmoduleDetail] = useState();
  const [bgColor, setBgColor] = useState("#8f999e");
  const [imageUrls, setImageUrls] = useState([]);
  const [isSon2k, setIsSon2k] = useState(false);

  const addImageUrl = (url) => {
    let updatedImageUrls = [...imageUrls];

    if (updatedImageUrls.length >= 12) {
      updatedImageUrls.shift();
    }

    updatedImageUrls.push(url);

    setImageUrls(updatedImageUrls);
    localStorage.setItem("imageUrls", JSON.stringify(updatedImageUrls));
  };

  const handleWheelScroll = (e, curRef) => {
    const container = curRef.current;
    if (e.deltaY > 0) {
      container.scrollLeft += e.deltaY / 5;
    } else {
      container.scrollLeft -= Math.abs(e.deltaY / 5);
    }
  };

  const findUnitPrice = (groupId, materialId, trademarkId) => {
    if (materialId) {
      let unitPrice = { formulaPrice: null, priceValue: null };

      const listPrices = lstSub[indexSub].listModule.find(
        (group) => group._id === groupId
      )?.price;

      if (listPrices) {
        const priceValue = listPrices.prices.find(
          (item) =>
            (item.trademark._id === trademarkId &&
              item.material._id == materialId) ||
            (!item.trademarkId && item.materialId == materialId)
        )?.priceValue;

        unitPrice = {
          formulaPrice: listPrices.formulaPrice,
          priceValue: priceValue || null,
        };
      }

      return unitPrice;
    }
  };

  const determinePrice = async (groupId, material, measure) => {
    console.log(material);
    try {
      let result = { price: null, unitPrice: null };
      const trademarkId = trademark.value;
      let unitPrice = { formulaPrice: null, priceValue: null };
      unitPrice = {
        formulaPrice: material.formulaPrice,
        priceValue: material.priceValue,
        priceUser: material.priceUser,
      };
      console.log(groupId);
      console.log(material);
      console.log(unitPrice);
      if (unitPrice) {
        const price = calculatePrice(
          unitPrice.formulaPrice,
          measure.w,
          measure.h,
          measure.d,
          unitPrice.priceValue
        );
        result.price = price;
        result.unitPrice = unitPrice;
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderMaterialItem = (material, iconUrl, checked) => {
    return (
      <div
        id={material._id}
        key={material._id}
        className={checked ? "material-item active" : "material-item"}
        style={{
          "--url": `url(${process.env.REACT_APP_URL}uploads/images/icons/${iconUrl})`,
        }}
        title={material.name}
      >
        <p>{material.name}</p>

        <div className="input-box">
          <input
            disabled={isLoading}
            name="door-material"
            type="radio"
            value={iconUrl}
            checked={checked}
            onChange={async () => {
              setCheckReload(false);
              // const resultMaterial = await getListTexture(
              //   material._id,
              //   trademark.value
              // );
              // setListTexture(resultMaterial);

              if (
                kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  indexSub
                ]?.module?.glbUrl &&
                kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  indexSub
                ]?.module?.glbUrl !== null
              ) {
                let modulePrice;
                modulePrice = await determinePrice(
                  kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                    indexSub
                  ].groupId,
                  // kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  //   indexSub
                  // ].priceId,
                  material,
                  mainModule.measure
                );
                console.log(material);
                setSubRecommended({
                  ...subRecommended,
                  material: {
                    _id: material._id,
                    name: material.name,
                    priceUser: material.priceUser,
                    icon: iconUrl,
                    metalness: material?.mvr?.metalness,
                    roughness: material?.mvr?.roughness,
                    formulaPrice: material?.formulaPrice,
                    priceValue: material?.priceValue,
                  },
                  texture: {
                    _id: null,
                    name: null,
                    iconUrl: null,
                    imgUrl: null,
                  },
                });

                const glbObject = display.scene.getObjectByProperty(
                  "uuid",
                  subModule?.gltf?.uuid
                );

                const subObject = glbObject.getObjectByName("DOOR");
                //handleChangeTexture(subObject, "TEXTURE_1700309678845.jpg");
                handleDeleteTexture(subObject, 0, 1);

                localStorage.setItem(
                  "recommendedSub",
                  JSON.stringify({
                    ...subRecommended,
                    material: {
                      _id: material._id,
                      name: material.name,
                      icon: iconUrl,
                      metalness: material?.mvr?.metalness,
                      roughness: material?.mvr?.roughness,
                    },
                    texture: {
                      _id: null,
                      name: null,
                      iconUrl: null,
                      imgUrl: null,
                    },
                  })
                );

                setSubModule({
                  ...subModule,
                  material: {
                    _id: material._id,
                    name: material.name,
                    priceUser: material.priceUser,
                    customColor: material.customColor,
                    icon: iconUrl,
                    metalness: material?.mvr?.metalness,
                    roughness: material?.mvr?.roughness,
                  },
                  texture: {
                    _id: null,
                    name: null,
                    iconUrl: null,
                    imgUrl: null,
                  },
                  price: modulePrice?.price,
                  unitPrice: modulePrice?.unitPrice,
                });
              } else {
                toast.error("Bạn cần chọn module trước khi chọn vật liệu.");
              }
            }}
            onClick={() => {
              if (
                subModule?.material?.icon === iconUrl &&
                subModule?.module?.glbUrl
              ) {
                const glbObject = display.scene.getObjectByProperty(
                  "uuid",
                  subModule?.gltf?.uuid
                );

                const subObject = glbObject.getObjectByName("DOOR");
                handleDeleteTexture(subObject, 0, 1);

                setSubModule({
                  ...subModule,
                  material: {
                    _id: null,
                    name: null,
                    icon: null,
                    customColor: null,
                    metalness: 0,
                    roughness: 1,
                  },
                  texture: {
                    _id: null,
                    name: null,
                    iconUrl: null,
                    imgUrl: null,
                  },
                  price: null,
                });
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderTextureItem = (texture, imgUrl, iconUrl, checked) => {
    return (
      <div
        id={texture._id}
        key={texture._id}
        className={checked ? "texture-item active" : "texture-item"}
        style={{
          "--url": `url(${process.env.REACT_APP_URL}uploads/images/icons/${iconUrl})`,
        }}
        title={texture.name}
      >
        <input
          name="door-texture"
          type="radio"
          value={imgUrl}
          checked={checked}
          onChange={() => {
            setCheckReload(false);

            if (
              subModule?.module?.glbUrl &&
              subModule?.module?.glbUrl !== null &&
              subModule?.material?.icon
            ) {
              setSubRecommended({
                ...subRecommended,
                texture: {
                  _id: texture._id,
                  name: texture.name,
                  iconUrl: iconUrl,
                  imgUrl: imgUrl,
                },
              });

              localStorage.setItem(
                "recommendedSub",
                JSON.stringify({
                  ...subRecommended,
                  texture: {
                    _id: texture._id,
                    name: texture.name,
                    iconUrl: iconUrl,
                    imgUrl: imgUrl,
                  },
                })
              );

              setSubModule({
                ...subModule,
                texture: {
                  _id: texture._id,
                  name: texture.name,
                  iconUrl: iconUrl,
                  imgUrl: imgUrl,
                },
              });
            } else {
              if (!subModule?.module?.glbUrl) {
                toast.error(
                  "Bạn cần chọn module và vật liệu trước khi chọn màu sắc."
                );
              } else {
                toast.error("Bạn cần chọn vật liệu trước khi chọn màu sắc.");
              }
            }
          }}
          // onClick={() => {
          //   if (
          //     subModule?.subTexture === imgUrl &&
          //     subModule?.subType &&
          //     subModule?.subMaterial
          //   ) {
          //     setSubModule({
          //       ...subModule,
          //       subTextureIdx: null,
          //       subTextureIcon: null,
          //       subTextureName: null,
          //       subTexture: null,
          //     });
          //   }
          // }}
        />
      </div>
    );
  };

  const [tempBgColor, setTempBgColor] = useState(bgColor);

  const handleTempBgColorChange = (event) => {
    setTempBgColor(event.target.value);
  };

  const handleBgColorChange = () => {
    setBgColor(tempBgColor);
    addImageUrl(tempBgColor);
    setSubModule({
      ...subModule,
      texture: {
        _id: tempBgColor,
        name: tempBgColor,
        iconUrl: tempBgColor,
        imgUrl: tempBgColor,
      },
    });
    setSubRecommended({
      ...subRecommended,
      texture: {
        _id: tempBgColor,
        name: tempBgColor,
        iconUrl: tempBgColor,
        imgUrl: tempBgColor,
      },
    });
    localStorage.setItem(
      "recommendedSub",
      JSON.stringify({
        ...subRecommended,
        texture: {
          _id: tempBgColor,
          name: tempBgColor,
          iconUrl: tempBgColor,
          imgUrl: tempBgColor,
        },
      })
    );
  };

  const handleImageClick = (url) => {
    setBgColor(url);
    setSubModule({
      ...subModule,
      texture: {
        _id: url,
        name: url,
        iconUrl: url,
        imgUrl: url,
      },
    });
    setSubRecommended({
      ...subRecommended,
      texture: {
        _id: url,
        name: url,
        iconUrl: url,
        imgUrl: url,
      },
    });
    localStorage.setItem(
      "recommendedSub",
      JSON.stringify({
        ...subRecommended,
        texture: {
          _id: url,
          name: url,
          iconUrl: url,
          imgUrl: url,
        },
      })
    );
  };

  const showSon2k = () => {
    return (
      <div className="colorPicker-son2k">
        <input
          type="color"
          className="colorPicker-2k"
          id="colorPicker"
          value={bgColor}
          onChange={(e) => {
            handleTempBgColorChange(e);
          }}
          onBlur={handleBgColorChange}
        />
        <div className="imageList">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="color-box"
              style={{
                backgroundColor: url,
                width: "15px",
                height: "15px",
                marginRight: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
              }}
              onClick={() => handleImageClick(url)}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const storedImageUrls = localStorage.getItem("imageUrls");
    if (storedImageUrls) {
      setImageUrls(JSON.parse(storedImageUrls));
    }
  }, []);

  useEffect(() => {
    const fetchModuleDetail = async () => {
      // if (subModule?.module && !moduleDetail) {
      if (tabOption !== "0") {
        let sub;
        if (subModule && subModule?.module !== null) {
          sub = subModule;
        } else {
          sub =
            kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub];
        }

        let resultSubModuleDetail;
        if (
          sub
          // (sub?.module?.glbUrl !==
          //   kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          //     ?.module?.glbUrl ||
          //   kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          //     ?.module?.glbUrl)
        ) {
          const resultSubModule = data?.filter(
            (item) => item._id === sub?.groupId
          );

          console.log(data);
          console.log(resultSubModule);

          if (data && resultSubModule && resultSubModule[0]?._id) {
            resultSubModuleDetail = await getListMaterial(
              resultSubModule[0]?._id,
              trademark?.value
            );
          }
          console.log(resultSubModuleDetail);

          setModuleDetail(resultSubModuleDetail);
        }

        // if (subModule?.material?._id && !subModule?.texture?._id) {
        if (subModule?.material?._id && resultSubModuleDetail) {
          // const resultMaterial = moduleDetail.filter(item => item._id === subModule?.material._id)
          const resultMaterial = resultSubModuleDetail?.filter(
            (item) => item._id === subModule?.material._id
          );
          if (
            subModule?.material?.customColor === true ||
            (resultMaterial &&
              resultMaterial[0] &&
              resultMaterial[0]?.customColor === true)
          ) {
            setIsSon2k(true);
          } else {
            setIsSon2k(false);
          }

          setListTexture(resultMaterial[0]?.listTexture);
        }
      }
    };

    fetchModuleDetail();
  }, [subModule, tabOption]);

  return (
    <div className="subOption">
      <section className="module-container">
        <p className="title-control">Kiểu dáng</p>

        <div className="module-option">
          {data?.map((group, index) => {
            return (
              <Accordion key={group._id} defaultActiveKey={index}>
                <Accordion.Item eventKey={index}>
                  <Accordion.Header>{group.name}</Accordion.Header>
                  <Accordion.Body>
                    <div className="module-option">
                      {group.items.map((door, id) => {
                        const glb = door.glbUrl;
                        const subModuleSelected =
                          kitchen[currentStep].lstModule[currentIndex]
                            .lstSubModule[indexSub];
                        const checked =
                          subModuleSelected?.module?._id === door._id;

                        return (
                          <div
                            key={id}
                            className="col-6 col-md-4 col-xl-3"
                            style={{
                              "--url": `url(${process.env.REACT_APP_URL}uploads/images/icons/${door.imgUrl})`,
                              padding: "4px",
                            }}
                            title={door.name}
                          >
                            <div
                              className={
                                checked ? "module-item active" : "module-item"
                              }
                            >
                              <input
                                disabled={isLoading}
                                name="door"
                                type="radio"
                                value={glb}
                                checked={checked}
                                onChange={async () => {
                                  setCheckReload(false);

                                  const isMaterialExists =
                                    group.materialIds?.some(
                                      (materialId) =>
                                        materialId ===
                                        subRecommended?.material?._id
                                    );

                                  const resultSubModuleDetail =
                                    await getModuleDetail(
                                      door._id,
                                      trademark?.value
                                    );

                                  if (
                                    resultSubModuleDetail?.listSubmodule
                                      .length >= 0 &&
                                    resultSubModuleDetail?.subSub === false &&
                                    subModuleSelected?.require !== true
                                  ) {
                                    setInfoTab(() => {
                                      const newItems =
                                        resultSubModuleDetail?.listSubmodule?.map(
                                          (item) => {
                                            return {
                                              pId: door._id,
                                              name: item.nameCollection,
                                              _id: item._id,
                                            };
                                          }
                                        ) || [];

                                      const updatedInfotab = [
                                        ...baseInfoTab,
                                        ...newItems,
                                      ];

                                      return updatedInfotab;
                                    });

                                    // if (subModuleSelected?.require !== true)
                                    setLstTab(() => {
                                      const newItems =
                                        resultSubModuleDetail?.listSubmodule?.map(
                                          (item) => item.nameCollection
                                        ) || [];
                                      const updatedLstTab = [
                                        ...baseLstTab,
                                        ...newItems,
                                      ];
                                      return updatedLstTab;
                                    });
                                  }

                                  if (
                                    isMaterialExists &&
                                    subRecommended.material !== null
                                  ) {
                                    let modulePrice;

                                    modulePrice = await determinePrice(
                                      group._id,
                                      // group.price,
                                      subRecommended.material,
                                      mainModule.measure
                                    );
                                    // sub recomment
                                    setSubModule({
                                      ...subModule,
                                      module: {
                                        _id: door._id,
                                        glbUrl: glb,
                                        type: door.type,
                                        name: door.name,
                                        imgUrl: door.imgUrl,
                                        indexDesign: door.indexDesign,
                                        subSub: door.subSub,
                                        infoMeasure: door?.infoMeasure,
                                        require: door.require,
                                        keepMaterial:
                                          resultSubModuleDetail.keepMaterial,
                                      },
                                      type:
                                        lstTab[tabOption]?.name ||
                                        lstTab[tabOption],
                                      material: subRecommended.material,
                                      texture: subRecommended.texture,
                                      measure:
                                        kitchen[currentStep].lstModule[
                                          currentIndex
                                        ].mainModule.measure,
                                      groupId: group._id,
                                      priceId: group.price,
                                      price: door.price || modulePrice?.price,
                                      unitPrice: modulePrice?.unitPrice,
                                    });
                                  } else {
                                    // load không recomment
                                    setSubModule({
                                      ...subModule,
                                      module: {
                                        _id: door._id,
                                        glbUrl: glb,
                                        type: door.type,
                                        name: door.name,
                                        imgUrl: door.imgUrl,
                                        indexDesign: door.indexDesign,
                                        infoMeasure: door?.infoMeasure,
                                        subSub: door.subSub,
                                        require: door.require,
                                        keepMaterial:
                                          resultSubModuleDetail.keepMaterial,
                                      },
                                      type:
                                        lstTab[tabOption]?.name ||
                                        lstTab[tabOption],
                                      material: null,
                                      texture: null,
                                      measure:
                                        kitchen[currentStep].lstModule[
                                          currentIndex
                                        ].mainModule.measure,
                                      groupId: group._id,
                                      priceId: group.price,
                                      price: door.price || null,
                                    });
                                  }
                                }}
                                onClick={async () => {
                                  if (
                                    subModuleSelected?.module?.glbUrl === glb
                                  ) {
                                    const resultSubModuleDetail =
                                      await getModuleDetail(
                                        door._id,
                                        trademark?.value
                                      );

                                    if (
                                      resultSubModuleDetail?.listSubmodule
                                        .length >= 0 &&
                                      resultSubModuleDetail?.subSub === false &&
                                      subModuleSelected?.require !== true
                                    ) {
                                      setInfoTab(() => {
                                        const newItems = [];

                                        const updatedInfotab = [
                                          ...baseInfoTab,
                                          ...newItems,
                                        ];

                                        return updatedInfotab;
                                      });

                                      // if (subModuleSelected?.require !== true)
                                      setLstTab(() => {
                                        const newItems = [];

                                        const updatedLstTab = [
                                          ...baseLstTab,
                                          ...newItems,
                                        ];
                                        return updatedLstTab;
                                      });
                                    }

                                    if (!subModuleSelected?.require) {
                                      if (
                                        subModuleSelected?.module?.type === 7
                                      ) {
                                        const subNullType = {
                                          type: 7,
                                          module: null,
                                          material: null,
                                          texture: null,
                                          price: 0,
                                        };
                                        setSubModule(subNullType);
                                      } else {
                                        const moduleTemp = {
                                          subSub:
                                            subModuleSelected?.module.subSub,
                                        };
                                        const subNullType = {
                                          type: "sub",
                                          module: moduleTemp,
                                          material: null,
                                          texture: null,
                                          price: 0,
                                        };
                                        setSubModule(subNullType);
                                      }
                                    } else {
                                      toast.error(
                                        `${subModuleSelected.type} là thiết kế bắt buộc cho nội thất này`
                                      );
                                    }
                                  }
                                }}
                              />
                            </div>

                            <div className="info">
                              <span className="info__name">{door.name}</span>
                              {door.subSub !== true && (
                                <span className="info__DU">
                                  {/* {door.indexDesign > 1
                                  ? `${door.indexDesign}★`
                                  : "★"} */}

                                  {door.indexDesign > 1
                                    ? `${
                                        Number(group?.actualSize?.width) ||
                                        `${300 * door.indexDesign} - ${
                                          500 * door.indexDesign
                                        }`
                                      }mm`
                                    : "300 - 500mm"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })}
        </div>
      </section>

      <section className="materialTexture-container">
        <p className="title-control">Vật liệu và màu sắc</p>
        <div
          className="material-option"
          ref={containerRef1}
          onWheel={(e) => handleWheelScroll(e, containerRef1)}
        >
          {kitchen[currentStep].lstModule[currentIndex].lstSubModule[
            indexSub
          ] &&
          kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
            ?.module !== null
            ? moduleDetail?.map((material) => {
                const iconUrl = material._id;
                const checked =
                  kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                    indexSub
                  ]?.material?.icon === iconUrl;

                return renderMaterialItem(material, iconUrl, checked);
              })
            : lstMaterial?.map((material) => {
                const iconUrl = material.imgUrl;
                const checked = false;

                return renderMaterialItem(material, iconUrl, checked);
              })}
        </div>

        <div className="w-100">
          <div
            className="texture-option"
            ref={containerRef2}
            onWheel={(e) => handleWheelScroll(e, containerRef2)}
          >
            {kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
              ?.module !== null &&
            kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
              ?.module?._id !== null &&
            kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
              ?.material &&
            listTexture?.length > 0
              ? listTexture?.map((texture) => {
                  const imgUrl = texture.imgUrl;
                  const iconUrl = texture.iconUrl;
                  const checked =
                    kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                      indexSub
                    ]?.texture?.imgUrl === imgUrl;

                  return renderTextureItem(texture, imgUrl, iconUrl, checked);
                })
              : isSon2k === true &&
                kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  indexSub
                ]?.module !== null &&
                kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  indexSub
                ]?.module?._id !== null &&
                kitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  indexSub
                ]?.material
              ? showSon2k()
              : lstTexture?.map((texture) => {
                  const imgUrl = texture.imgUrl;
                  const iconUrl = texture.iconUrl;
                  const checked = false;

                  return renderTextureItem(texture, imgUrl, iconUrl, checked);
                })}
          </div>
        </div>
      </section>
    </div>
  );
}
