import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ME_KEY } from '@/store/queryKeys';
import { toast } from 'sonner';
import { type ApiError } from '@/types/api';
import {
    loginRequest,
    registerRequest,
    onboard1Request,
    onboardCeremRequest,
    onboardCurrRequest,
    forgotRequest,
    resetRequest,
} from '@/store/requests/auth';

export const useLogin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: loginRequest,
        onSuccess: (res) => {
            localStorage.setItem('auth_token', res.token);
            qc.invalidateQueries({queryKey: [ME_KEY]});
        },
        onError: (err: ApiError) => 
            toast.error(err.response?.data?.message ?? "Login failed"),
    })
};

export const useRegister = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: registerRequest,
        onSuccess: (res) => {
            localStorage.setItem('auth_token', res.token);
            qc.invalidateQueries({ queryKey: [ME_KEY] });
        },
        onError: (err: ApiError) =>
            toast.error(err.response?.data?.message ?? "Registration failed"),
    });
};

export const useOnboard1 = () =>
    useMutation({
        mutationFn: onboard1Request,
        onError: (err: ApiError) =>
            toast.error(err.response?.data?.message ?? "Something went wrong"),
    });

export const useOnboardCeremonies = () =>
  useMutation({
    mutationFn: onboardCeremRequest,
    onError: (err: ApiError) => toast.error(err.response?.data?.message ?? 'Something went wrong'),
  });

export const useOnboardCurrencies = () =>
  useMutation({
    mutationFn: onboardCurrRequest,
    onError: (err: ApiError) => toast.error(err.response?.data?.message ?? 'Something went wrong'),
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotRequest,
    onError: (err: ApiError) => toast.error(err.response?.data?.message ?? 'Something went wrong'),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetRequest,
    onError: (err: ApiError) => toast.error(err.response?.data?.message ?? 'Something went wrong'),
  });