import { persistReducer } from 'redux-persist';
import reducers from './reducers';
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
const persistConfig = {
  keyPrefix: 'reduxPersist:',
  key: 'root',
  storage: storage,
  serialize: true,
  blacklist: ['routing', 'userData']
};
const persistedReducer = persistReducer(persistConfig, reducers);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
  devTools: process.env.NODE_ENV === "development"
})
