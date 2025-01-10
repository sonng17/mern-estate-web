import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

/*
- Redux toolkit (quản lý state cho FE, truy cập state ở bất kỳ component nào)
  +> store + reducers(state + action)
- Redux persist (tái tạo lại state cho FE khi ng dùng đóng/tắt tab, refresh)
  +> lưu state vào db của browser(localStorage, sessionStorage, hoặc IndexedDB) khi ng dùng đóng tab, web, refresh và có thể tái tạo lại state(do mặc định thì mất data state) 
*/

const rootReducer = combineReducers({ user: userReducer });

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
