import { Breadcrumb, Cascader, Input, Tooltip } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getListCategoryAction } from "../../store/actions/listCategory.action.js";
import { getListModuleVirtualAction } from "../../store/actions/moduleVirtual.action.js";
import {
  calculatePrice,
  calculateTotalPriceVirtual,
  findUnitPrice,
} from "../../utils/function";
import { VirtualContextDemo } from "../Virtual/VirtualDemo";
import "./VirtualMainOptionDemo.scss";

const { Search } = Input;

export default function VirtualMainOptionDemo({ productId }) {
  const {
    display,
    isLoading,
    listStepDetail,
    lstMaterial,
    lstTexture,
    TypeModule,

    mainModule,
    setMainModule,

    mainSelected,
    setCheckReload,
    setCheckChange,
    setRefreshTotal,

    wallHeight,
    setWallHeight,

    lstTab,
    setLstTab,
    tabOption,
    setTabOption,
    lstSub,
    setLstSub,
    stepDetail,
    setStepDetail,

    trademark,
    trademarkRef,
    recommended,
    setRecommended,

    setIsLoading,
    showProductList,
    setShowProductList,

    setDependentStep,
    typeModuleId,
    setTypeModuleId,

    kitchen,
    currentIndex,
    currentStep,
    setCurrentIndex,
    setCurrentStep,
    setExecutingModule,
  } = useContext(VirtualContextDemo);

  const dispatch = useDispatch();

  const { listCategory } = useSelector((state) => state.listCategory);
  const { listModuleVirtual } = useSelector((state) => state.listModuleVirtual);

  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);
  const timeoutRef = useRef(null);

  const [data, setData] = useState();
  const [filter, setFilter] = useState();
  const [totalPrice, setTotalPrice] = useState(0);

  let breadData = [{ title: "All product" }];

  const [breadItems, setBreadItems] = useState(breadData);

  const [listTexture, setListTexture] = useState();
  const [moduleDetail, setModuleDetail] = useState();
  const [mainLover, setMainLover] = useState(null);
  const [DUBlank, setDUBlank] = useState(null);
  const [bgColor, setBgColor] = useState("#8f999e");
  const [imageUrls, setImageUrls] = useState([]);
  const [listMaterials, setListMaterials] = useState([]);
  const [isSon2k, setIsSon2k] = useState(false);

  let categories = [];
  listCategory?.forEach((item) => {
    let parentItem = {
      label: null,
      value: null,
      children: [],
    };

    let chidrenItem = {
      label: null,
      value: null,
      children: [],
    };

    let listChild = [];

    item.subCategories?.forEach((child) => {
      if (child._id) {
        chidrenItem = {
          label: child.name,
          value: child._id,
          children: [],
        };

        listChild.push(chidrenItem);
      }
    });

    parentItem = {
      ...parentItem,
      label: item.name,
      value: item._id,
      children: listChild,
    };

    categories.push(parentItem);
  });

  const handleChangeMain = async (md) => {
    setCheckChange(true);

    setMainModule({
      module: {
        _id: md._id,
        glbUrl: md.glbUrl,
        name: md.name,
        imgUrl: md.imgsUrl[0],
        size: md.size,
      },
      material: {
        _id: md.materialDefault._id,
        name: md.materialDefault.name,
      },
      texture: {
        _id: md.textureDefault._id,
        name: md.textureDefault.name,
      },
      price: md.price,
    });
  };

  const determinePrice = async (groupId, materialId, measure) => {
    try {
      let result = { price: null, unitPrice: null };
      const trademarkId = trademark.value;
      const unitPrice = findUnitPrice(data, groupId, materialId, trademarkId);

      if (unitPrice) {
        const price = calculatePrice(
          unitPrice.formulaPrice,
          measure.w,
          measure.h,
          measure.d,
          unitPrice.priceValue
        );

        result = { price: price, unitPrice: unitPrice };
        // result = { price: price, unitPrice: unitPrice.priceValue };

        return result;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSearch = (value) => {
    dispatch(getListModuleVirtualAction(null, null, value));

    // value
    //   ? dispatch(getListModuleVirtualAction(null, null, value))
    //   : dispatch(getListModuleVirtualAction(productId));
  };

  const handleChangeCategory = (value) => {
    value !== undefined ? setFilter(value[value.length - 1]) : setFilter(null);
  };

  const handleClickBread = (value) => {
    console.log(value);
  };

  useEffect(() => {
    dispatch(getListCategoryAction(0));
  }, []);

  useEffect(() => {
    setTotalPrice(calculateTotalPriceVirtual(kitchen));
  }, [kitchen]);

  useEffect(() => {
    filter
      ? dispatch(getListModuleVirtualAction(null, filter))
      : dispatch(getListModuleVirtualAction(productId));

    console.log(breadData);
    setBreadItems(breadData);
  }, [filter, productId]);

  return (
    <div className="virtualOption">
      <section>
        <div className="d-flex flex-row justify-content-between align-items-center">
          <div className="d-flex flex-row justify-content-between align-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
            >
              <path
                d="M3 18V16H21V18H3ZM3 13V11H21V13H3ZM3 8V6H21V8H3Z"
                fill="#565E64"
              />
            </svg>

            <Cascader
              className="category"
              options={categories}
              onChange={handleChangeCategory}
              allowClear={false}
              expandTrigger="hover"
              displayRender={(labels) => {
                breadData = [{ title: "All product" }];

                labels.map((lb) => {
                  const breadItem = { title: lb };

                  breadData.push(breadItem);
                });
              }}
            />

            <span className="virtualOption__title ms-3">Product</span>
          </div>

          {/* <i className="expand fas fa-angle-double-left"></i> */}
        </div>

        <div className="d-flex flex-row justify-content-between align-items-center">
          <Search
            className="my-2"
            placeholder="Search"
            allowClear
            onSearch={onSearch}
            style={{
              width: "100%",
            }}
          />

          {/* <Select
            className="ms-3"
            placeholder="Filter"
            style={{ width: 120 }}
            // onChange={handleChange}
            options={[
              { value: "Filter1", label: "Filter 1" },
              { value: "Filter2", label: "Filter 2" },
              { value: "Filter3", label: "Filter 3" },
            ]}
          /> */}
        </div>

        <div className="breadcrumb-container">
          <Breadcrumb
            separator=">"
            items={breadItems}
            onClick={handleClickBread}
          />
        </div>
      </section>

      <div className="line"></div>

      <section className="module-container">
        <div className="module-option">
          {listModuleVirtual?.map((item, index) => (
            <div
              key={index}
              id={index}
              className="col-12 col-md-6 col-lg-4 px-1 pb-3"
            >
              <div className="module-card h-100">
                <div
                  className="module-item"
                  disabled={isLoading}
                  onClick={async () => {
                    handleChangeMain(item);
                    setIsLoading(false);
                  }}
                >
                  <div className="module-item__overlay">
                    <i className="far fa-plus" title="Add"></i>
                  </div>

                  <img
                    src={`${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${item.imgsUrl[0]}`}
                    alt={`${item.name}`}
                    className="w-100"
                  />
                </div>

                <div className="info">
                  <span className="info__name">{item.name}</span>

                  <div style={{ height: "fit-content" }}>
                    <span className="info__size">
                      {item?.size?.width}x{item?.size?.height}x
                      {item?.size?.depth} mm
                    </span>

                    <Tooltip
                      placement="topLeft"
                      title={item?.description}
                      arrow={true}
                    >
                      <span className="info__desc">{item?.description}</span>
                    </Tooltip>

                    <span className="info__price">
                      {item?.price?.toLocaleString()}

                      <span className="info__price__sign">đ</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="price-container d-flex flex-row justify-content-between align-items-center">
        <div>
          <span className="price-text">Total: </span>
          <span className="price-num">{totalPrice?.toLocaleString()}</span>
          <span className="price-text"> đ</span>
        </div>

        <button
          className="btn-prod-list"
          onClick={() => {
            setShowProductList(!showProductList);
          }}
        >
          <i className="far fa-shopping-basket me-2"></i>
          Product List
        </button>
      </section>
    </div>
  );
}
