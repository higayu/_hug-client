import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import { useHugActions } from '@/hooks/useHugActions';

export default function AutoLoginButton() {
  const { handleLogin } = useHugActions();

  return (
    <nav className="relative z-[1001] ml-0 inline-block min-w-fit flex-shrink-0">
      <button
        id="loginBtn"
        type="button"
        onClick={handleLogin}
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