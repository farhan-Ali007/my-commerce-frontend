import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        products: JSON.parse(localStorage.getItem('cartproducts')) || [],
        cartTotal: Number(localStorage.getItem('cartTotal')) || 0,
        freeShipping: false,
        deliveryCharges: 0
    },
    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;
            // console.log("Adding to cart with item:", newItem);

            // Check if the item with the same cartItemId already exists
            const itemIndex = state.products.findIndex(
                item => item.cartItemId === newItem.cartItemId
            );

            if (itemIndex >= 0) {
                // If the same product with the same variants exists, update the quantity
                state.products[itemIndex].count += newItem.count;
            } else {
                // Otherwise, add the new item to the cart
                state.products.push({
                    ...newItem,
                    freeShipping: newItem.freeShipping ?? false,
                    deliveryCharges: newItem.deliveryCharges ?? 0
                });
            }

            // Update cart level freeShipping and deliveryCharges based on products
            state.freeShipping = state.products.every(item => item.freeShipping);
            state.deliveryCharges = state.products.every(item => item.freeShipping) ? 0 : 200;

            // Update the cart total
            state.cartTotal = state.products.reduce((total, item) => total + item.price * item.count, 0);

            // Update localStorage
            localStorage.setItem('cartproducts', JSON.stringify(state.products));
            localStorage.setItem('cartTotal', state.cartTotal.toString());
        },

        updateQuantity: (state, action) => {
            const itemIndex = state.products.findIndex(item => item.cartItemId === action.payload.id);
            if (itemIndex >= 0) {
                const item = state.products[itemIndex];
                state.cartTotal += (action.payload.count - item.count) * item.price;
                state.products[itemIndex].count = action.payload.count;
                
                // Update cart level freeShipping and deliveryCharges
                state.freeShipping = state.products.every(item => item.freeShipping);
                state.deliveryCharges = state.products.every(item => item.freeShipping) ? 0 : 200;
                
                localStorage.setItem('cartproducts', JSON.stringify(state.products));
                localStorage.setItem('cartTotal', state.cartTotal.toString());
            }
        },
        removeFromCart: (state, action) => {
            const itemIndex = state.products.findIndex(item => item.cartItemId === action.payload.id);
            if (itemIndex >= 0) {
                state.cartTotal -= state.products[itemIndex].price * state.products[itemIndex].count;
                state.products.splice(itemIndex, 1);
                
                // Update cart level freeShipping and deliveryCharges
                state.freeShipping = state.products.every(item => item.freeShipping);
                state.deliveryCharges = state.products.every(item => item.freeShipping) ? 0 : 200;
                
                localStorage.setItem('cartproducts', JSON.stringify(state.products));
                localStorage.setItem('cartTotal', state.cartTotal.toString());
            }
        },
        removeVariant: (state, action) => {
            const { productId, variantValue } = action.payload;
            const product = state.products.find(item => item.productId === productId);
            if (product) {
                product.selectedVariants = product.selectedVariants.map(variant => ({
                    ...variant,
                    values: variant.values !== variantValue ? variant.values : ""
                })).filter(variant => variant.values); // Remove empty variants
            }
            localStorage.setItem('cartproducts', JSON.stringify(state.products));
        },
        clearCartRedux: (state) => {
            state.products = [];
            state.cartTotal = 0;
            state.freeShipping = false;
            state.deliveryCharges = 0;
            localStorage.removeItem('cartproducts');
            localStorage.removeItem('cartTotal');
        },
    }
});

export const { addToCart, updateQuantity, removeFromCart, clearCartRedux, removeVariant } = cartSlice.actions;

export default cartSlice.reducer;
