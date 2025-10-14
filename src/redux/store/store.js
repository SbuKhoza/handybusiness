import { configureStore } from "@reduxjs/toolkit"
import tenantReducer from "../slices/tenantSlice"

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
  },
})
