import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/themeConfigSlice';
import seatingSlice from '@/store/seatingSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    seating: seatingSlice,
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;