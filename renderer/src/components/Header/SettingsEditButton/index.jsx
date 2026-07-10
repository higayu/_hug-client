import { useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import SettingsModal from '@/components/SettingsModal';

export default function SettingsEditButton({
  className = '',
  onOpen,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <>
      <button
        id="Edit-Settings"
        type="button"
        onClick={handleOpen}
        className={`
          flex w-full items-center justify-center gap-2
          border-none bg-transparent px-4 py-2
          text-center text-sm text-black
          cursor-pointer transition-all hover:bg-gray-400
          ${className}
        `}
        aria-label="設定を編集"
      >
        <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        <span>設定編集</span>
      </button>

      <SettingsModal
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}