import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  LoginPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  FirstLoginSetupPayload,
  GoogleAuthPayload,
  ChangePasswordPayload,
  AuthResponseData,
} from "../types";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );
    return response.data.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      payload
    );
    return response.data.data;
  },

  resendOtp: async (payload: ResendOtpPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      payload
    );
    return response.data.data;
  },

  firstLoginSetup: async (payload: FirstLoginSetupPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.FIRST_LOGIN_SETUP,
      payload
    );
    return response.data.data;
  },

  googleAuth: async (payload: GoogleAuthPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.GOOGLE,
      payload
    );
    return response.data.data;
  },

  refreshSession: async (): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {}
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.LOGOUT_ALL
    );
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload
    );
    return response.data.data;
  },
};
