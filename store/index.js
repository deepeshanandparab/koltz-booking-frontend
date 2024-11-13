import { legacy_createStore as createStore, applyMiddleware, compose } from "redux";
import { thunk } from 'redux-thunk';
import { combineReducers } from "redux-immer";
import produce from "immer";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// import { userReducer } from "../reducers/UserReducer";
import { authReducer } from "../reducers/AuthReducer";
// import { publicAuthReducer } from "../reducers/PublicAuthReducer";
// import { adminReducer } from "../reducers/AdminReducer";
import { composeWithDevTools } from '@redux-devtools/extension';


const persistConfig = {
  // key: ["authReducer", "publicAuthReducer", "adminReducer"],
  key: ["authReducer"],
  storage: storage,
  // whitelist: ["authReducer", "publicAuthReducer", "adminReducer"],
  whitelist: ["authReducer"],
};

const rootReducer = combineReducers(produce, {
  // publicAuthReducer: publicAuthReducer,
  authReducer: authReducer,
  // userReducer: userReducer,
  // adminReducer: adminReducer,
});

const pReducer = persistReducer(persistConfig, rootReducer);

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const composedEnhancer = composeWithDevTools(applyMiddleware(thunk))

// const store = createStore(
//   pReducer,
//   composeEnhancers(applyMiddleware(thunk))
// );

const store = createStore(pReducer, composedEnhancer)

const persistor = persistStore(store);


// window.store = store;

export { persistor, store };
