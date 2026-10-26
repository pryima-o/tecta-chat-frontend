import { apiFetch } from "./config";

export interface RegisterData {
  username: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export const authRegister = (data: RegisterData) => {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

export const authLogin = (data: LoginData) => {

  console.log(window.navigator)
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};
export const authLogout = () => {
  return apiFetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
};

export const authGetCurrentUser = () => {

  return apiFetch("/auth/me", {
    method: "GET",
    credentials: "include",
  });
};