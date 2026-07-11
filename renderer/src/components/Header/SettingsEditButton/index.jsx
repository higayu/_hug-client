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
          flex items-center justify-center cursor-pointer
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