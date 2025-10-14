import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  tenantId: null, // Will be set dynamically from domain detection
  tenantData: null,
  loading: true, // Start as loading until tenant is detected
  error: null,
}

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setTenantId: (state, action) => {
      state.tenantId = action.payload
    },
    setTenantData: (state, action) => {
      state.tenantData = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setTenantId, setTenantData, setLoading, setError } = tenantSlice.actions
export default tenantSlice.reducer
