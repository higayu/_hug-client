import { useCallback, useEffect } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import { useHugActions } from '@/hooks/useHugActions';
import { useDispatch } from 'react-redux';
import {
  clearLaravelAuthentication,
  setLaravelAuthentication,
} from '@/store/slices/authSlice';

export default function AutoLoginButton() {
  const { handleLogin } = useHugActions();
  const dispatch = useDispatch();

  /**
   * 自動ログインボタン押下時の処理
   */
  const handleLogin_func = useCallback(async () => {
    try {
      const res = await window.electronAPI.jwtAutoLogin();

      if (!res?.success) {
        dispatch(clearLaravelAuthentication());
        console.error(
          'Laravel認証失敗:',
          res?.message,
          res?.error
        );

        return;
      }

      console.log('Laravel認証成功:', res.data?.user);

      dispatch(setLaravelAuthentication({
        user: res?.user ?? res?.data?.user ?? null,
        authenticated: res?.meta?.authenticated === true,
      }));

      await handleLogin();
    } catch (error) {
      dispatch(clearLaravelAuthentication());
      console.error(
        '自動ログイン処理中にエラーが発生しました:',
        error
      );
    }
  }, [dispatch, handleLogin]);

  useEffect(() => {
    document.addEventListener('hug-startup-auto-login', handleLogin_func);
    return () => {
      document.removeEventListener('hug-startup-auto-login', handleLogin_func);
    };
  }, [handleLogin_func]);

  return (
    <nav className="relative z-[1001] ml-0 inline-block min-w-fit flex-shrink-0">
      <button
        id="loginBtn"
        type="button"
        onClick={handleLogin_func}
        className="
          flex
          cursor-pointer
          items-center
          gap-2
          rounded-full
          border-none
          bg-sky-600
          px-4 py-2
          text-left
          text-sm
          text-white
          transition-colors
          hover:bg-gray-800
        "
        aria-label="自動ログイン"
      >
        <ArrowRightOnRectangleIcon
          className="h-5 w-5"
          aria-hidden="true"
        />

        <span>Login</span>
      </button>
    </nav>
  );
}
