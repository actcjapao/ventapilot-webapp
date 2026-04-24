import MainPanelLayout from "@/components/MainPanelLayout";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Product } from "@/Pages/products/types";
import { CartItem, ProcessDebtResponse, ProcessSaleResponse } from "./types";
import ProcessingAlert from "./ProcessingAlert";

const Products = () => {
   const [query, setQuery] = useState<string>("");
   const [results, setResults] = useState<Product[]>([]);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [showDropdown, setShowDropdown] = useState<boolean>(false);
   const [cartItems, setCartItems] = useState<CartItem[]>([]);

   const [quantity, setQuantity] = useState<string>("1");
   const [invalidQuantity, setInvalidQuantity] = useState<boolean>(false);
   const [cash, setCash] = useState<string>("");
   const [invalidCashAmount, setInvalidCashAmount] = useState<boolean>(false);

   const [isDebt, setIsDebt] = useState<boolean>(false);
   const [invalidCustomerName, setInvalidCustomerName] =
      useState<boolean>(false);
   const [customerName, setCustomerName] = useState<string>("");
   const [dueDate, setDueDate] = useState<string>("");

   const [processSaleResponse, setProcessSaleResponse] = useState<
      ProcessSaleResponse | undefined
   >();
   const [processDebtResponse, setProcessDebtResponse] = useState<
      ProcessDebtResponse | undefined
   >();

   const calculateTotalAmount = () => {
      return cartItems.reduce((total, item) => {
         return total + item.product.selling_price * item.quantity;
      }, 0);
   };

   // Re-triggered every time cartItems changes as calculateTotalAmount is using a state variable
   const totalAmount = calculateTotalAmount();
   const cashAmount = parseFloat(cash) || 0;
   const change = cash === "" ? 0 : cashAmount - totalAmount;

   const fetchProducts = useCallback(async (searchQuery: string) => {
      if (searchQuery.length < 1) {
         setResults([]);
         return;
      }

      try {
         const response = await axios.get(
            `/api/product/search?q=${encodeURIComponent(searchQuery)}`,
         );
         const products = response.data;
         setResults(products);
      } catch (error) {
         console.error("Error fetching products:", error);
         setResults([]);
      }
   }, []);

   useEffect(() => {
      const timeoutId = setTimeout(() => {
         fetchProducts(query);
      }, 300); // Debounce 300ms
      return () => clearTimeout(timeoutId);
   }, [query, fetchProducts]);

   const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setShowDropdown(true);
   };

   const handleSearchInputBlur = () => {
      // Delay hiding to allow click on dropdown
      setTimeout(() => setShowDropdown(false), 150);
   };

   const handleProductSelect = (product: Product) => {
      setQuantity("1");
      setSelectedProduct(product);
      setQuery(product.name);
      setShowDropdown(false);
   };

   const handleQuantityInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
   ) => {
      setInvalidQuantity(false);
      setQuantity(e.target.value);
   };

   const handleAddItem = () => {
      if (!selectedProduct) {
         return;
      }

      const parsedQuantity = parseInt(quantity, 10);
      const normalizedQuantity =
         Number.isNaN(parsedQuantity) || parsedQuantity <= 0
            ? 0
            : parsedQuantity;
      if (normalizedQuantity === 0) {
         setInvalidQuantity(true);
         return;
      }

      setCartItems((currentItems) => {
         // Check if the product is already in the cart, if so, update the quantity
         const existingIndex = currentItems.findIndex(
            (item) => item.product.uuid === selectedProduct.uuid,
         );

         if (existingIndex >= 0) {
            const updatedItems = [...currentItems];
            const existingItem = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
               ...existingItem,
               quantity: existingItem.quantity + normalizedQuantity,
            };
            return updatedItems;
         }

         return [
            ...currentItems,
            { product: selectedProduct, quantity: normalizedQuantity },
         ];
      });

      setSelectedProduct(null);
   };

   const handleRemoveItem = (productUuid: string) => {
      setCartItems((currentItems) =>
         currentItems.filter((item) => item.product.uuid !== productUuid),
      );
   };

   // Reinitialize FlyonUI when component mounts
   // Without this, the modal won't work when navigating to this page via Inertia links
   useEffect(() => {
      // Access the global FlyonUI/HSStaticMethods
      if (window.HSStaticMethods) {
         window.HSStaticMethods.autoInit();
      }
   }, []);

   const processDebt = async (): Promise<boolean> => {
      if (customerName === "") {
         setInvalidCustomerName(true);
         return false;
      }

      try {
         const response = await axios.post("/api/debt", {
            items: cartItems,
            total_amount: totalAmount,
            payment_amount: cashAmount,
            customer_name: customerName,
            ...(dueDate ? { due_date: dueDate } : {}),
         });

         if (response.status === 201) {
            const { data } = response.data;
            setProcessDebtResponse({
               key: data.key,
               status_code: 201,
               message: data.message,
               debt_uuid: data.debt_uuid,
            });

            // Reset after success
            setCustomerName("");
            setInvalidCustomerName(false);
            setDueDate("");
            return true;
         }

         return false;
      } catch (error) {
         if (axios.isAxiosError(error)) {
            setProcessDebtResponse({
               key: error.response?.data.key ?? "error",
               status_code: error.response?.status ?? 500,
               message:
                  error.response?.data.message ||
                  error.response?.data.error ||
                  "Failed to process debt.",
            });
         } else {
            console.error("Unexpected error:", error);
         }
         return false;
      }
   };

   const processSale = async (): Promise<boolean> => {
      if (cash === "" || change < 0) {
         setInvalidCashAmount(true);
         return false;
      }

      try {
         const response = await axios.post("/api/sale", {
            items: cartItems,
            total_amount: totalAmount,
            payment_amount: cashAmount,
            change_amount: change,
         });

         if (response.status === 201) {
            const { data } = response.data;
            setProcessSaleResponse({
               key: data.key,
               status_code: 201,
               message: data.message,
               sale_uuid: data.sale_uuid,
            });

            // Reset after success
            setCash("");
            setInvalidCashAmount(false);
            return true;
         }

         return false;
      } catch (error) {
         if (axios.isAxiosError(error)) {
            setProcessSaleResponse({
               key: error.response?.data.key ?? "error",
               status_code: error.response?.status ?? 500,
               message:
                  error.response?.data.message ||
                  error.response?.data.error ||
                  "Failed to process sale.",
            });
         } else {
            console.error("Unexpected error:", error);
         }
         return false;
      }
   };

   const processItems = async () => {
      const success = isDebt ? await processDebt() : await processSale();

      if (success) {
         setQuery("");
         setSelectedProduct(null);
         setCartItems([]);
         setIsDebt(false);
      }
   };

   useEffect(() => {
      if (!processSaleResponse) {
         return;
      }

      const timer = setTimeout(() => {
         setProcessSaleResponse(undefined);
      }, 5000);

      return () => clearTimeout(timer);
   }, [processSaleResponse]);

   useEffect(() => {
      if (!processDebtResponse) {
         return;
      }

      const timer = setTimeout(() => {
         setProcessDebtResponse(undefined);
      }, 5000);

      return () => clearTimeout(timer);
   }, [processDebtResponse]);

   return (
      <>
         <div className="flex gap-4">
            <div className="w-[70%]">
               <div className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                     <div className="relative max-w-sm">
                        <input
                           data-theme="mintlify"
                           className="input"
                           type="text"
                           value={query}
                           onChange={handleSearchInputChange}
                           onBlur={handleSearchInputBlur}
                           placeholder="Search product..."
                           aria-label="Product search"
                        />
                        {showDropdown && results.length > 0 && (
                           <div className="absolute top-full left-0 right-0 bg-base-100 rounded-box shadow-xl max-h-64 overflow-y-auto z-10">
                              {results.map((product) => (
                                 <div
                                    key={product.uuid}
                                    className="p-2 hover:bg-base-200 cursor-pointer flex justify-between items-center"
                                    onClick={() => handleProductSelect(product)}
                                 >
                                    <span>{product.name}</span>
                                    <span className="text-sm text-gray-500">
                                       ₱{product.selling_price}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                     <div className="mt-2 p-4 bg-base-200 rounded-box">
                        <h5 className="font-semibold mb-1">Product Preview</h5>
                        {selectedProduct ? (
                           <div className="grid grid-cols-3 gap-2">
                              <div>
                                 <label className="block text-sm font-medium">
                                    Name
                                 </label>
                                 <p className="text-base-content">
                                    {selectedProduct.name}
                                 </p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Price
                                 </label>
                                 <p className="text-base-content">
                                    ₱
                                    {Number(
                                       selectedProduct.selling_price,
                                    ).toFixed(2)}
                                 </p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Stock
                                 </label>
                                 <p className="text-base-content">
                                    {selectedProduct.stock_quantity}
                                 </p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Brand
                                 </label>
                                 <p className="text-base-content">
                                    {selectedProduct.brand}
                                 </p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Tags
                                 </label>
                                 <p className="text-base-content">
                                    {selectedProduct.tags.join(", ")}
                                 </p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Quantity
                                 </label>
                                 <input
                                    data-theme="mintlify"
                                    type="number"
                                    className="input max-w-sm mt-2"
                                    aria-label="input"
                                    placeholder="Enter quantity"
                                    value={quantity}
                                    onChange={handleQuantityInputChange}
                                 />
                                 {invalidQuantity && (
                                    <p className="text-sm text-error mt-1">
                                       Please enter a valid quantity.
                                    </p>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <p className="text-gray-500">
                              -- search a product to preview --
                           </p>
                        )}
                        <div className="mt-4">
                           <button
                              data-theme="mintlify"
                              className="btn btn-primary btn-sm"
                              disabled={!selectedProduct}
                              onClick={handleAddItem}
                           >
                              Add item
                           </button>
                        </div>
                     </div>
                     <div className="card w-full mt-2">
                        <div className="overflow-x-auto">
                           <table className="table table-sm">
                              <thead>
                                 <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th className="text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {/* Selected products will be populated here */}
                                 {cartItems.length === 0 ? (
                                    <tr>
                                       <td
                                          colSpan={5}
                                          className="text-center text-sm text-gray-500"
                                       >
                                          No items added yet.
                                       </td>
                                    </tr>
                                 ) : (
                                    cartItems.map((item) => (
                                       <tr key={item.product.uuid}>
                                          <td>{item.product.name}</td>
                                          <td>{item.quantity}</td>
                                          <td>
                                             ₱
                                             {Number(
                                                item.product.selling_price,
                                             ).toFixed(2)}
                                          </td>
                                          <td>
                                             ₱
                                             {(
                                                item.product.selling_price *
                                                item.quantity
                                             ).toFixed(2)}
                                          </td>
                                          <td className="text-right">
                                             <button
                                                className="btn btn-circle btn-text btn-sm"
                                                aria-label="Delete"
                                                onClick={() =>
                                                   handleRemoveItem(
                                                      item.product.uuid,
                                                   )
                                                }
                                             >
                                                <span className="icon-[tabler--trash] size-5"></span>
                                             </button>
                                          </td>
                                       </tr>
                                    ))
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="w-[30%]">
               <div className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                     <h3 className="card-title">Summary</h3>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium">
                              Total Amount
                           </label>
                           <p className="text-lg font-bold">
                              ₱{totalAmount.toFixed(2)}
                           </p>
                        </div>
                        {!isDebt && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Cash
                                 </label>
                                 <input
                                    data-theme="mintlify"
                                    type="number"
                                    className={`input input-bordered w-full mt-1 ${invalidCashAmount ? "is-invalid" : ""}`}
                                    placeholder="Enter cash amount"
                                    min="0"
                                    step="0.01"
                                    value={cash}
                                    disabled={cartItems.length === 0}
                                    onChange={(e) => {
                                       setInvalidCashAmount(false);
                                       setCash(e.target.value);
                                    }}
                                 />
                                 {invalidCashAmount && (
                                    <p className="text-sm text-error mt-1">
                                       Please enter a valid cash amount.
                                    </p>
                                 )}
                              </div>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Change
                                 </label>
                                 <p className="text-lg">₱{change.toFixed(2)}</p>
                              </div>
                           </>
                        )}
                        {isDebt && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium">
                                    Customer Name
                                 </label>
                                 <input
                                    data-theme="mintlify"
                                    type="text"
                                    className={`input input-bordered w-full mt-1 ${invalidCustomerName ? "is-invalid" : ""}`}
                                    placeholder="e.g., Juan dela Cruz"
                                    value={customerName}
                                    disabled={cartItems.length === 0}
                                    onChange={(e) => {
                                       setInvalidCustomerName(false);
                                       setCustomerName(e.target.value);
                                    }}
                                 />
                                 {invalidCustomerName && (
                                    <p className="text-sm text-error mt-1">
                                       Customer name is required.
                                    </p>
                                 )}

                                 <label className="block text-sm font-medium mt-2">
                                    Due date{" "}
                                    <small>
                                       (<i>optional</i>)
                                    </small>
                                 </label>
                                 <input
                                    data-theme="mintlify"
                                    type="date"
                                    className={`input input-bordered w-full mt-1`}
                                    value={dueDate}
                                    disabled={cartItems.length === 0}
                                    onChange={(e) => setDueDate(e.target.value)}
                                 />
                              </div>
                           </>
                        )}
                        {(processSaleResponse || processDebtResponse) && (
                           <ProcessingAlert
                              response={
                                 processSaleResponse ?? processDebtResponse!
                              }
                           />
                        )}
                        <button
                           data-theme="mintlify"
                           className="btn btn-primary w-full"
                           onClick={processItems}
                           disabled={cartItems.length === 0}
                        >
                           Process
                        </button>
                        <div>
                           <div className="flex items-center gap-1">
                              <input
                                 data-theme="mintlify"
                                 id="isDebtCheckbox1"
                                 type="checkbox"
                                 className="checkbox checkbox-primary checkbox-sm"
                                 checked={isDebt}
                                 onChange={(e) => setIsDebt(e.target.checked)}
                                 disabled={cartItems.length === 0}
                              />
                              <label
                                 className="label-text"
                                 htmlFor="isDebtCheckbox1"
                              >
                                 Process as Debt
                              </label>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

Products.layout = (page: React.ReactNode) => (
   <MainPanelLayout title="POS">{page}</MainPanelLayout>
);

export default Products;
