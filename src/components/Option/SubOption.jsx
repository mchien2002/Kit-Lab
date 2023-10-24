import { useContext, useRef, useState } from "react";
import { KitchenContext } from "../Design/Design";
import { toast } from "react-hot-toast";
import { getPrice } from "../../utils/function";

export default function SubOption({ data }) {
  const {
    display,
    isLoading,
    stepDetail,
    stepEditDetail,
    lstMaterial,
    lstTexture,
    modelClicked,
    modelSelected,
    currentDU,
    showBoxSize,
    showNextStep,

    dependentStep,
    setDependentStep,
    typeModuleId,
    setTypeModuleId,
    indexSub,
    setIndexSub,

    mainModule,
    setMainModule,
    subModule,
    setSubModule,
    subNull,

    setCurrentDU,
    setModelClicked,
    setModelSelected,
    setCurrentIndex,
    setCurrentStep,
    setShowBoxSize,
    setShowNextStep,

    setCabinetLatest,
    setDoorLatest,
    setIsLoading,

    kitchen,

    currentIndex,
    currentStep,
    executingIndex,
    executingStep,
    executingModule,
    setExecutingModule,

    tabSelected,
    setTabSelected,

    handleComplete,
    handleSetNullModule,

    handleZoomIn,
    handleZoomOut,
  } = useContext(KitchenContext);

  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);

  const handleWheelScroll = (e, curRef) => {
    const container = curRef.current;
    if (e.deltaY > 0) {
      container.scrollLeft += e.deltaY / 5;
    } else {
      container.scrollLeft -= Math.abs(e.deltaY / 5);
    }
  };

  const determinePrice = async (typeModuleId, materialId, indexDesign) => {
    try {
      let measure = 425;
      const trademarkId = "64c8ae2b3ac796ed6e28e18c";

      // if (context.currentStep === 0 || context.currentStep === 2) {
      //   measure = context.baseMeasureRight;
      // } else if (context.currentStep === 1 || context.currentStep === 3) {
      //   measure = context.baseMeasureLeft;
      // }

      const price = await getPrice(typeModuleId, 0, materialId, trademarkId);

      const calculatedPrice = (measure * indexDesign * price) / 1000;

      return calculatedPrice;
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
        style={{ "--url": `url(${iconUrl})` }}
        title={material.name}
      >
        <p>{material.name}</p>

        <input
          disabled={isLoading}
          name="door-material"
          type="radio"
          value={iconUrl}
          checked={checked}
          onChange={async () => {
            if (
              subModule?.module?.glbUrl &&
              subModule?.module?.glbUrl !== null
            ) {
              const price = await determinePrice(
                typeModuleId,
                material._id,
                mainModule.indexDesign
              );

              setSubModule({
                ...subModule,
                material: {
                  _id: material._id,
                  name: material.name,
                  icon: iconUrl,
                },
                texture: {
                  _id: null,
                  name: null,
                  icon: null,
                  imgUrl: null,
                },
                price: price,
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
              setSubModule({
                ...subModule,
                material: {
                  _id: null,
                  name: null,
                  icon: null,
                },
                texture: {
                  _id: null,
                  name: null,
                  icon: null,
                  imgUrl: null,
                },
              });
            }
          }}
        />
      </div>
    );
  };

  const renderTextureItem = (texture, imgUrl, iconUrl, checked) => {
    return (
      <div
        id={texture._id}
        key={texture._id}
        className={checked ? "texture-item active" : "texture-item"}
        style={{ "--url": `url(${iconUrl})` }}
        title={texture.name}
      >
        <input
          name="door-texture"
          type="radio"
          value={imgUrl}
          checked={checked}
          onChange={() => {
            if (
              subModule?.module?.glbUrl &&
              subModule?.module?.glbUrl !== null &&
              subModule?.material?.icon
            ) {
              setSubModule({
                ...subModule,
                texture: {
                  _id: texture._id,
                  name: texture.name,
                  icon: iconUrl,
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

  return (
    <div className="subOption">
      <section className="module-container">
        <p className="title-control">Kiểu dáng</p>
        <div className="module-option col-12">
          {data?.listModule?.map((door, id) => {
            const glb = door.glbUrl;
            const subModuleSelected = kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
            const checked = subModuleSelected?.module?._id === door._id;

            return (
              <div
                key={id}
                className="col-4 col-xl-3"
                style={{
                  "--url": `url(https://api.lanha.vn/profiles/icon-img/${door.imgUrl})`,
                  padding: "4px",
                }}
                title={door.name}
              >
                <div className={checked ? "module-item active" : "module-item"}>
                  <input
                    disabled={isLoading}
                    name="door"
                    type="radio"
                    value={glb}
                    checked={checked}
                    onChange={() => {
                      setSubModule({
                        ...subModule,
                        module: {
                          _id: door._id,
                          glbUrl: glb,
                          type: door.type,
                          name: door.name,
                          icon: door.imgUrl,
                          indexDesign: door.indexDesign,
                        },
                      });
                    }}
                    onClick={() => {
                      if (subModuleSelected?.module?.glbUrl === glb) {
                        if (!data.require) {
                          setSubModule(subNull);
                        } else {
                          toast.error(`${data.nameCollection} là thiết kế bắt buộc cho nội thất này`)
                        }
                      }
                    }}
                  />
                </div>

                <div className="info">
                  <span className="info__name">{door.name}</span>
                  <span className="info__DU">
                    {door.indexDesign > 1 ? `${door.indexDesign}★` : "★"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="materialTexture-container">
        <p className="title-control">Vật liệu và màu sắc</p>
        <div
          className="materialTexture-option"
          ref={containerRef1}
          onWheel={(e) => handleWheelScroll(e, containerRef1)}
        >
          {subModule?.module !== null && subModule?.module?._id !== null
            ? data?.listModule
              ?.find((smd) => smd._id === subModule?.module?._id)
              ?.listMaterial?.map((material) => {
                const iconUrl = `https://api.lanha.vn/profiles/icon-img/${material.imgUrl}`;
                const checked = subModule?.material?.icon === iconUrl;

                return renderMaterialItem(material, iconUrl, checked);
              })
            : lstMaterial.map((material) => {
              const iconUrl = `https://api.lanha.vn/profiles/icon-img/${material.imgUrl}`;
              const checked = subModule?.material?.icon === iconUrl;

              return renderMaterialItem(material, iconUrl, checked);
            })}
        </div>

        <div
          className="materialTexture-option"
          ref={containerRef2}
          onWheel={(e) => handleWheelScroll(e, containerRef2)}
        >
          {subModule?.module !== null &&
            subModule?.module?._id !== null &&
            subModule?.material?._id
            ? data?.listModule
              ?.find((smd) => smd._id === subModule?.module?._id)
              ?.listMaterial?.find(
                (smd) => smd._id === subModule?.material?._id
              )
              ?.listTexture.map((texture) => {
                const imgUrl = `https://api.lanha.vn/profiles/texture-img/${texture.imgUrl}`;
                const iconUrl = `https://api.lanha.vn/profiles/icon-img/${texture.iconUrl}`;
                const checked = subModule?.texture?.imgUrl === imgUrl;

                return renderTextureItem(texture, imgUrl, iconUrl, checked);
              })
            : lstTexture.map((texture) => {
              const imgUrl = `https://api.lanha.vn/profiles/texture-img/${texture.imgUrl}`;
              const iconUrl = `https://api.lanha.vn/profiles/icon-img/${texture.iconUrl}`;
              const checked = subModule?.texture?.imgUrl === imgUrl;

              return renderTextureItem(texture, imgUrl, iconUrl, checked);
            })}
        </div>
      </section>
    </div>
  );
}
