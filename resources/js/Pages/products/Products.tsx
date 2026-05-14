import MainPanelLayout from "@/components/MainPanelLayout";
import { useForm, usePage, Link } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { Product } from "./types";
import { PageProps } from "@/types/PageProp.type";
import { Paginator } from "@/types/Paginator.type";
import FlashAlert from "@/components/alert/FlashAlert";

type ProductsPageProps = {
   store_id: number;
   products: Paginator<Product>;
};

const ITEM_TYPES = {
   PER_ITEM: "per_item",
   WHOLE_ITEM: "whole_item",
} as const;

const Products = ({ store_id, products }: ProductsPageProps) => {
   const { flash } = usePage<PageProps>().props;
   const [tagInput, setTagInput] = useState("");
   const { data, setData, post, processing, errors, clearErrors, reset } =
      useForm({
         product_uuid: "",
         store_id: store_id,
         name: "",
         brand: "",
         description: "",
         stock_quantity: "",
         cost_price: "",
         selling_price: "",
         tags: [] as string[],
      });

   const [mode, setMode] = useState<"add" | "edit">("add");
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [itemType, setItemType] = useState<
      (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES]
   >(ITEM_TYPES.PER_ITEM);
   const [wholeItemCostPrice, setWholeItemCostPrice] = useState<string>("");
   const [pieces, setPieces] = useState<string>("");

   // Reinitialize FlyonUI when component mounts
   // Without this, the modal won't work when navigating to this page via Inertia links
   useEffect(() => {
      // Access the global FlyonUI/HSStaticMethods
      if (window.HSStaticMethods) {
         window.HSStaticMethods.autoInit();
      }
   }, []);

   const addTag = () => {
      const value = tagInput.trim().toLowerCase();

      if (!value) return;

      if (!data.tags.includes(value)) {
         setData("tags", [...data.tags, value]);
      }

      setTagInput("");
   };

   const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
         e.preventDefault();
         addTag();
      }
   };

   const removeTag = (tagToRemove: string) => {
      setData(
         "tags",
         data.tags.filter((tag) => tag !== tagToRemove),
      );
   };

   const saveProduct = (e: React.SyntheticEvent) => {
      e.preventDefault();

      post(
         `/api/product/save/${mode === "edit" && selectedProduct ? selectedProduct.uuid : ""}`,
         {
            preserveScroll: true,
            only: ["products", "flash"], // reload only products and flash props
            // onStart: () => {}, // can be used to set a loading state if needed
            // onFinish: () => {}, // can be used to reset loading state
            onError: (errors) => {
               console.log("Validation Errors:", errors);
            },
            onSuccess: () => {
               reset();
               clearErrors();
               setMode("add");
               setSelectedProduct(null);

               // Close modal after showing success message
               setTimeout(() => {
                  const closeButton = document.querySelector(
                     '[data-overlay="#product-modal"]',
                  ) as HTMLElement;

                  closeButton?.click();
               }, 1300);
            },
         },
      );
   };

   const openAddProductModal = () => {
      reset(); // clear form
      setMode("add");
      setSelectedProduct(null);
      clearErrors(); // clear validation errors

      // Reset whole_item mode states
      setItemType(ITEM_TYPES.PER_ITEM);
      setWholeItemCostPrice("");
      setPieces("");
   };

   const openEditProductModal = (product: Product) => {
      reset(); // clear form
      setMode("edit");
      setSelectedProduct(product);
      clearErrors(); // clear validation errors

      // Reset whole_item mode states to defaults
      setItemType(ITEM_TYPES.PER_ITEM);
      setWholeItemCostPrice("");
      setPieces("");

      setData((prev) => ({
         ...prev,
         product_uuid: product.uuid,
         store_id,
         name: product.name,
         brand: product.brand || "",
         description: product.description || "",
         stock_quantity: String(product.stock_quantity),
         cost_price: String(product.cost_price),
         selling_price: String(product.selling_price),
         tags: product.tags || [],
      }));
   };

   type FormFields = keyof typeof errors;
   const hasError = (field: FormFields) => Boolean(errors[field]);

   const itemTypeOnChangeHandler: React.ChangeEventHandler<HTMLInputElement> = (
      e,
   ) => {
      const value = e.target
         .value as (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];
      setItemType(value);
   };

   /**
    * Allows:
    * - empty string
    * - integers
    * - decimals up to 2 places
    *
    * Examples:
    * "", "1", "1.", "1.2", "1.23"
    */
   const decimalRegex = /^\d*\.?\d{0,2}$/;

   /**
    * Higher-order function that returns an onChange handler for decimal inputs.
    */
   const handleDecimalInput =
      (
         setter: React.Dispatch<React.SetStateAction<string>>,
      ): React.ChangeEventHandler<HTMLInputElement> =>
      (e) => {
         const value = e.target.value;

         if (value === "") {
            setter("");
            return;
         }

         if (!decimalRegex.test(value)) {
            return;
         }

         setter(value);
      };

   /**
    * Normalize input to have at most 2 decimal places on blur.
    * If input is invalid (e.g. negative number, non-numeric), reset to empty string.
    * This ensures that even if the user pastes an invalid value, it will be corrected on blur.
    */
   const normalizeToTwoDecimals = (
      value: string,
      setter: React.Dispatch<React.SetStateAction<string>>,
   ) => {
      if (value === "") return;

      const parsed = Number(value);

      if (isNaN(parsed) || parsed < 0) {
         setter("");
         return;
      }

      setter(parsed.toFixed(2));
   };

   const wholeItemCostPriceOnChangeHandler = handleDecimalInput(
      setWholeItemCostPrice,
   );
   const piecesOnChangeHandler = handleDecimalInput(setPieces);

   const sellingPriceOnChangeHandler: React.ChangeEventHandler<
      HTMLInputElement
   > = (e) => {
      const value = e.target.value;

      // allow clearing
      if (value === "") {
         setData("selling_price", "");
         clearErrors("selling_price");
         return;
      }

      // reject invalid decimal input
      if (!decimalRegex.test(value)) {
         return;
      }

      setData("selling_price", value);
      clearErrors("selling_price");
   };

   const wholeItemCostPriceOnBlurHandler: React.FocusEventHandler<
      HTMLInputElement
   > = () => {
      normalizeToTwoDecimals(wholeItemCostPrice, setWholeItemCostPrice);
   };

   const piecesOnBlurHandler: React.FocusEventHandler<
      HTMLInputElement
   > = () => {
      normalizeToTwoDecimals(pieces, setPieces);
   };

   const sellingPriceOnBlurHandler: React.FocusEventHandler<
      HTMLInputElement
   > = () => {
      if (data.selling_price === "") return;
      const normalized = Number(data.selling_price).toFixed(2);
      setData("selling_price", normalized);
   };

   // On each re-render, these blocks runs. From here
   const wholeCost = Number(wholeItemCostPrice);
   const piecesCount = Number(pieces);

   const perItemCost =
      wholeCost > 0 && piecesCount > 0 ? wholeCost / piecesCount : 0;
   const normalizedPerItemCost = perItemCost > 0 ? perItemCost.toFixed(2) : "";

   const sellingPrice = Number(data.selling_price || 0);
   const calculatedProfit =
      sellingPrice > 0 && perItemCost > 0
         ? Math.max(sellingPrice - perItemCost, 0).toFixed(2)
         : "0.00";
   // To here

   useEffect(() => {
      if (
         data.cost_price !== normalizedPerItemCost &&
         ITEM_TYPES.WHOLE_ITEM === itemType
      ) {
         setData("cost_price", normalizedPerItemCost);
         setData("stock_quantity", piecesCount.toString());
      }
   }, [normalizedPerItemCost, setData, data.cost_price, piecesCount, itemType]);

   return (
      <>
         <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title">Product List</h3>

                  <button
                     data-theme="mintlify"
                     className="btn btn-primary btn-sm py-5 px-6"
                     aria-haspopup="dialog"
                     aria-expanded="false"
                     aria-controls="product-modal"
                     data-overlay="#product-modal"
                     onClick={openAddProductModal}
                  >
                     <span className="icon-[tabler--plus] size-4"></span>
                     Add Product
                  </button>
               </div>

               <div className="card w-full">
                  <div className="overflow-x-auto">
                     <table className="table table-sm">
                        <thead>
                           <tr>
                              <th>Name</th>
                              <th>Brand</th>
                              <th>Cost Price</th>
                              <th>Selling Price</th>
                              <th>Profit</th>
                              <th>Stock</th>
                              <th>Status</th>
                              <th className="text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {products.data.length > 0 ? (
                              products.data.map((product) => {
                                 const stockValue = Number(
                                    product.stock_quantity,
                                 );
                                 const status =
                                    stockValue > 15
                                       ? {
                                            label: "Available",
                                            style: "badge-soft badge-success",
                                         }
                                       : stockValue > 0
                                         ? {
                                              label: "Low stock",
                                              style: "badge-soft badge-warning",
                                           }
                                         : {
                                              label: "Out of stock",
                                              style: "badge-soft badge-error",
                                           };

                                 return (
                                    <tr key={product.uuid}>
                                       <td>{product.name}</td>
                                       <td>{product.brand || "-"}</td>
                                       <td>
                                          ₱
                                          {Number(product.cost_price).toFixed(
                                             2,
                                          )}
                                       </td>
                                       <td>
                                          ₱
                                          {Number(
                                             product.selling_price,
                                          ).toFixed(2)}
                                       </td>
                                       <td>
                                          ₱
                                          {(
                                             Number(product.selling_price) -
                                             Number(product.cost_price)
                                          ).toFixed(2)}
                                       </td>
                                       <td>{product.stock_quantity}</td>
                                       <td>
                                          <span
                                             className={`badge ${status.style} text-xs`}
                                          >
                                             {status.label}
                                          </span>
                                       </td>
                                       <td className="text-right space-x-1">
                                          <button
                                             className="btn btn-circle btn-text btn-sm"
                                             aria-label="Add stocks"
                                             // aria-controls="product-modal"
                                             // data-overlay="#product-modal"
                                             onClick={() =>
                                                alert("Ready to add stocks")
                                             }
                                          >
                                             <span className="icon-[tabler--cube-plus] size-5"></span>
                                          </button>
                                          <button
                                             className="btn btn-circle btn-text btn-sm"
                                             aria-label="Edit"
                                             aria-controls="product-modal"
                                             data-overlay="#product-modal"
                                             onClick={() =>
                                                openEditProductModal(product)
                                             }
                                          >
                                             <span className="icon-[tabler--pencil] size-5"></span>
                                          </button>
                                          <button
                                             className="btn btn-circle btn-text btn-sm"
                                             aria-label="Delete"
                                          >
                                             <span className="icon-[tabler--trash] size-5"></span>
                                          </button>
                                          <button
                                             className="btn btn-circle btn-text btn-sm"
                                             aria-label="More"
                                          >
                                             <span className="icon-[tabler--dots-vertical] size-5"></span>
                                          </button>
                                       </td>
                                    </tr>
                                 );
                              })
                           ) : (
                              <tr>
                                 <td colSpan={8} className="text-center py-8">
                                    <p className="text-base-content/50">
                                       No products found
                                    </p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Pagination */}
               {products.last_page > 1 && (
                  <div className="flex items-center justify-between mt-2 pt-4 border-base-300">
                     <div className="text-sm text-gray-500">
                        Showing {products.from} to {products.to} of{" "}
                        {products.total} products
                     </div>

                     <div className="flex gap-2">
                        {/* Previous Button */}
                        {products.prev_page_url ? (
                           <Link
                              href={products.prev_page_url}
                              className="btn btn-sm btn-outline"
                              preserveScroll
                           >
                              <span className="icon-[tabler--chevron-left] size-4"></span>
                              Previous
                           </Link>
                        ) : (
                           <button
                              className="btn btn-sm btn-outline opacity-50 cursor-not-allowed"
                              disabled
                           >
                              <span className="icon-[tabler--chevron-left] size-4"></span>
                              Previous
                           </button>
                        )}

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                           {products.links.map((link, idx) => {
                              // Skip the first and last links (prev/next)
                              if (
                                 link.label.includes("Previous") ||
                                 link.label.includes("Next") ||
                                 link.label === "&laquo;" ||
                                 link.label === "&raquo;"
                              ) {
                                 return null;
                              }

                              return (
                                 <Link
                                    key={idx}
                                    href={link.url || "#"}
                                    className={`btn btn-sm ${
                                       link.active
                                          ? "custom-primary"
                                          : "btn-outline"
                                    }`}
                                    preserveScroll
                                 >
                                    {link.label}
                                 </Link>
                              );
                           })}
                        </div>

                        {/* Next Button */}
                        {products.next_page_url ? (
                           <Link
                              href={products.next_page_url}
                              className="btn btn-sm btn-outline"
                              preserveScroll
                           >
                              Next
                              <span className="icon-[tabler--chevron-right] size-4"></span>
                           </Link>
                        ) : (
                           <button
                              className="btn btn-sm btn-outline opacity-50 cursor-not-allowed"
                              disabled
                           >
                              Next
                              <span className="icon-[tabler--chevron-right] size-4"></span>
                           </button>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Save Product Modal (Add / Edit) */}
         <div
            id="product-modal"
            className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 modal-middle hidden"
            role="dialog"
            tabIndex={-1}
         >
            <div className="modal-dialog">
               <div className="modal-content">
                  <div className="modal-header">
                     <h3 className="modal-title">{`${mode === "edit" ? "Edit" : "Add"} Product`}</h3>
                     <button
                        type="button"
                        className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
                        aria-label="Close"
                        data-overlay="#product-modal"
                     >
                        <span className="icon-[tabler--x] size-4"></span>
                     </button>
                  </div>
                  <div className="modal-body">
                     {flash.success !== null && (
                        <FlashAlert
                           key={flash.success}
                           type="success"
                           message={flash.success ?? ""}
                        />
                     )}
                     {flash.error !== null && (
                        <FlashAlert
                           key={flash.error}
                           type="error"
                           message={flash.error ?? ""}
                        />
                     )}
                     <form id="product-form" onSubmit={saveProduct}>
                        <div className="w-full space-y-2">
                           <label
                              className="label-text font-medium"
                              htmlFor="name"
                           >
                              Name
                           </label>
                           <input
                              id="name"
                              data-theme="mintlify"
                              type="text"
                              className={`input w-full ${hasError("name") ? "is-invalid" : ""}`}
                              value={data.name}
                              onChange={(e) => {
                                 setData("name", e.target.value);
                                 clearErrors("name");
                              }}
                           />
                           {hasError("name") && (
                              <p className="mt-1 text-sm text-red-500">
                                 {errors.name}
                              </p>
                           )}
                        </div>
                        <div className="w-full space-y-2">
                           <label className="label-text" htmlFor="brand">
                              <span className="font-medium">Brand</span>
                              <span> (optional)</span>
                           </label>
                           <input
                              id="brand"
                              data-theme="mintlify"
                              type="text"
                              className={`input w-full ${hasError("brand") ? "is-invalid" : ""}`}
                              value={data.brand}
                              onChange={(e) => {
                                 setData("brand", e.target.value);
                                 clearErrors("brand");
                              }}
                           />
                           {hasError("brand") && (
                              <p className="mt-1 text-sm text-red-500">
                                 {errors.brand}
                              </p>
                           )}
                        </div>
                        <div className="w-full space-y-2">
                           <label className="label-text" htmlFor="description">
                              <span className="font-medium">Description</span>
                              <span> (optional)</span>
                           </label>
                           <input
                              id="description"
                              data-theme="mintlify"
                              type="text"
                              className={`input w-full ${hasError("description") ? "is-invalid" : ""}`}
                              value={data.description}
                              onChange={(e) => {
                                 setData("description", e.target.value);
                                 clearErrors("description");
                              }}
                           />
                           {hasError("description") && (
                              <p className="mt-1 text-sm text-red-500">
                                 {errors.description}
                              </p>
                           )}
                        </div>

                        <div className="w-full space-y-2 my-4">
                           <div className="flex items-center gap-1">
                              <input
                                 data-theme="mintlify"
                                 type="radio"
                                 name="item_type"
                                 value="per_item"
                                 id="itemTypeRadio1"
                                 className="radio radio-primary"
                                 checked={itemType === "per_item"}
                                 onChange={(e) => itemTypeOnChangeHandler(e)}
                              />
                              <label htmlFor="itemTypeRadio1">Per Item</label>

                              <input
                                 data-theme="mintlify"
                                 type="radio"
                                 name="item_type"
                                 value="whole_item"
                                 id="itemTypeRadio2"
                                 className="radio radio-primary ms-3"
                                 checked={itemType === "whole_item"}
                                 onChange={(e) => itemTypeOnChangeHandler(e)}
                              />
                              <label htmlFor="itemTypeRadio2">Whole Item</label>
                           </div>
                        </div>

                        {itemType === ITEM_TYPES.PER_ITEM ? (
                           <>
                              <div className="w-full space-y-2">
                                 <label
                                    className="label-text font-medium"
                                    htmlFor="stock_quantity"
                                 >
                                    Stock Qty
                                 </label>
                                 <input
                                    id="stock_quantity"
                                    data-theme="mintlify"
                                    type="text"
                                    className={`input w-full ${hasError("stock_quantity") ? "is-invalid" : ""}`}
                                    value={data.stock_quantity}
                                    onChange={(e) => {
                                       setData(
                                          "stock_quantity",
                                          e.target.value,
                                       );
                                       clearErrors("stock_quantity");
                                    }}
                                 />
                                 {hasError("stock_quantity") && (
                                    <p className="mt-1 text-sm text-red-500">
                                       {errors.stock_quantity}
                                    </p>
                                 )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="cost_price"
                                    >
                                       Cost Price
                                    </label>
                                    <input
                                       id="cost_price"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("cost_price") ? "is-invalid" : ""}`}
                                       value={data.cost_price}
                                       onChange={(e) => {
                                          setData("cost_price", e.target.value);
                                          clearErrors("cost_price");
                                       }}
                                    />
                                    {hasError("cost_price") && (
                                       <p className="mt-1 text-sm text-red-500">
                                          {errors.cost_price}
                                       </p>
                                    )}
                                 </div>
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="selling_price"
                                    >
                                       Selling Price
                                    </label>
                                    <input
                                       id="selling_price"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("selling_price") ? "is-invalid" : ""}`}
                                       value={data.selling_price}
                                       onChange={(e) => {
                                          setData(
                                             "selling_price",
                                             e.target.value,
                                          );
                                          clearErrors("selling_price");
                                       }}
                                    />
                                    {hasError("selling_price") && (
                                       <p className="mt-1 text-sm text-red-500">
                                          {errors.selling_price}
                                       </p>
                                    )}
                                 </div>
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="whole_item_cost_price"
                                    >
                                       Whole Item Cost Price
                                    </label>
                                    <input
                                       id="whole_item_cost_price"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("cost_price") ? "is-invalid" : ""}`}
                                       value={wholeItemCostPrice}
                                       onChange={(e) =>
                                          wholeItemCostPriceOnChangeHandler(e)
                                       }
                                       onBlur={wholeItemCostPriceOnBlurHandler}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="pieces"
                                    >
                                       Pieces
                                    </label>
                                    <input
                                       id="pieces"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("selling_price") ? "is-invalid" : ""}`}
                                       value={pieces}
                                       onChange={(e) =>
                                          piecesOnChangeHandler(e)
                                       }
                                       onBlur={piecesOnBlurHandler}
                                    />
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="per_item_cost_price"
                                    >
                                       Per Item Cost Price
                                    </label>
                                    <input
                                       id="per_item_cost_price"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("cost_price") ? "is-invalid" : ""}`}
                                       value={data.cost_price}
                                       onChange={() => {
                                          // just to prevent react warning about controlled input.
                                       }}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="selling_price"
                                    >
                                       Selling Price
                                    </label>
                                    <input
                                       id="selling_price"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("selling_price") ? "is-invalid" : ""}`}
                                       value={data.selling_price}
                                       onChange={sellingPriceOnChangeHandler}
                                       onBlur={sellingPriceOnBlurHandler}
                                    />
                                    {hasError("selling_price") && (
                                       <p className="mt-1 text-sm text-red-500">
                                          {errors.selling_price}
                                       </p>
                                    )}
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label
                                       className="label-text font-medium"
                                       htmlFor="profit"
                                    >
                                       Estimated Profit
                                    </label>
                                    <input
                                       id="profit"
                                       data-theme="mintlify"
                                       type="text"
                                       className={`input w-full ${hasError("selling_price") ? "is-invalid" : ""}`}
                                       value={calculatedProfit}
                                       onChange={() => {
                                          // just to prevent react warning about controlled input.
                                       }}
                                    />
                                 </div>
                              </div>
                           </>
                        )}
                        {/* Tags Field */}
                        <div className="w-full space-y-2 mt-4">
                           <label className="label-text" htmlFor="tags">
                              <span className="font-medium">Tags</span>
                              <span> (optional)</span>
                           </label>

                           {/* Input */}
                           <input
                              id="tags"
                              type="text"
                              data-theme="mintlify"
                              className="input input-bordered w-full"
                              placeholder="Type tag and press Enter"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={handleTagKeyDown}
                           />

                           {/* Pills */}
                           <div className="flex flex-wrap gap-2 mb-2">
                              {data.tags.map((tag: string) => (
                                 <span
                                    key={tag}
                                    className="badge badge-primary badge-soft flex items-center gap-1 px-3 py-2"
                                 >
                                    {tag}
                                    <button
                                       type="button"
                                       onClick={() => removeTag(tag)}
                                       className="ml-1"
                                    >
                                       <span className="icon-[tabler--x] size-3"></span>
                                    </button>
                                 </span>
                              ))}
                           </div>

                           {errors.tags && (
                              <p className="text-sm text-red-500 mt-1">
                                 {errors.tags}
                              </p>
                           )}
                        </div>
                     </form>
                  </div>

                  <div className="modal-footer flex justify-end gap-3">
                     <button
                        type="button"
                        data-theme="mintlify"
                        className="btn btn-outline btn-accent"
                        data-overlay="#product-modal"
                     >
                        Cancel
                     </button>

                     {/* Submit Button */}
                     <button
                        type="submit"
                        form="product-form"
                        data-theme="mintlify"
                        className="btn btn-primary px-7"
                        disabled={processing}
                     >
                        {mode === "add" ? "Add" : "Update"}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

Products.layout = (page: React.ReactNode) => (
   <MainPanelLayout title="Products">{page}</MainPanelLayout>
);

export default Products;
