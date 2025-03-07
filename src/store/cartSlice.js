import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: JSON.parse(localStorage.getItem('cartItems')) || [],
        cartTotal: Number(localStorage.getItem('cartTotal')) || 0,
    },
    reducers: {
        addToCart: (state, action) => {
            const itemIndex = state.items.findIndex(item => item.productId === action.payload.productId);
        
            if (itemIndex >= 0) {
                state.items[itemIndex].count += action.payload.count;
            } else {
                state.items.push(action.payload);
            }
            state.cartTotal = state.items.reduce((total, item) => total + item.price * item.count, 0);
            localStorage.setItem('cartItems', JSON.stringify(state.items));
            localStorage.setItem('cartTotal', state.cartTotal.toString());
        },
        
        updateQuantity: (state, action) => {
            const itemIndex = state.items.findIndex(item => item.productId === action.payload.id);
            if (itemIndex >= 0) {
                const item = state.items[itemIndex];
                state.cartTotal += (action.payload.count - item.count) * item.price;
                state.items[itemIndex].count = action.payload.count;
                localStorage.setItem('cartItems', JSON.stringify(state.items));
                localStorage.setItem('cartTotal', state.cartTotal.toString());
            }
        },
        removeFromCart: (state, action) => {
            const itemIndex = state.items.findIndex(item => item.productId === action.payload.id);
            if (itemIndex >= 0) {
                state.cartTotal -= state.items[itemIndex].price * state.items[itemIndex].count;
                state.items.splice(itemIndex, 1);
                localStorage.setItem('cartItems', JSON.stringify(state.items));
                localStorage.setItem('cartTotal', state.cartTotal.toString());
            }
        },
        removeVariant: (state, action) => {
            const { productId, variantValue } = action.payload;
            const product = state.items.find(item => item.productId === productId);
            if (product) {
                product.selectedVariants = product.selectedVariants.map(variant => ({
                    ...variant,
                    values: variant.values !== variantValue ? variant.values : ""
                })).filter(variant => variant.values); // Remove empty variants
            }
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        clearCartRedux: (state) => {
            state.items = [];
            state.cartTotal = 0;
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartTotal');
        },
    }
});

export const { addToCart, updateQuantity, removeFromCart, clearCartRedux , removeVariant } = cartSlice.actions;

export default cartSlice.reducer;
