import { defineStore } from "pinia";
import {
  authLogin,
  authRegister,
  authGetCurrentUser,
  authLogout,
} from "@/api/auth";
import router from "@/router";

export interface User {
  id: string;
  username: string;
  displayName: string;
  birthday?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  username: string;
  password: string;
  displayName: string;
}

interface LoginData {
  username: string;
  password: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    isLoading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    currentUser: (state) => state.user,
  },

  actions: {
    async fetchUser() {
      this.isLoading = true;

      try {
        const response = await authGetCurrentUser();
        const user = response?.user ?? response;

        this.user = user;
        return user;
      } catch (error) {
        this.user = null;
        throw error;
      } finally {
        this.isLoading = false;
        this.initialized = true;
      }
    },

    async login(data: LoginData) {
      this.isLoading = true;

      try {
        await authLogin(data);

        // Cookie уже установлена сервером.
        // Получаем актуального пользователя.
        await this.fetchUser();

        return this.user;
      } finally {
        this.isLoading = false;
      }
    },

    async register(data: RegisterData) {
      this.isLoading = true;

      try {
        await authRegister(data);

        // Если register тоже устанавливает session cookie
        await this.fetchUser();

        return this.user;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.user = null;
      this.initialized = true;

      authLogout();

      router.push("/auth/login")
    },
  },
});
