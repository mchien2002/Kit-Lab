import Search from "antd/es/input/Search";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { VirtualContextDemo } from "../Virtual/VirtualDemo.jsx";
import "./MoreTexture.scss";
import { handleChangeTextureVirtual } from "../../utils/function";
import { useEffect } from "react";

export default function MoreTexture({ module, setShowMoreTexture }) {
  const {
    display,
    isLoading,
    mainModule,
    setMainModule,
    setCheckChange,
    setIsLoading,
    kitchen,
    setKitchen,
    modelClicked,
    setModelClicked,
  } = useContext(VirtualContextDemo);

  const { listTextureVirtual } = useSelector(
    (state) => state.listTextureVirtual
  );

  const [listTextureMore, setListTextureMore] = useState(listTextureVirtual);

  const handleChangeOption = (texture) => {
    // setTexture(texture.id);

    const mainObject =
      kitchen[module.userData.index].gltf.getObjectByName("MAIN");

    handleChangeTextureVirtual(mainObject, texture.imgUrl, 1, 0.8);
  };

  const filterItemsByText = (list, text) => {
    return list.filter((texture) => {
      return texture.name.toLowerCase().includes(text.toLowerCase());
    });
  };

  const onSearch = (e) => {
    const result = filterItemsByText(listTextureVirtual, e.target.value);

    setListTextureMore(result);
  };

  // useEffect(() => {
  //   setListTextureMore(listTextureVirtual);
  //   console.log(listTextureVirtual);
  // }, [listTextureVirtual]);

  return (
    <div className="more-texture">
      <section>
        <div className="d-flex flex-row justify-content-between">
          <div>
            <span className="more-texture__heading">Texture</span>
            <span className="more-texture__name">
              {kitchen[module?.userData?.index]?.texture?.name}
            </span>
          </div>

          <i
            className="more-texture__close far fa-times"
            onClick={() => {
              setShowMoreTexture(false);
            }}
          ></i>
        </div>

        <Search
          className="my-2"
          placeholder="Search"
          allowClear
          // onSearch={onSearch}
          onChange={onSearch}
          style={{
            width: "100%",
          }}
        />
      </section>

      <section className="more-texture__main">
        <div className="col-12 d-flex flex-wrap" style={{ gap: "6px" }}>
          {listTextureMore?.map((tItem) => {
            const checked =
              kitchen[module?.userData?.index]?.texture?._id === tItem._id;

            return (
              <div
                key={tItem._id}
                className={checked ? "texture-item active" : "texture-item"}
              >
                <div
                  style={{
                    "--url": `url(${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${tItem.iconUrl})`,
                  }}
                >
                  <input
                    disabled={isLoading}
                    name="module-texture"
                    type="radio"
                    value={tItem.imgUrl}
                    checked={checked}
                    onChange={() => {
                      handleChangeOption(tItem);

                      let newKitchen = [...kitchen];

                      newKitchen[module?.userData?.index].texture = {
                        _id: tItem._id,
                        name: tItem.name,
                        iconUrl: tItem.iconUrl,
                        imgUrl: tItem.imgUrl,
                      };

                      setKitchen(newKitchen);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
